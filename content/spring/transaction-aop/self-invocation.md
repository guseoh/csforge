---
kind: concept
contentKey: spring.core.transaction-aop.self-invocation
topicContentKey: spring.core.transaction-aop
slug: self-invocation
title: "self-invocation 함정"
summary: "proxy mode에서 같은 객체 내부의 this 호출은 proxy를 다시 통과하지 않으므로 내부 method의 @Transactional advice가 새롭게 적용되지 않는 이유와 해결 방향을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html#transaction-declarative-annotations-method-visibility"
    title: "Spring Framework Reference: @Transactional Method Visibility and Proxy Mode"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "proxy mode에서 external calls만 intercepted되고 self-invocation이 advice를 적용하지 않는 공식 설명 확인"
---
# self-invocation 함정

다음 코드는 겉으로 보면 `place()`가 `saveOrder()`를 호출하므로 `saveOrder()`의 `@Transactional`이 적용될 것처럼 보입니다.

```java
@Service
class OrderService {

    public void place() {
        saveOrder();
    }

    @Transactional
    public void saveOrder() {
        orderRepository.save(...);
    }
}
```

하지만 proxy mode의 핵심은 **외부 caller가 proxy를 통해 target으로 들어갈 때 advice가 실행된다**는 점입니다. `place()` target method 안에서 `this.saveOrder()`에 해당하는 내부 호출은 같은 target object의 method를 직접 호출합니다.

```text
External Caller
    │
    ▼
OrderService Proxy
    │ place()에 transaction advice 없음
    ▼
Target.place()
    │ this.saveOrder()
    └──────────────► Target.saveOrder()
                     ▲
                     └ proxy를 다시 통과하지 않음
```

따라서 내부 `saveOrder()` annotation이 기대한 transaction boundary를 새로 만들지 않을 수 있습니다.

### 이미 외부 method에 transaction이 있다면 결과가 달라 보일 수 있다

```java
@Transactional
public void place() {
    saveOrder();
}
```

이 경우 외부 caller가 `place()` proxy를 통과하면서 이미 transaction이 시작됩니다. 내부 `saveOrder()`가 self-invocation이라 별도 advice를 적용받지 않아도 같은 thread의 기존 transaction 안에서 repository 작업이 수행될 수 있습니다.

그래서 self-invocation bug는 “항상 transaction이 없다”가 아니라 **내부 method에 선언한 propagation/rollback/readOnly 같은 transaction metadata가 독립 interception point로 적용되지 않는다**는 문제입니다.

### `REQUIRES_NEW`가 특히 오해를 잘 만든다

```java
@Transactional
public void batch() {
    saveOne();
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void saveOne() { ... }
```

개발자가 `saveOne()`마다 새로운 transaction이 열릴 것으로 기대해도 self-invocation이면 proxy가 `REQUIRES_NEW` metadata를 처리하지 않습니다. 결과적으로 outer transaction 하나에서 실행될 수 있습니다.

### 해결은 “자기 proxy를 억지로 호출”보다 경계를 다시 보는 데서 시작한다

가장 읽기 쉬운 해결은 transaction boundary가 실제 use-case/협력 경계와 맞도록 object 책임을 나누는 것입니다.

```java
@Service
class BatchService {
    private final ItemSaveService itemSaveService;

    void batch() {
        itemSaveService.saveOne(); // 다른 Bean proxy 경계를 통과
    }
}

@Service
class ItemSaveService {
    @Transactional(propagation = REQUIRES_NEW)
    public void saveOne() { ... }
}
```

`AopContext.currentProxy()`나 자기 자신을 주입받아 호출하는 workaround도 가능할 수 있지만 framework coupling과 recursion/가독성 문제가 커집니다. 먼저 **왜 내부 method가 별도의 transaction boundary여야 하는가**를 설계적으로 확인합니다.

### private method annotation을 기대하는 문제와도 연결된다

proxy가 어떤 method visibility를 intercept할 수 있는지는 proxy 방식과 Spring version/configuration에 따라 주의가 필요합니다. 중요한 원칙은 annotation이 source에 존재하는 것과 **실제 method invocation이 transaction interceptor를 통과하는 것**을 구분하는 것입니다.

self-invocation을 debug할 때는 annotation 개수보다 call graph를 그립니다. `caller -> proxy -> target` 경로가 어디에서 시작되고 내부 호출이 proxy로 되돌아가는지 확인하면 transaction이 기대와 다른 이유를 훨씬 빠르게 찾을 수 있습니다.

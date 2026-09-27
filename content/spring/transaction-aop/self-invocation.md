---
kind: concept
contentKey: spring.core.transaction-aop.self-invocation
topicContentKey: spring.core.transaction-aop
slug: self-invocation
title: "내부 호출(self-invocation) 함정"
summary: "proxy 방식에서 같은 객체 내부의 `this` 호출은 proxy를 다시 통과하지 않으므로 내부 메서드의 @Transactional 부가 동작이 새롭게 적용되지 않는 이유와 해결 방향을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html#transaction-declarative-annotations-method-visibility"
    title: "Spring Framework Reference: @Transactional Method Visibility and Proxy Mode"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "proxy 방식에서 외부 호출만 가로채며 내부 호출은 새 advice 적용 지점이 되지 않는 공식 설명 확인"
  - url: "https://techblog.woowahan.com/2617/"
    title: "AOP를 이용한 OAuth2 캐시 적용하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "proxy 기반 AOP에서 self-invocation이 advice를 우회하는 실무 사례를 보충하되 세부 계약은 공식 문서를 따른다."
    displayOrder: 2
    relationNote: "AOP proxy 내부 호출이 advice 적용을 우회하는 운영 코드 사례 확인"
---
# 내부 호출(self-invocation) 함정

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

하지만 proxy 방식의 핵심은 **외부 호출자가 proxy를 통해 실제 객체로 들어갈 때 advice가 실행된다**는 점입니다. `place()` 메서드 안에서 `this.saveOrder()`에 해당하는 내부 호출은 같은 실제 객체의 메서드를 직접 호출합니다.

```text
외부 호출자
    │
    ▼
OrderService Proxy
    │ place()에는 트랜잭션 advice 없음
    ▼
실제 객체의 place()
    │ this.saveOrder()
    └──────────────► 실제 객체의 saveOrder()
                     ▲
                     └ proxy를 다시 통과하지 않음
```

따라서 내부 `saveOrder()`에 붙은 `@Transactional` 설정이 별도의 새로운 트랜잭션 경계로 적용되지 않을 수 있습니다.

### 바깥 메서드에 이미 트랜잭션이 있다면 결과가 달라 보일 수 있다

```java
@Transactional
public void place() {
    saveOrder();
}
```

이 경우 외부 호출자가 `place()`의 proxy를 통과하면서 이미 트랜잭션이 시작됩니다. 내부 `saveOrder()`가 self-invocation이라 별도 advice를 적용받지 않아도 같은 실행 흐름의 기존 트랜잭션 안에서 Repository 작업이 수행될 수 있습니다.

그래서 self-invocation 문제는 “항상 트랜잭션이 없다”가 아니라 **내부 메서드에 선언한 propagation·rollback·readOnly 같은 트랜잭션 설정이 별도의 가로채기 지점으로 적용되지 않는다**는 문제입니다.

### `REQUIRES_NEW`가 특히 오해를 잘 만든다

```java
@Transactional
public void batch() {
    saveOne();
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void saveOne() { ... }
```

개발자가 `saveOne()`마다 새로운 트랜잭션이 열릴 것으로 기대해도 self-invocation이면 proxy가 `REQUIRES_NEW` 설정을 처리하지 않습니다. 결과적으로 바깥 트랜잭션 하나에서 실행될 수 있습니다.

### 해결은 “자기 proxy를 억지로 호출”하기보다 경계를 다시 보는 데서 시작한다

가장 읽기 쉬운 해결은 트랜잭션 경계가 실제 기능·협력 경계와 맞도록 객체 책임을 나누는 것입니다.

```java
@Service
class BatchService {
    private final ItemSaveService itemSaveService;

    void batch() {
        itemSaveService.saveOne(); // 다른 Bean의 proxy 경계를 통과
    }
}

@Service
class ItemSaveService {
    @Transactional(propagation = REQUIRES_NEW)
    public void saveOne() { ... }
}
```

`AopContext.currentProxy()`나 자기 자신을 주입받아 호출하는 우회 방법도 가능할 수 있지만 프레임워크 결합과 재귀 호출 위험, 가독성 비용이 커집니다. 먼저 **왜 내부 메서드가 별도의 트랜잭션 경계여야 하는가**를 설계적으로 확인합니다.

### private 메서드 annotation 문제와도 연결된다

proxy가 어떤 메서드 가시성을 가로챌 수 있는지는 proxy 방식과 Spring 버전·설정에 따라 주의가 필요합니다. 중요한 원칙은 annotation이 소스에 존재하는 것과 **실제 메서드 호출이 transaction interceptor를 통과하는 것**을 구분하는 것입니다.

self-invocation을 디버깅할 때는 annotation 개수보다 호출 그래프를 그립니다. `호출자 -> proxy -> 실제 객체` 경로가 어디에서 시작되고 내부 호출이 proxy를 다시 통과하는지를 확인하면 트랜잭션이 기대와 다른 이유를 훨씬 빠르게 찾을 수 있습니다.

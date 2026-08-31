---
kind: concept
contentKey: spring.core.transaction-aop.transaction-proxy
topicContentKey: spring.core.transaction-aop
slug: transaction-proxy
title: "@Transactional proxy"
summary: "Spring declarative transaction이 proxy/interceptor를 통해 method 호출을 감싸고 transaction manager가 기존 transaction 참여·신규 시작·commit·rollback을 결정하는 흐름을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html"
    title: "Spring Framework Reference: Understanding the Spring Framework's Declarative Transaction Implementation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "AOP proxy, TransactionInterceptor, TransactionManager의 declarative transaction 흐름 확인"
  - url: "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html"
    title: "Spring Framework Reference: Using @Transactional"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "@Transactional default propagation/isolation/rollback semantics 확인"
---
# @Transactional proxy

`@Transactional` method 안에 들어가면 DB transaction이 열린다는 설명은 출발점으로는 쓸 수 있지만 실제 동작을 이해하기에는 부족합니다. Spring의 전형적인 proxy mode에서는 caller가 target object를 직접 호출하는 대신 **transaction advice가 적용된 proxy를 통과할 때** declarative transaction이 시작됩니다.

```java
@Service
class OrderService {
    @Transactional
    public void place(PlaceOrderCommand command) {
        orderRepository.save(...);
        inventoryRepository.decrease(...);
    }
}
```

외부 Bean이 이 method를 호출할 때의 큰 흐름은 다음과 같습니다.

```text
Caller
  │
  ▼
OrderService Proxy
  │
  ▼
TransactionInterceptor
  │
  ├─ transaction attribute 읽기
  ├─ TransactionManager에게 기존 transaction 확인/시작 요청
  │
  ▼
Target OrderService.place()
  │
  ├─ 정상 반환 -> commit 판단
  └─ exception -> rollback rule 판단
  │
  ▼
TransactionManager commit / rollback
```

### `@Transactional`이 붙었다고 매번 새 transaction을 만드는 것은 아니다

기본 propagation인 `REQUIRED`에서는 이미 현재 thread/execution context에 참여 가능한 transaction이 있으면 그 transaction에 참여하고, 없으면 새 transaction을 시작합니다.

```text
외부 transaction 없음
Caller -> proxy -> 새 transaction T1 -> method

외부 transaction T0 존재
Caller -> proxy -> T0에 참여 -> method
```

그래서 “method마다 transaction 하나”라고 세면 틀릴 수 있습니다. propagation이 `REQUIRES_NEW`, `NESTED` 등으로 바뀌면 suspend/savepoint 지원 여부 등 semantics가 달라질 수 있고 transaction manager/resource 종류에 따라 지원 범위도 확인해야 합니다.

### proxy는 DB isolation 자체를 구현하지 않는다

Spring transaction interceptor는 transaction 경계를 만들고 `PlatformTransactionManager` 같은 abstraction에 resource transaction 관리를 위임합니다. 실제 row visibility, lock, MVCC는 database가 수행합니다.

```text
Spring @Transactional
   -> transaction boundary / propagation / rollback policy

Database
   -> isolation / locks / MVCC / commit durability
```

`@Transactional(isolation = ...)`이 DB에 isolation 요청을 전달할 수는 있지만 isolation의 실제 보장은 DB engine의 계약입니다.

### transaction은 method가 끝난 뒤 commit될 수 있다

```java
@Transactional
public void create() {
    repository.save(entity);
    System.out.println("saved");
}
```

`save` line을 지나거나 method 마지막 statement에 도달했다고 commit이 끝난 것은 아닙니다. target method가 정상 반환된 뒤 proxy/interceptor가 transaction completion을 처리하는 구조입니다. flush도 commit 전 또는 query 실행 조건에 의해 일어날 수 있습니다.

이 차이는 constraint violation이 method body 내부가 아니라 flush/commit 시점에 드러나는 경우를 설명할 때 중요합니다.

### proxy boundary를 통과했는지가 핵심이다

annotation은 metadata이고 실제 interception이 적용되어야 transaction advice가 실행됩니다. object를 Spring 밖에서 직접 `new`해서 호출하거나 같은 object 내부에서 `this`로 호출하는 경우 proxy path가 달라집니다. 뒤의 self-invocation Concept이 여기에서 이어집니다.

### transaction을 길게 잡는 것이 항상 안전하지 않다

```java
@Transactional
public void checkout() {
    repository.update(...);
    paymentClient.callRemoteApi(); // 5초 대기 가능
    repository.update(...);
}
```

DB transaction을 연 채 remote API를 오래 기다리면 connection/lock을 오래 점유할 수 있습니다. 모든 상태를 한 atomic boundary에 넣고 싶은 마음과 external system이 DB transaction에 참여하지 않는 현실을 구분해야 합니다. 필요한 경우 state machine, idempotency, outbox/compensation 같은 더 넓은 consistency 설계가 필요합니다.

`@Transactional`을 이해한다는 것은 annotation option을 암기하는 것이 아니라 **caller가 proxy를 통과한 순간부터 target 반환 이후 completion까지 어디에서 transaction 상태가 바뀌는지**를 설명할 수 있다는 뜻입니다.

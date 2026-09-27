---
kind: concept
contentKey: spring.core.transaction-aop.transaction-proxy
topicContentKey: spring.core.transaction-aop
slug: transaction-proxy
title: "@Transactional 프록시"
summary: "Spring 선언적 트랜잭션이 proxy와 TransactionInterceptor로 메서드 호출을 감싸고 transaction manager가 기존 트랜잭션 참여·신규 시작·commit·rollback을 결정하는 흐름을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html"
    title: "Spring Framework Reference: Understanding the Spring Framework's Declarative Transaction Implementation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "AOP proxy, TransactionInterceptor, TransactionManager의 선언적 트랜잭션 흐름 확인"
  - url: "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html"
    title: "Spring Framework Reference: Using @Transactional"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "@Transactional 기본 propagation·isolation·rollback 의미 확인"
---
# @Transactional 프록시

`@Transactional` 메서드 안에 들어가면 DB 트랜잭션이 열린다는 설명은 출발점으로는 쓸 수 있지만 실제 동작을 이해하기에는 부족합니다. Spring의 전형적인 proxy 방식에서는 외부 호출자가 대상 객체를 직접 호출하는 대신 **트랜잭션 부가 동작이 적용된 proxy를 통과할 때** 선언적 트랜잭션 처리가 시작됩니다.

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

외부 Bean이 이 메서드를 호출할 때의 큰 흐름은 다음과 같습니다.

```text
호출자
  │
  ▼
OrderService Proxy
  │
  ▼
TransactionInterceptor
  │
  ├─ 트랜잭션 속성 읽기
  ├─ TransactionManager에 기존 트랜잭션 확인·시작 요청
  │
  ▼
실제 OrderService.place()
  │
  ├─ 정상 반환 -> commit 판단
  └─ 예외       -> rollback 규칙 판단
  │
  ▼
TransactionManager commit / rollback
```

### `@Transactional`이 붙었다고 매번 새 트랜잭션을 만드는 것은 아니다

기본 propagation인 `REQUIRED`에서는 현재 실행 흐름에 참여 가능한 트랜잭션이 이미 있으면 그 트랜잭션에 참여하고, 없으면 새 트랜잭션을 시작합니다.

```text
기존 트랜잭션 없음
호출자 -> proxy -> 새 트랜잭션 T1 -> 메서드

기존 트랜잭션 T0 존재
호출자 -> proxy -> T0에 참여 -> 메서드
```

그래서 “메서드마다 트랜잭션 하나”라고 세면 틀릴 수 있습니다. `REQUIRES_NEW`, `NESTED`처럼 propagation이 바뀌면 기존 트랜잭션 일시 중단이나 savepoint 지원 여부 등 의미가 달라질 수 있고, 사용 중인 transaction manager와 자원이 무엇인지에 따라 지원 범위도 확인해야 합니다.

### proxy는 DB 격리 자체를 구현하지 않는다

Spring의 transaction interceptor는 트랜잭션 경계를 만들고 `PlatformTransactionManager` 같은 추상화에 실제 자원 트랜잭션 관리를 위임합니다. 행 가시성, 잠금, MVCC 같은 동시성 동작은 데이터베이스가 수행합니다.

```text
Spring @Transactional
   -> 트랜잭션 경계 / propagation / rollback 정책

Database
   -> isolation / lock / MVCC / commit 내구성
```

`@Transactional(isolation = ...)`이 DB에 격리 수준을 요청할 수는 있지만 실제 보장은 사용하는 DB 엔진의 계약입니다.

### 메서드가 끝난 뒤에 commit이 일어날 수 있다

```java
@Transactional
public void create() {
    repository.save(entity);
    System.out.println("saved");
}
```

`save()` 호출을 지나거나 메서드 마지막 문장에 도달했다고 commit이 끝난 것은 아닙니다. 실제 메서드가 정상 반환된 뒤 proxy와 interceptor가 트랜잭션 완료 처리를 수행할 수 있습니다. flush도 commit 전이나 특정 쿼리 실행 전에 일어날 수 있습니다.

이 차이는 UNIQUE 제약 위반 같은 오류가 메서드 본문이 아니라 flush·commit 시점에 드러나는 경우를 설명할 때 중요합니다.

### proxy 경계를 통과했는지가 핵심이다

annotation은 설정 정보이고 실제 호출이 가로채져야 트랜잭션 부가 동작이 실행됩니다. 객체를 Spring 밖에서 직접 `new`해 호출하거나 같은 객체 내부에서 `this`로 다른 메서드를 호출하면 proxy 경로가 달라집니다. 뒤의 내부 호출(self-invocation) Concept이 여기에서 이어집니다.

### DB 트랜잭션을 길게 잡는 것이 항상 안전하지는 않다

```java
@Transactional
public void checkout() {
    repository.update(...);
    paymentClient.callRemoteApi(); // 5초 대기 가능
    repository.update(...);
}
```

DB 트랜잭션을 연 채 원격 API를 오래 기다리면 DB connection이나 lock을 오래 점유할 수 있습니다. 모든 상태를 하나의 원자적 경계에 넣고 싶은 요구와 외부 시스템이 로컬 DB 트랜잭션에 참여하지 않는 현실은 구분해야 합니다. 필요한 경우 상태 머신, 멱등성, outbox, 보상 작업 같은 더 넓은 일관성 설계를 검토합니다.

`@Transactional`을 이해한다는 것은 annotation 옵션을 외우는 것이 아니라 **호출자가 proxy를 통과한 순간부터 실제 메서드 반환 이후 트랜잭션 완료까지 어디에서 상태가 바뀌는지**를 설명할 수 있다는 뜻입니다.

---
kind: concept
contentKey: spring.core.transaction-aop.rollback-rule
topicContentKey: spring.core.transaction-aop
slug: rollback-rule
title: "rollback 규칙"
summary: "Spring 선언적 트랜잭션이 예외를 관찰해 rollback·commit을 결정하는 기본 규칙과 rollbackFor/noRollbackFor, 예외를 잡아 삼킨 경우, rollback-only 상태를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html"
    title: "Spring Framework Reference: Rolling Back a Declarative Transaction"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "RuntimeException/Error 기본 rollback과 checked exception 기본 commit, 규칙 변경 방식 확인"
  - url: "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html"
    title: "Spring Framework Reference: Using @Transactional"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "Framework 6.2부터 설정할 수 있는 전체 예외 rollback 기본 정책 확인"
---
# rollback 규칙

`@Transactional` 안에서 예외가 발생하면 모두 rollback된다고 외우면 실제 코드에서 쉽게 틀립니다. Spring 선언적 트랜잭션은 실제 메서드 호출 결과를 interceptor가 관찰하고 **트랜잭션 속성의 rollback 규칙에 따라** rollback 여부를 판단합니다.

기본적으로 전형적인 선언적 트랜잭션에서는 `RuntimeException`과 `Error`가 rollback 대상이고 검사 예외(checked exception)는 기본 rollback 대상이 아닙니다.

Framework 6.2부터는 트랜잭션 관리 설정에서 애플리케이션의 기본 rollback 정책을 `ALL_EXCEPTIONS`로 바꿔 검사 예외도 rollback되게 할 수 있습니다. 이는 개별 annotation 규칙이 없는 경우의 전역 기본값을 바꾸는 설정이며, 예외별 차이가 필요하면 개별 rollback 규칙을 계속 명시할 수 있습니다.

```java
@Transactional
public void importFile() throws IOException {
    repository.save(...);
    throw new IOException("read failed");
}
```

별도 규칙이 없다면 검사 예외인 `IOException`이 밖으로 나왔다고 자동 rollback된다고 단정할 수 없습니다.

### 예외 타입과 업무 의미가 맞는지 본다

```java
@Transactional(rollbackFor = IOException.class)
public void importFile() throws IOException { ... }
```

실패 시 DB 변경을 반드시 되돌려야 한다면 `rollbackFor`로 규칙을 명시할 수 있습니다. 반대로 특정 `RuntimeException`에서도 commit을 유지해야 하는 특별한 의미가 있다면 `noRollbackFor`를 사용할 수 있습니다.

하지만 annotation 옵션을 늘리기 전에 예외 계층이 애플리케이션의 실패 의미를 잘 표현하는지 먼저 보는 편이 좋습니다.

### 예외를 catch해서 삼키면 interceptor는 정상 반환으로 볼 수 있다

```java
@Transactional
public void place() {
    try {
        payment();
    } catch (RuntimeException e) {
        log.warn("payment failed", e);
        return;
    }
}
```

예외가 트랜잭션 경계 밖으로 나오지 않고 메서드가 정상 반환하면 interceptor는 그 예외를 직접 보지 못합니다. 내부 작업이 트랜잭션을 rollback-only로 표시했다면 commit 시 `UnexpectedRollbackException` 같은 결과가 나타날 수도 있지만, **예외를 catch했다는 사실 자체가 rollback을 보장하지는 않습니다.**

실패를 복구해 정상 결과로 바꾼 것인지, 전체 기능을 실패시켜야 하는지 정책을 분명히 해야 합니다.

### DB rollback은 외부 API의 효과를 되돌리지 않는다

```java
@Transactional
public void place() {
    orderRepository.save(order);
    paymentClient.charge();
    throw new RuntimeException();
}
```

DB 트랜잭션이 rollback되어도 이미 외부 PG에서 승인된 결제는 자동으로 취소되지 않습니다.

```text
DB INSERT --------┐
                  ├─ 예외 -> DB rollback 가능
외부 결제 승인 ----┘                ▲
     │                              │
     └ 이미 외부 시스템에서 성공 ---- 자동 rollback 대상 아님
```

이런 분산 부수 효과에는 멱등성, 보상·환불, 상태 대사(reconciliation) 같은 별도 설계가 필요합니다.

### rollback-only 상태를 알아야 “예외를 잡았는데 왜 commit이 안 됐지?”를 이해한다

내부 트랜잭션 작업이 참여 중인 트랜잭션을 rollback-only로 표시한 뒤 바깥 코드가 예외를 잡고 계속 진행할 수 있습니다. 바깥 메서드가 정상 종료해 commit을 요청해도 transaction manager는 이미 rollback-only인 상태를 보고 실제 rollback할 수 있습니다.

```text
T1 시작
  -> 내부 작업 실패
  -> T1 rollback-only
  -> 바깥 코드가 예외를 잡고 계속
  -> 바깥 메서드 정상 반환
  -> commit 요청
  -> 실제 rollback / UnexpectedRollbackException 가능
```

rollback 규칙을 이해할 때는 “예외가 났는가?”뿐 아니라 **transaction interceptor가 어떤 예외를 보았고 현재 트랜잭션 상태가 무엇인지**를 함께 추적해야 합니다.

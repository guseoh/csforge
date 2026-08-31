---
kind: concept
contentKey: spring.core.transaction-aop.rollback-rule
topicContentKey: spring.core.transaction-aop
slug: rollback-rule
title: "rollback 규칙"
summary: "Spring declarative transaction이 exception을 관찰해 rollback/commit을 결정하는 기본 규칙과 rollbackFor/noRollbackFor, exception swallowing, rollback-only 상태를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html"
    title: "Spring Framework Reference: Rolling Back a Declarative Transaction"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "RuntimeException/Error 기본 rollback과 checked exception 기본 commit, rule customization 확인"
---
# rollback 규칙

`@Transactional` 안에서 exception이 발생하면 모두 rollback된다고 외우면 실제 운영 코드에서 쉽게 틀립니다. Spring declarative transaction은 target method 호출 결과를 interceptor가 관찰하고 **transaction attribute의 rollback rule에 따라** rollback 여부를 판단합니다.

기본적으로 전형적인 declarative transaction에서는 `RuntimeException`과 `Error`는 rollback 대상이고 checked exception은 기본 rollback 대상이 아닙니다.

```java
@Transactional
public void importFile() throws IOException {
    repository.save(...);
    throw new IOException("read failed");
}
```

별도 rule이 없다면 checked `IOException`이라고 해서 자동 rollback된다고 단정할 수 없습니다.

### exception type과 business 의미가 맞는지 본다

```java
@Transactional(rollbackFor = IOException.class)
public void importFile() throws IOException { ... }
```

실패 시 DB 변경을 반드시 되돌려야 한다면 `rollbackFor`로 rule을 명시할 수 있습니다. 반대로 특정 runtime exception에서도 commit을 유지해야 하는 특별한 의미가 있다면 `noRollbackFor`를 사용할 수 있습니다.

하지만 annotation option을 늘리기 전에 exception hierarchy가 application 실패 의미를 잘 표현하는지 먼저 보는 편이 좋습니다.

### exception을 catch해서 삼키면 interceptor가 정상 반환으로 볼 수 있다

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

exception이 transaction boundary 밖으로 나오지 않고 method가 정상 반환하면 interceptor는 기본적으로 그 exception을 직접 보지 못합니다. 내부 operation이 transaction을 rollback-only로 표시했다면 commit 시 `UnexpectedRollbackException` 같은 결과가 나타날 수도 있지만, **catch 자체가 rollback을 보장하는 것은 아닙니다.**

실패를 복구해서 정상 결과로 바꾸는 것인지, 전체 use case를 실패시켜야 하는지 정책을 분명히 해야 합니다.

### rollback은 외부 API를 되돌리지 않는다

```java
@Transactional
public void place() {
    orderRepository.save(order);
    paymentClient.charge();
    throw new RuntimeException();
}
```

DB transaction이 rollback되어도 이미 외부 PG가 승인한 결제는 자동 취소되지 않습니다.

```text
DB INSERT --------┐
                  ├─ exception -> DB rollback 가능
External charge --┘                ▲
     │                              │
     └ 이미 외부 시스템에서 성공 ---- 자동 rollback 대상 아님
```

이런 distributed side effect에는 idempotency, compensation, status reconciliation 같은 별도 설계가 필요합니다.

### rollback-only 상태를 알아야 “catch했는데 왜 commit이 안 됐지?”를 이해한다

inner transactional operation이 참여 중인 transaction을 rollback-only로 표시한 뒤 outer code가 exception을 catch하고 계속 진행할 수 있습니다. outer method가 정상 종료해 commit을 요청해도 transaction manager는 이미 rollback-only인 상태를 보고 실제 rollback할 수 있습니다.

```text
T1 시작
  -> inner 실패
  -> T1 rollback-only
  -> outer catch 후 계속
  -> outer 정상 return
  -> commit 요청
  -> 실제 rollback / UnexpectedRollbackException 가능
```

rollback rule을 이해할 때는 “exception이 났나?”뿐 아니라 **transaction interceptor가 어떤 exception을 봤고 현재 transaction 상태가 무엇인지**를 함께 추적해야 합니다.

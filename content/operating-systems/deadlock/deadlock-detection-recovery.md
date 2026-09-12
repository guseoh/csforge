---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-detection-recovery
topicContentKey: operating-systems.core.deadlock
slug: deadlock-detection-recovery
title: "Detection and Recovery"
summary: "deadlock을 허용한 뒤 dependency를 탐지하고 victim abort·rollback·resource 회수로 progress를 복구하는 전략을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/7_Deadlocks.html"
    title: "Operating Systems: Deadlocks — UIC Course Notes"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "resource-allocation graph, safe state, Banker avoidance와 deadlock detection/recovery를 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/10963"
    title: "스레드 덤프 분석하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "JVM thread dump에서 lock owner와 waiter를 연결해 deadlock cycle을 해석하는 실제 사례를 확인한다."
    displayOrder: 2
---
# Detection and Recovery

### 정상 실행에는 덜 제한을 걸고, 실제 deadlock이 생기면 찾아서 끊는다

Prevention과 avoidance는 deadlock 가능성을 줄이는 대신 정상 request에도 ordering 제약이나 safe-state 계산 비용을 부과한다. Detection strategy는 resource allocation을 더 자유롭게 허용하고, 주기적으로 또는 suspicious wait가 생겼을 때 실제 dependency를 조사한다.

Single-instance resource에서는 wait-for graph cycle을 찾는 방식이 대표적이다. Multi-instance resource에서는 `Available`, `Allocation`, 현재 `Request`를 이용해 어떤 execution도 더 완료할 수 없는 집합을 계산해야 한다.

```text
resource allocation
       ↓
owner / waiter relation 수집
       ↓
deadlock dependency 존재?
   ┌───┴────┐
  no       yes
  │         ↓
continue  victim 선택
            ↓
      abort / rollback
            ↓
      resource release
            ↓
       retry or fail
```

### Detection 주기 자체도 비용과 장애 영향의 trade-off다

매 resource request마다 cycle을 검사하면 deadlock을 빠르게 발견할 수 있지만 graph 수집과 탐지 비용이 커진다. 반대로 너무 늦게 검사하면 deadlocked execution이 resource를 오래 보유하고 그 뒤에 새로운 waiter가 쌓여 영향 범위가 커질 수 있다.

따라서 detection frequency는 알고리즘만의 문제가 아니라 deadlock 발생 빈도, resource hold cost, recovery cost를 함께 고려하는 운영 정책이다.

### Cycle을 찾았다고 mutex만 빼앗아서는 안 된다

Owner가 protected state를 중간까지만 변경한 상태일 수 있다. 이때 lock object만 다른 thread에 넘기면 mutual exclusion은 회복된 것처럼 보여도 protected invariant는 이미 깨질 수 있다.

그래서 recovery는 보통 state를 되돌릴 수 있는 boundary와 함께 설계한다. Transaction이라면 victim transaction abort/rollback, process라면 restart, 재구성 가능한 resource라면 명시적 preemption처럼 **일관된 상태로 돌아갈 방법**이 필요하다.

### Victim 선택이 새로운 starvation을 만들 수 있다

항상 가장 오래 걸린 같은 transaction을 victim으로 고르면 그 transaction은 매번 rollback되어 영원히 완료하지 못할 수 있다. Victim 정책에는 이미 수행한 work, priority, age, rollback cost, retry count와 외부 side effect 여부 같은 요소를 고려할 수 있다.

Recovery는 deadlock cycle 하나를 끊는 데서 끝나는 것이 아니라, 반복 recovery가 또 다른 liveness 문제를 만들지 않는지도 봐야 한다.

### Timeout은 관측 신호이지 deadlock의 증명은 아니다

오래 기다렸다는 timeout은 deadlock에서도 보이지만 단순 lock contention, 느린 I/O, overloaded resource에서도 나타난다. Deadlock이라고 판단하려면 owner와 waiter dependency가 cycle을 이루는지 확인해야 한다.

Backend에서는 rollback 가능한 DB state와 이미 외부 API나 message에 반영된 side effect를 구분해야 한다. 자동 retry까지 연결하려면 idempotency와 partial-effect 처리도 별도의 application contract로 필요하다.

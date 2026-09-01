---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-detection-recovery
topicContentKey: operating-systems.core.deadlock
slug: deadlock-detection-recovery
title: "Detection and Recovery"
summary: "deadlock을 허용한 뒤 wait-for dependency를 탐지하고 victim abort·rollback·resource 회수로 복구하는 전략을 설명한다."
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
---
# Detection and Recovery

### deadlock을 막지 않고 발생 후 찾는 전략

prevention이나 avoidance는 deadlock 가능성을 줄이기 위해 정상 요청에도 제약과 비용을 부과한다. detection approach는 더 자유롭게 resource를 할당하되, 주기적이거나 suspicious wait가 발생했을 때 dependency graph를 검사해 실제 deadlock을 찾는다.

single-instance resource라면 wait-for graph에서 process cycle을 찾는 방식이 대표적이다. 여러 instance가 있는 resource에서는 available/allocation/request 정보를 이용하는 더 일반적인 detection algorithm이 필요하다.

### 탐지 빈도에도 비용 trade-off가 있다

매 resource request마다 cycle을 검사하면 빠르게 발견할 수 있지만 detection overhead가 커진다. 너무 늦게 검사하면 deadlocked process 뒤에 다른 waiter가 더 쌓이고 영향 범위가 넓어진다. deadlock 발생 빈도와 stuck 상태의 비용에 따라 검사 주기를 정한다.

### 찾은 뒤에는 반드시 누군가의 작업을 버려야 할 수 있다

cycle을 찾았다고 lock을 임의로 빼앗아도 되는 것은 아니다. protected state가 중간 mutation 상태라면 강제 resource preemption이 invariant를 깨뜨릴 수 있다. 그래서 recovery는 보통 victim process/transaction을 abort하고 rollback하거나, rollback 가능한 resource만 preempt하는 식으로 명확한 boundary를 사용한다.

victim 선택에는 이미 수행한 work, priority, rollback cost, retry 횟수와 외부 side effect 여부를 고려한다. 항상 같은 victim을 고르면 recovery 자체가 starvation을 만들 수도 있다.

### timeout은 detection signal일 수 있지만 proof는 아니다

오래 기다렸다는 timeout은 deadlock 가능성을 알려주는 symptom일 수 있지만 단순 contention이나 slow I/O도 같은 현상을 만든다. timeout만 보고 deadlock이라 단정하지 말고 owner/waiter dependency를 확인해야 한다.

Backend에서는 DB transaction rollback으로 되돌릴 수 있는 effect와 이미 외부 API·message에 반영된 effect를 구분해야 한다. deadlock recovery 뒤 자동 retry를 하려면 idempotency와 partial-effect 처리까지 같이 설계해야 한다.

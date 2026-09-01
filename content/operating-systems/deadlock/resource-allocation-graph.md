---
kind: concept
contentKey: operating-systems.core.deadlock.resource-allocation-graph
topicContentKey: operating-systems.core.deadlock
slug: resource-allocation-graph
title: "Resource-Allocation Graph"
summary: "process-resource hold/request edge와 wait-for cycle로 deadlock state를 분석한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/7_Deadlocks.html"
    title: "Operating Systems: Deadlocks — UIC Course Notes"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "resource-allocation graph, safe state, Banker avoidance와 deadlock detection/recovery를 확인한다."
    displayOrder: 1
---
# Resource-Allocation Graph

### 누가 보유하고 누가 요청하는지를 edge로 만든다

resource-allocation graph에서는 process/thread node와 resource node를 분리하고 두 종류의 edge를 그릴 수 있다. process가 resource를 요청하며 기다리면 `P → R`, resource instance가 process에 할당되어 있으면 `R → P`처럼 표현한다.

예를 들어 다음 상태를 생각해 보자.

```
R1 → P1 → R2 → P2 → R1
```

P1은 R1을 보유하고 R2를 기다리며, P2는 R2를 보유하고 R1을 기다린다. 각 resource type에 instance가 하나뿐이라면 이 cycle은 두 process가 서로 진행할 수 없는 deadlock을 나타낸다.

### resource instance 수가 늘면 cycle 해석이 달라진다

resource type마다 instance가 하나뿐인 모델에서는 cycle과 deadlock 관계가 단순하다. 하지만 동일 resource type에 여러 instance가 있으면 graph에 cycle이 있다는 사실만으로 모든 요청을 만족할 다른 instance가 없는지까지 확정할 수 없다. allocation/available count와 남은 request를 추가로 계산해야 한다.

이 때문에 single-instance wait-for graph detection과 multi-instance safety/detection algorithm이 구분된다.

### wait-for graph는 resource node를 접어 process dependency를 본다

single-instance resource에서는 `P1이 P2가 가진 resource를 기다린다`를 바로 `P1 → P2`로 나타내는 wait-for graph를 만들 수 있다. 여기서 cycle을 찾으면 어떤 execution들이 서로를 기다리는지 바로 볼 수 있다.

### 실제 장애 분석에서는 여러 관측 소스를 합친다

thread dump는 JVM monitor owner/waiter를, database lock view는 transaction 간 row/table wait를, connection pool metric은 permit wait를 보여 줄 수 있다. cross-layer deadlock을 찾으려면 이 정보를 `owner → waiter` dependency 관점에서 연결해야 한다.

단순 timeout log만 남기지 말고 resource identifier, owner, waiter, acquisition/wait 시작 시각을 기록하면 cycle을 복원하기 쉬워진다.

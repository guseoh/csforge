---
kind: concept
contentKey: operating-systems.core.deadlock.resource-allocation-graph
topicContentKey: operating-systems.core.deadlock
slug: resource-allocation-graph
title: "Resource-Allocation Graph"
summary: "process-resource 요청·allocation edge를 이용해 dependency cycle과 deadlock 가능성을 추적한다."
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
  - url: "https://d2.naver.com/helloworld/10963"
    title: "스레드 덤프 분석하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "JVM thread dump에서 lock owner와 waiter를 연결해 deadlock cycle을 해석하는 실제 사례를 확인한다."
    displayOrder: 2
---
# Resource-Allocation Graph

### '누가 요청하고 누가 보유하는가'를 방향 있는 edge로 바꾼다

Deadlock을 로그 문장으로만 보면 여러 thread와 resource 관계가 뒤섞이기 쉽다. Resource-allocation graph는 process/thread와 resource를 서로 다른 node로 두고 **요청과 allocation을 방향으로 표현**해 dependency를 보이게 한다.

![요청 edge와 allocation edge로 만든 resource-allocation graph](/learning/operating-systems/resource-allocation-graph.svg)

기본 edge 의미는 다음과 같다.

```text
P ──request──> R
R ──allocated──> P
```

예를 들어 `R1 → P1 → R2 → P2 → R1`이면 P1은 R1을 보유하고 R2를 요청하며, P2는 R2를 보유하고 R1을 요청한다.

### Single-instance에서는 cycle이 deadlock을 정확히 가리킨다

R1과 R2가 각각 한 instance뿐이라면 cycle 안의 process가 기다리는 resource를 대신 제공할 다른 instance가 없다. 따라서 다음 cycle은 deadlock이다.

```text
R1 → P1 → R2 → P2 → R1
```

이 경우 cycle은 deadlock의 필요조건이면서 충분조건으로 사용할 수 있다.

### Multi-instance에서는 cycle만 보고 확정하면 안 된다

같은 resource type에 여러 instance가 있으면 cycle 안의 요청을 **다른 available instance가 만족시킬 가능성**이 남을 수 있다. 어떤 process가 먼저 완료해 allocation을 반환하면 cycle에 있던 다른 process도 진행할 수 있다.

따라서 multi-instance model에서는 graph 모양만 보지 않고 `Available`, 현재 `Allocation`, 남은 `Request/Need` 수량까지 계산해야 한다. 여기서 중요한 경계는 `cycle이 있다`와 `현재 어떤 completion sequence도 없다`가 같은 말이 아니라는 점이다.

### Wait-for graph는 resource node를 접어 process dependency만 남긴다

Single-instance resource라면 `P1이 P2가 가진 resource를 기다린다`를 `P1 → P2`처럼 축약할 수 있다. 이 wait-for graph에서 cycle을 찾으면 실제로 서로를 기다리는 execution 집합을 바로 볼 수 있다.

```text
P1 → P2 → P3
↑         │
└─────────┘
```

### 실제 장애에서는 서로 다른 관측 소스를 한 graph로 연결한다

JVM thread dump는 monitor owner와 waiter를 보여 주고, DB lock view는 transaction 간 row/table wait를 보여 주며, pool metric은 permit 대기를 보여 줄 수 있다. Cross-layer deadlock을 확인하려면 각 도구의 출력 자체보다 **owner와 waiter가 어떻게 이어지는지**를 연결해야 한다.

단순 timeout log만 남기지 않고 resource identifier, owner, waiter, acquisition 시각과 wait 시작 시각을 함께 남기면 dependency graph를 복원하기 훨씬 쉽다.

---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-avoidance
topicContentKey: operating-systems.core.deadlock
slug: deadlock-avoidance
title: "Deadlock Avoidance"
summary: "미래 최대 요구량을 이용해 요청 승인 후에도 safe state를 유지하는 avoidance를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/7_Deadlocks.html"
    title: "Operating Systems: Deadlocks — UIC Course Notes"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "resource-allocation graph, safe state, Banker avoidance와 deadlock detection/recovery를 확인한다."
    displayOrder: 1
---
# Deadlock Avoidance

### 요청을 받을 때마다 '그 뒤에도 모두 끝날 수 있는가'를 본다

avoidance는 Coffman condition을 애초에 제거하지 않고도, resource request를 승인한 결과가 **safe state**인지 검사해 unsafe state로 들어가는 요청을 보류하는 전략이다. 이를 위해 현재 available resource, 각 process에 이미 할당된 resource와 앞으로 필요할 수 있는 최대량 같은 추가 정보가 필요하다.

safe state는 `지금 deadlock이 아니다`보다 더 강한 의미를 가진다. 현재 allocation에서 어떤 순서로 process를 완료시키면 각 process의 남은 최대 요구를 만족하고 resource를 다시 회수할 수 있는 **safe sequence가 존재한다**는 뜻이다.

### unsafe state와 deadlock state는 같지 않다

unsafe state는 아직 현재 process들이 모두 block된 deadlock이 아닐 수 있다. 다만 미래에 각 process가 최대 claim까지 resource를 요청하면 deadlock을 피할 completion sequence를 보장할 수 없는 상태다. avoidance는 이런 상태에 들어가는 request까지 미리 거절하거나 기다리게 한다.

### Banker's algorithm의 핵심 reasoning

대표적인 multi-instance model에서 다음 값을 둔다.

- `Available`: 현재 남은 resource 수
- `Max[i]`: process i가 최대로 필요하다고 선언한 수
- `Allocation[i]`: 현재 process i가 가진 수
- `Need[i] = Max[i] - Allocation[i]`

`Need[i] <= Work`인 process를 하나 골라 끝낼 수 있다고 가정하고, 끝나면 그 process가 가진 Allocation을 Work에 돌려준다. 모든 process를 이런 순서로 완료시킬 수 있으면 safe state다.

### 현실 시스템에 그대로 적용하기 어려운 이유

많은 backend workload는 요청이 앞으로 DB connection, memory, external resource를 최대 얼마나 필요로 할지 정확한 claim을 미리 알기 어렵다. 그래서 실제 server에서 `timeout이나 lease를 쓰면 avoidance다`라고 표현하면 부정확하다. timeout은 waiting/recovery 정책일 수 있지만 Banker's-style safe-state avoidance와는 다른 접근이다.

avoidance의 핵심 trade-off는 **미래 resource demand 정보를 요구하고, 안전을 위해 당장 가능한 request도 보수적으로 지연할 수 있다는 것**이다.

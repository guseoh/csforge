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

Deadlock avoidance는 Coffman 조건을 없애지 않는다. 대신 새로운 resource 요청을 승인했을 때도 **모든 process가 어떤 순서로든 끝날 수 있는 safe state가 유지되는지** 확인한 뒤 요청을 허용한다.

이 판단에는 현재 남은 resource뿐 아니라 각 process가 앞으로 최대 얼마까지 요구할 수 있는지에 대한 정보가 필요하다.

### Safe state와 현재 deadlock은 다른 개념이다

Safe state에는 모든 process를 완료시킬 수 있는 적어도 하나의 **safe sequence**가 존재한다. 반대로 unsafe state는 앞으로 최대 요구량까지 고려했을 때 completion을 보장할 sequence가 없다는 뜻이다. Unsafe하다고 해서 현재 즉시 circular wait에 빠져 있다는 뜻은 아니다.

![Available과 Need를 이용해 safe sequence를 찾는 흐름](/learning/operating-systems/deadlock-avoidance-safe-sequence.svg)

### Banker's algorithm의 기본 계산

대표적인 모델에서는 다음 값을 사용한다.

- `Available`: 현재 사용 가능한 resource 수
- `Max[i]`: process i의 최대 요구량
- `Allocation[i]`: 현재 할당량
- `Need[i] = Max[i] - Allocation[i]`

예를 들어 resource가 총 10개이고 다음 상태라고 하자.

| Process | Allocation | Max | Need |
| --- | ---: | ---: | ---: |
| P1 | 3 | 7 | 4 |
| P2 | 2 | 4 | 2 |
| P3 | 2 | 5 | 3 |

현재 `Available = 3`이다. 먼저 Need가 2인 P2를 완료할 수 있고, P2가 가진 2개를 반환하면 5개를 사용할 수 있다. 그러면 P1을 완료하고 다시 3개를 반환한 뒤 P3도 완료할 수 있다.

```text
Available 3
→ P2 완료, 2 반환 → 5
→ P1 완료, 3 반환 → 8
→ P3 완료

safe sequence: P2 → P1 → P3
```

이 sequence를 실제 scheduler가 그대로 실행해야 한다는 뜻은 아니다. **적어도 하나의 완료 가능한 순서가 존재한다는 사실**을 확인하는 것이다.

Deadlock Avoidance의 대가는 최대 resource 요구량을 미리 알아야 하고, 당장 줄 수 있는 resource라도 safe state를 깨면 보수적으로 요청을 미뤄야 한다는 점이다.
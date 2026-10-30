---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-avoidance
topicContentKey: operating-systems.core.deadlock
slug: deadlock-avoidance
title: "교착 회피(Deadlock Avoidance)"
summary: "미래 최대 요구량을 이용해 새 요청을 승인한 뒤에도 안전 상태를 유지하는 교착 회피를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/7_Deadlocks.html"
    title: "Operating Systems: Deadlocks — UIC Course Notes"
    referenceType: COURSE
    language: en
    depth: section
    recommendation: "resource-allocation graph, safe state, Banker avoidance와 deadlock detection/recovery를 확인한다."
    displayOrder: 1
---
# 교착 회피(Deadlock Avoidance)

교착 회피는 코프먼 조건 자체를 없애지 않는다. 대신 새로운 자원 요청을 승인한 뒤에도 **모든 프로세스를 어떤 순서로든 완료시킬 수 있는 안전 상태(safe state)가 유지되는지** 확인한 다음 요청을 허용한다.

이 판단에는 현재 남은 자원뿐 아니라 각 프로세스가 앞으로 최대 얼마까지 요구할 수 있는지에 대한 정보가 필요하다.

### 안전 상태와 현재 교착 상태는 다른 개념이다

안전 상태에는 모든 프로세스를 완료시킬 수 있는 적어도 하나의 **안전 순서(safe sequence)**가 존재한다. 반대로 불안전 상태(unsafe state)는 앞으로 가능한 최대 요구량까지 고려했을 때 모든 프로세스의 완료를 보장할 순서가 없다는 뜻이다. 불안전하다고 해서 현재 즉시 순환 대기에 빠져 있다는 뜻은 아니다.

![Available과 Need를 이용해 safe sequence를 찾는 흐름](/learning/operating-systems/deadlock-avoidance-safe-sequence.svg)

### 은행원 알고리즘의 기본 계산

대표적인 모델에서는 다음 값을 사용한다.

- `Available`: 현재 사용 가능한 자원 수
- `Max[i]`: 프로세스 i의 최대 요구량
- `Allocation[i]`: 현재 할당량
- `Need[i] = Max[i] - Allocation[i]`

예를 들어 자원이 총 10개이고 다음 상태라고 하자.

| Process | Allocation | Max | Need |
| --- | ---: | ---: | ---: |
| P1 | 3 | 7 | 4 |
| P2 | 2 | 4 | 2 |
| P3 | 2 | 5 | 3 |

현재 `Available = 3`이다. 먼저 남은 필요량이 2인 P2를 완료할 수 있고, P2가 보유한 2개를 반환하면 사용 가능 자원은 5개가 된다. 그러면 P1을 완료해 3개를 반환한 뒤 P3도 완료할 수 있다.

```text
Available 3
→ P2 완료, 2 반환 → 5
→ P1 완료, 3 반환 → 8
→ P3 완료

safe sequence: P2 → P1 → P3
```

이 순서를 실제 스케줄러가 그대로 실행해야 한다는 뜻은 아니다. **적어도 하나의 완료 가능한 순서가 존재함을 확인하는 안전성 검사**다.

교착 회피의 대가는 최대 자원 요구량을 미리 알아야 하고, 당장 할당할 수 있는 자원이라도 그 요청이 안전 상태를 깨뜨린다면 보수적으로 미뤄야 한다는 점이다.

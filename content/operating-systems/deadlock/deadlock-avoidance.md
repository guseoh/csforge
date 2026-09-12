---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-avoidance
topicContentKey: operating-systems.core.deadlock
slug: deadlock-avoidance
title: "Deadlock Avoidance"
summary: "미래 최대 요구량을 이용해 request 승인 후에도 safe state를 유지하는 avoidance를 설명한다."
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

### '지금 줄 수 있는가'보다 '주고 나서도 모두 끝낼 수 있는가'를 본다

Avoidance는 Coffman condition을 구조적으로 제거하지 않는다. 대신 resource request를 승인한다고 가정한 뒤에도 **모든 process를 어떤 순서로 완료시킬 수 있는 safe state가 유지되는지** 검사한다.

그러려면 현재 남은 resource만 알아서는 부족하다. 각 process가 이미 받은 allocation과 앞으로 최대 얼마까지 필요할 수 있는지에 대한 정보가 필요하다.

![Available과 Need를 이용해 safe sequence를 찾는 흐름](/learning/operating-systems/deadlock-avoidance-safe-sequence.svg)

### Safe state는 '현재 deadlock이 아님'보다 강한 조건이다

Safe state에는 모든 process를 완료시킬 수 있는 적어도 하나의 **safe sequence**가 존재한다. 어떤 process의 남은 최대 요구를 현재 available resource로 만족시켜 완료할 수 있고, 그 process가 가진 allocation을 돌려받은 뒤 다음 process를 같은 방식으로 완료시킬 수 있어야 한다.

반대로 unsafe state가 곧 현재 deadlock이라는 뜻은 아니다. 아직 execution들이 동작하고 circular wait가 생기지 않았을 수 있지만, 앞으로 각 process가 선언한 최대 claim까지 요청할 경우 모두의 completion을 보장하는 sequence가 없다는 뜻이다.

### Banker's algorithm은 Need와 Work를 갱신하며 completion 가능성을 검사한다

대표적인 multi-instance model에서는 다음 값을 둔다.

- `Available`: 현재 남아 있는 resource 수
- `Max[i]`: process i가 최대로 필요하다고 선언한 수
- `Allocation[i]`: 현재 process i가 보유한 수
- `Need[i] = Max[i] - Allocation[i]`

예를 들어 resource가 총 10개이고 현재 allocation이 다음과 같다고 하자.

| Process | Allocation | Max | Need |
| --- | ---: | ---: | ---: |
| P1 | 3 | 7 | 4 |
| P2 | 2 | 4 | 2 |
| P3 | 2 | 5 | 3 |

현재 `Available = 3`이다. P2는 `Need=2`이므로 먼저 완료할 수 있고, P2가 가진 2개를 반환하면 `Work=5`가 된다. 이제 P1의 Need 4를 만족시켜 완료한 뒤 3개를 반환하면 `Work=8`, 마지막으로 P3도 완료할 수 있다.

```text
Available 3
   ↓ P2 완료, Allocation 2 반환
Work 5
   ↓ P1 완료, Allocation 3 반환
Work 8
   ↓ P3 완료
safe sequence: P2 → P1 → P3
```

이 계산의 목적은 미래 실행 순서를 강제로 고정하는 것이 아니라 **적어도 하나의 completion sequence가 존재하는지 증명하는 것**이다.

### 일반 backend request에 그대로 적용하기 어려운 이유가 있다

웹 request가 앞으로 DB connection, memory, file handle, application lock을 최대 몇 개 필요로 할지 정확히 미리 선언하기는 어렵다. Resource 종류와 process 수가 동적으로 바뀌면 매 승인마다 safe-state를 계산하는 비용도 커진다.

그래서 timeout, lease, retry가 있다는 이유만으로 이를 Banker's-style avoidance라고 부르면 부정확하다. Avoidance의 핵심 비용은 **미래 최대 demand 정보가 필요하고, 현재는 줄 수 있는 resource도 safe state를 깨면 보수적으로 지연해야 한다는 것**이다.

---
kind: concept
contentKey: dsa.core.greedy.interval-scheduling
topicContentKey: dsa.core.greedy
slug: interval-scheduling
title: "Interval Scheduling"
summary: "겹치지 않는 interval 개수 최대화에서 earliest-finish greedy와 exchange proof를 적용한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "greedy choice, exchange argument와 interval scheduling의 correctness proof 구조를 확인한다."
    displayOrder: 1
---
# Interval Scheduling

### 겹치지 않는 interval을 최대한 많이 선택한다

Interval scheduling의 기본 문제는 하나의 resource에서 서로 겹치지 않는 interval을 가능한 많이 선택하는 것이다. 각 interval은 start와 finish를 가진다.

```text
A: [1, 4]
B: [3, 5]
C: [4, 7]
D: [6, 8]
```

목표는 duration 합이나 priority 합이 아니라 **선택한 interval 개수 최대화**다. Objective가 바뀌면 알고리즘도 달라질 수 있으므로 이 정의가 중요하다.

### Earliest finish time greedy

가장 빨리 끝나는 interval부터 선택한다.

```text
1. finish time 오름차순으로 정렬
2. 첫 interval 선택
3. 마지막 선택과 겹치지 않는 다음 interval 중 가장 빨리 끝나는 것을 선택
4. 반복
```

Interval 경계를 `[start, finish)`처럼 정의했다면 다음 interval의 `start >= lastFinish`를 compatible 조건으로 사용할 수 있다. Closed interval인지 half-open인지에 따라 `=` 허용 여부가 달라질 수 있으므로 경계 계약을 먼저 정한다.

### 왜 빨리 끝나는 선택이 안전한가

어떤 optimal schedule의 첫 interval을 `o`, greedy가 고른 earliest-finish interval을 `g`라고 하자.

Greedy 정의상:

```text
finish(g) <= finish(o)
```

OPT에서 o 뒤에 들어갈 수 있던 interval은 o가 끝난 뒤 시작한다. g는 o보다 늦게 끝나지 않으므로 그 interval들은 g 뒤에도 여전히 들어갈 수 있다.

따라서 o를 g로 바꿔도 선택 가능한 interval 개수가 줄지 않는다. 이것이 exchange argument다.

### 다른 그럴듯한 greedy가 실패할 수 있다

"가장 빨리 시작하는 interval"은 긴 interval 하나를 먼저 골라 이후 많은 interval을 막을 수 있다.

"duration이 가장 짧은 interval"도 현재 위치와의 compatibility를 고려하지 않으면 미래 선택 공간을 가장 많이 남긴다는 보장이 없다.

Greedy rule은 단순 직관이 아니라 objective와 proof가 연결되어야 한다.

### Weighted Interval Scheduling은 다른 문제다

각 interval에 value가 있고 선택한 **value 합을 최대화**하려는 경우 earliest finish greedy는 최적을 보장하지 않는다.

예를 들어 짧은 interval 여러 개보다 하나의 긴 interval 가치가 훨씬 클 수 있다. 이런 문제는 일반적으로 `p(i)` 같은 이전 compatible interval과 DP state를 정의하는 weighted interval scheduling으로 다룬다.

### Interval partitioning과도 다르다

모든 interval을 처리해야 하고 필요한 resource 수를 최소화하려는 문제는 interval scheduling이 아니다. 이 경우 현재 active interval과 room 수를 관리하는 interval partitioning 문제다.

즉 interval이라는 입력 모양이 같아도 objective에 따라 알고리즘이 달라진다.

### 실제 일정 문제에서 확인할 것

회의, 복습 slot, batch job window에 적용할 때는 단순 시간 interval 외에 priority, mandatory task, setup time, resource 종류 같은 추가 constraint가 있는지 확인해야 한다. Constraint가 추가되면 기존 exchange proof가 그대로 유지되는지 다시 검증해야 한다.

---
kind: concept
contentKey: dsa.core.greedy.interval-scheduling
topicContentKey: dsa.core.greedy
slug: interval-scheduling
title: "Interval Scheduling"
summary: "가장 빨리 끝나는 interval 선택이 최대 개수를 보장하는 이유를 설명한다."
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

Interval scheduling의 기본 문제는 서로 겹치지 않는 interval을 **가능한 많이** 선택하는 것이다. 각 interval은 start와 finish를 가지며, objective는 duration 합이나 priority 합이 아니라 선택 개수다.

Greedy rule은 현재 선택 가능한 interval 중 가장 빨리 끝나는 것을 고르는 것이다. 선택한 interval의 finish 이후에 시작하는 후보들 중 다시 가장 빨리 끝나는 것을 반복한다.

이 선택이 안전한 이유는 exchange argument로 설명할 수 있다. 어떤 optimal schedule의 첫 interval을 `o`, greedy가 고른 interval을 `g`라 하면 greedy 정의상:

```text
finish(g) <= finish(o)
```

따라서 optimal schedule에서 o를 g로 바꿔도 o 뒤에 들어갈 수 있던 interval들은 g 뒤에도 여전히 들어갈 수 있다. 선택 개수가 줄지 않으므로 g를 포함하는 optimal solution이 존재한다.

첫 선택 이후에는 g와 겹치지 않는 interval들만 남은 같은 종류의 scheduling 문제가 된다. 이 subproblem에 같은 논리를 반복 적용하면 전체 greedy solution의 optimality를 설명할 수 있다.

이 증명은 **겹치지 않는 interval 개수 최대화**라는 objective에 대한 것이다. Interval마다 value가 있고 value 합을 최대화하는 weighted 문제처럼 objective가 바뀌면 같은 greedy rule은 더 이상 보장되지 않을 수 있다.

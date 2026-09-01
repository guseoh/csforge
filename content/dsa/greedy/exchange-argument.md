---
kind: concept
contentKey: dsa.core.greedy.exchange-argument
topicContentKey: dsa.core.greedy
slug: exchange-argument
title: "Exchange Argument"
summary: "optimal solution의 선택을 greedy 선택으로 교환해도 feasibility와 objective가 나빠지지 않음을 보인다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "greedy choice, exchange argument와 interval scheduling의 correctness proof 구조를 확인한다."
    displayOrder: 1
---
# Exchange Argument

### Greedy 선택을 포함하는 optimal solution을 만든다

Exchange argument는 greedy algorithm의 correctness를 증명하는 대표적인 방법이다. 임의의 optimal solution을 하나 잡고, 그 solution의 일부 선택을 greedy가 고른 선택으로 교체한다. 교체 후에도 solution이 유효하고 objective가 나빠지지 않는다면 **greedy choice를 포함하는 optimal solution이 존재한다**고 말할 수 있다.

핵심은 단순히 두 값을 바꾸는 것이 아니라 다음 두 조건을 모두 확인하는 것이다.

- 교환 후에도 feasibility가 유지되는가
- objective value가 더 나빠지지 않는가

둘 중 하나라도 실패하면 exchange argument는 성립하지 않는다.

### Interval Scheduling 예시

겹치지 않는 interval 개수를 최대화하는 문제에서 greedy는 가장 빨리 끝나는 interval `g`를 먼저 고른다.

어떤 optimal schedule `OPT`의 첫 interval을 `o`라고 하자. Greedy interval g는 가능한 interval 중 finish time이 가장 빠르므로:

```text
finish(g) <= finish(o)
```

OPT에서 o 대신 g를 넣어도 g가 더 늦게 끝나지 않으므로 o 뒤에 배치되어 있던 interval들은 여전히 g 뒤에 배치할 수 있다.

따라서:

```text
OPT = [o, x2, x3, ...]
       ↓ exchange
OPT' = [g, x2, x3, ...]
```

OPT'도 같은 개수의 compatible interval을 가진 optimal schedule이다. 즉 greedy 첫 선택을 포함하는 optimal solution이 존재한다.

### 한 번의 교환에서 전체 알고리즘으로

첫 선택만 greedy와 맞추는 것으로 끝나지 않는다. 첫 interval을 고른 뒤 남은 interval 중 compatible한 것들로 같은 종류의 scheduling 문제가 남는다.

이 subproblem에도 같은 exchange argument를 반복 적용하면 greedy가 선택하는 prefix 전체를 optimal solution과 맞출 수 있다.

### 교환 시 무엇을 검증해야 하는가

Exchange proof를 쓸 때 자주 빠지는 오류는 "값이 더 좋아 보인다"만 확인하고 constraint를 놓치는 것이다.

예를 들어 capacity, ordering, dependency가 있는 문제에서 `o`를 `g`로 바꾸면 다음 항목과 충돌할 수 있다. 이 경우 objective가 좋아도 feasible solution이 아니다.

또 교환 후 feasible하지만 objective가 악화된다면 optimality를 보존하지 못한다.

따라서 proof에는 최소한 다음 문장이 명시되어야 한다.

```text
1. 교환 후에도 모든 constraint를 만족한다.
2. 교환 후 objective는 기존 optimal solution보다 나빠지지 않는다.
```

### 모든 greedy 문제에 exchange argument가 맞는 것은 아니다

MST에서는 cut property가 더 자연스러운 proof 도구일 수 있고, 어떤 문제는 stay-ahead argument를 사용할 수 있다. Exchange argument는 greedy proof의 한 패턴이지 greedy라는 이유로 억지로 적용해야 하는 공식은 아니다.

특히 weighted interval scheduling처럼 interval마다 value가 있고 목표가 개수가 아닌 value 합 최대화라면 "가장 빨리 끝나는 interval로 교환"이 total value를 보존한다는 보장이 없다. 문제의 objective가 바뀌면 기존 proof도 다시 검토해야 한다.

---
kind: concept
contentKey: dsa.core.greedy.greedy-failure
topicContentKey: dsa.core.greedy
slug: greedy-failure
title: "Greedy Failure"
summary: "local optimum이 global optimum을 보장하지 않는 반례를 통해 greedy 적용 조건을 검증한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "greedy choice, exchange argument와 interval scheduling의 correctness proof 구조를 확인한다."
    displayOrder: 1
---
# Greedy Failure

### 작은 반례 하나가 greedy proof를 무너뜨린다

Greedy algorithm은 구현이 단순해서 아이디어를 떠올리기 쉽다. 하지만 현재 가장 좋아 보이는 선택이 미래의 더 좋은 조합을 막을 수 있다면 global optimum을 보장하지 않는다.

Greedy rule이 항상 최적이라는 주장을 깨는 가장 직접적인 방법은 **작은 counterexample 하나를 찾는 것**이다. 허용 입력 중 하나라도 greedy보다 더 좋은 solution이 존재하면 해당 rule의 optimality claim은 끝난다.

### Coin change 반례

동전 `[1, 3, 4]`로 금액 6을 최소 개수로 만들고 싶다고 하자. 가장 큰 동전부터 고르는 greedy는:

```text
6 -> 4 선택, 남은 2
2 -> 1 선택
1 -> 1 선택
결과: 4 + 1 + 1 = 3개
```

하지만 optimal solution은:

```text
3 + 3 = 2개
```

이다. "가장 큰 동전부터"라는 local choice가 미래 조합을 잘못 잠갔다.

특정 화폐 체계에서는 greedy가 맞을 수 있지만 임의의 denomination에 일반화할 수는 없다.

### 0/1 Knapsack과 Fractional Knapsack

Fractional knapsack은 물건을 일부만 선택할 수 있어 value/weight 비율이 높은 순으로 채우는 greedy가 optimal하다.

반면 0/1 knapsack은 물건을 통째로 선택하거나 버려야 한다. 비율이 좋은 물건 하나가 capacity를 차지하면서 더 좋은 전체 조합을 막을 수 있어 같은 greedy proof가 깨진다.

입력 모양이 비슷해도 **선택을 분할할 수 있는가**라는 constraint 하나가 algorithm class를 바꾼다.

### 어디에서 proof가 깨졌는지 찾는다

Counterexample을 발견한 뒤에는 단순히 "greedy가 안 된다"에서 끝내지 않고 어떤 proof 조건이 깨졌는지 찾는 것이 좋다.

- greedy choice를 포함하는 optimal solution으로 exchange할 수 없는가
- exchange하면 feasibility가 깨지는가
- objective가 나빠지는가
- greedy 선택 후 남은 문제가 같은 optimal subproblem 구조가 아닌가

이 분석이 DP나 backtracking으로 전환할 때 state를 설계하는 힌트가 된다.

### Greedy 실패와 heuristic은 다르다

정확한 optimal solution이 필요하지 않은 문제에서는 greedy heuristic이 충분히 좋은 선택일 수 있다. 예를 들어 recommendation 후보를 빠르게 줄이는 목적이라면 최적 보장보다 latency가 중요할 수 있다.

하지만 이 경우에는 "항상 최적"이라고 설명하지 않고 quality metric, approximation loss, known counterexample을 관리해야 한다.

### 반례를 테스트로 보존한다

Greedy policy를 실제 코드에 사용한다면 과거에 발견한 최소 counterexample을 regression test로 남기는 것이 좋다. 나중에 constraint나 objective가 바뀌었을 때 기존 proof가 여전히 유효한지 빠르게 확인할 수 있다.

특히 business policy가 추가되면 과거에는 안전했던 greedy choice가 더 이상 안전하지 않을 수 있다. Algorithm proof도 requirement 변경과 함께 다시 검토해야 한다.

---
kind: concept
contentKey: dsa.core.greedy.greedy-choice
topicContentKey: dsa.core.greedy
slug: greedy-choice
title: "Greedy Choice"
summary: "현재의 local choice를 되돌리지 않아도 global optimum으로 확장 가능한 조건을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "greedy choice, exchange argument와 interval scheduling의 correctness proof 구조를 확인한다."
    displayOrder: 1
---
# Greedy Choice

### 지금 가장 좋아 보이는 선택이 항상 정답은 아니다

Greedy algorithm은 매 단계에서 현재 기준으로 가장 유리한 선택을 하고 그 선택을 다시 되돌리지 않는다. 이런 구현은 단순하고 빠를 수 있지만, **local optimum이 global optimum으로 이어진다는 보장**이 있을 때만 정확한 알고리즘이 된다.

예를 들어 interval scheduling에서 겹치지 않는 interval 개수를 최대화하려면 현재 선택 가능한 interval 중 가장 빨리 끝나는 것을 고르는 전략이 최적이다. 반면 0/1 knapsack에서 단위 무게당 가치가 가장 높은 물건부터 고르는 전략은 최적을 보장하지 않는다.

둘 다 "현재 가장 좋아 보이는 것"을 고르지만 한쪽만 correctness proof를 만들 수 있다.

### Greedy-choice property

Greedy choice가 안전하다는 말은 **어떤 optimal solution 중 적어도 하나가 현재 greedy choice를 포함하도록 만들 수 있다**는 뜻이다.

Greedy가 선택한 항목 `g`와 어떤 optimal solution의 첫 선택 `o`가 다르더라도, `o`를 `g`로 바꿨을 때:

- solution이 여전히 feasible하고
- objective가 나빠지지 않는다면

`g`를 포함하는 optimal solution이 존재한다. 이것이 exchange argument로 이어진다.

### 선택 이후 남은 문제도 풀 수 있어야 한다

첫 greedy choice가 안전하더라도 그 뒤에 남은 문제가 어떤 구조인지 봐야 한다. 선택 후 남은 부분이 원래 문제와 같은 종류의 최적화 문제로 남고, 그 subproblem을 최적으로 풀면 전체도 최적이 되는 구조가 필요하다.

```text
전체 문제
  ↓ greedy choice g
남은 subproblem
  ↓ 같은 원리 반복
최종 solution
```

즉 greedy는 "좋아 보이는 선택을 반복한다"가 아니라 **안전한 선택 + 남은 문제의 최적 구조**가 결합된 전략이다.

### 되돌리지 않는다는 점이 핵심이다

Backtracking은 선택이 잘못되면 undo하고 다른 branch를 시도할 수 있다. DP는 여러 상태의 최적 결과를 저장해 비교할 수 있다. Greedy는 한 번 선택한 뒤 일반적으로 그 선택을 확정한다.

그래서 선택이 미래 가능성을 잘못 잠글 수 있는 문제에서는 greedy가 위험하다. 선택 하나를 되돌려야 더 좋은 solution이 나온다면 greedy-choice property가 성립하지 않는다.

### 알고리즘을 고르기 전에 반례를 찾는다

Greedy 아이디어가 떠오르면 proof 전에 작은 반례를 찾는 것도 효과적이다. "가장 큰 값", "가장 짧은 작업", "가장 높은 비율" 같은 규칙을 몇 개의 작은 입력에 적용해 더 좋은 조합이 존재하는지 확인한다.

반례 하나가 존재하면 해당 greedy rule의 global optimum 보장은 깨진다. 반대로 몇 개 테스트에서 성공했다는 사실만으로 proof가 되는 것은 아니다.

### 실무 heuristic과 최적 알고리즘을 구분한다

추천 ranking이나 scheduler에서 greedy-like heuristic을 사용하는 것 자체는 문제없다. 다만 수학적으로 최적을 보장하지 않는다면 "optimal algorithm"으로 표현하면 안 된다.

실무에서는 objective, constraints, approximation 가능 여부를 명확히 하고 heuristic 결과의 품질을 측정해야 한다. 알고리즘 correctness와 business heuristic의 유용성을 같은 주장으로 섞지 않는 것이 중요하다.

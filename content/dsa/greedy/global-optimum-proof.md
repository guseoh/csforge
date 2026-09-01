---
kind: concept
contentKey: dsa.core.greedy.global-optimum-proof
topicContentKey: dsa.core.greedy
slug: global-optimum-proof
title: "Global Optimum Proof"
summary: "local greedy choice가 전체 optimal solution으로 이어지는 proof 구조를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "greedy choice, exchange argument와 interval scheduling의 correctness proof 구조를 확인한다."
    displayOrder: 1
---
# Global Optimum Proof

### 실행 결과가 좋아 보이는 것과 최적임을 증명하는 것은 다르다

Greedy algorithm은 작은 테스트에서 항상 좋은 결과를 낼 수 있다. 하지만 correctness를 주장하려면 "이 입력들에서는 잘 됐다"가 아니라 **허용되는 모든 입력에서 greedy solution이 optimal이라는 논리**가 필요하다.

이를 위해 먼저 feasible solution과 objective를 명확히 정의한다. 무엇을 만족해야 유효한 해인지, 무엇을 최소화하거나 최대화하는지가 없으면 optimal이라는 말 자체가 성립하지 않는다.

### 보통 proof는 두 질문으로 나뉜다

첫째, 현재 greedy choice를 해도 optimal solution을 잃지 않는가? 둘째, 그 선택 이후 남은 subproblem을 최적으로 풀면 전체도 최적인가?

```text
greedy choice safe?
        ↓ yes
remaining subproblem has same optimal structure?
        ↓ yes
repeat
```

첫 질문은 exchange argument, cut property 같은 방식으로 증명하는 경우가 많고, 두 번째는 optimal substructure와 연결된다.

### Optimal solution을 greedy prefix에 맞춘다

어떤 optimal solution `OPT`를 하나 잡자. Greedy가 첫 선택으로 `g`를 골랐는데 OPT의 첫 선택은 `o`라고 하자.

`o`를 `g`로 교환해도 feasibility와 objective가 나빠지지 않음을 보일 수 있다면 `g`를 포함하는 또 다른 optimal solution이 존재한다.

그다음 첫 선택을 제거한 나머지 문제에 같은 논리를 적용한다. 이 과정을 반복하면 greedy algorithm의 전체 prefix와 일치하는 optimal solution을 구성할 수 있다.

### Tie가 있을 때도 proof가 필요하다

같은 score를 가진 후보가 여러 개라면 아무 후보나 골라도 안전한지, 특정 tie-breaker만 안전한지 구분해야 한다.

예를 들어 interval scheduling에서 가장 이른 finish time이 같은 interval들이 있다면 어느 것을 선택해도 남은 시간 시작점이 같을 수 있다. 하지만 다른 문제에서는 tie 선택이 이후 feasible set을 바꿀 수 있다.

따라서 deterministic tie-breaker를 추가했다고 correctness가 자동으로 생기는 것도 아니고, 여러 tie 결과가 나온다고 correctness가 깨지는 것도 아니다.

### Greedy proof와 induction

Greedy proof는 induction과 자연스럽게 연결된다. 첫 greedy choice가 어떤 optimal solution에 포함될 수 있음을 보이고, 남은 크기가 더 작은 문제에서도 같은 알고리즘이 optimal하다고 가정하면 전체 solution도 optimal임을 보일 수 있다.

중요한 것은 induction hypothesis를 쓸 수 있도록 **남은 문제가 원래 문제와 같은 구조를 가진다**는 점이다.

### Proof가 없으면 heuristic으로 다룬다

실제 scheduler나 recommendation system에서 greedy rule이 경험적으로 훌륭할 수 있다. 하지만 objective 전체에 대한 optimality proof가 없다면 그 알고리즘은 heuristic일 수 있다.

그 경우 정확한 표현은 "현재 측정한 workload에서 좋은 품질을 보였다"이지 "항상 최적이다"가 아니다. Worst-case 반례, approximation bound, 실제 quality metric을 별도로 관리한다.

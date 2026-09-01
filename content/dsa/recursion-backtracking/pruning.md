---
kind: concept
contentKey: dsa.core.recursion-backtracking.pruning
topicContentKey: dsa.core.recursion-backtracking
slug: pruning
title: "Pruning"
summary: "해가 될 수 없는 branch를 증명 가능한 조건으로 조기에 제거한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "탐색 공간 크기와 실제 수행 비용을 함께 분석하는 관점을 확인한다."
    displayOrder: 1
---
# Pruning

### 모든 branch를 끝까지 볼 필요는 없다

Backtracking search tree는 가능한 선택 수가 많아지면 빠르게 커진다. 하지만 현재 partial state만 보고도 **이 branch에서는 앞으로 어떤 선택을 해도 유효한 답을 만들 수 없다**고 판단할 수 있다면 더 깊이 내려갈 이유가 없다. 이때 branch 전체를 잘라내는 것이 pruning이다.

예를 들어 양수만 사용하는 조합 합 문제에서 현재 합이 이미 target보다 크다면 이후 값을 더 추가해도 target으로 돌아올 수 없다. 이 조건이 문제 정의에서 항상 참이라면 해당 branch를 안전하게 제거할 수 있다.

### 빠른 조건보다 안전한 조건이 먼저다

Pruning 조건은 단순히 “이 branch는 별로 좋아 보인다”가 아니라 **잘라낸 공간 안에 정답이 없다는 근거**가 필요하다. 잘못된 pruning은 실행 시간을 줄이는 대신 correctness나 completeness를 깨뜨린다.

예를 들어 최댓값 문제에서 현재 점수가 30이고 best가 100이라고 하자. 단순히 `30 < 100`이라는 이유로 branch를 자르면 안 된다. 남은 선택으로 80점을 더 얻을 수 있다면 최종 110으로 best를 갱신할 수 있기 때문이다.

반면 남은 선택으로 얻을 수 있는 최대 추가 점수가 60이라는 upper bound를 알고 있다면:

```text
현재 30 + 가능한 최대 추가 60 = 90
현재 best = 100
```

이 branch는 100을 넘을 수 없으므로 최적해 탐색에서 안전하게 제거할 수 있다.

### Constraint pruning과 bound pruning

Pruning은 성격에 따라 크게 두 방식으로 볼 수 있다.

첫째는 **constraint violation**이다. 이미 문제의 필수 조건을 깨뜨린 상태라면 더 탐색하지 않는다. 예를 들어 N-Queens에서 같은 column이나 diagonal에 queen이 겹치면 그 branch는 즉시 실패다.

둘째는 **bound를 이용한 pruning**이다. 현재 상태에서 만들 수 있는 최선의 결과를 계산해도 이미 알고 있는 best보다 나쁘다면 branch를 제거한다. branch-and-bound 계열 문제에서 자주 나타난다.

### 좋은 pruning은 계산 비용도 고려한다

Pruning predicate 자체가 너무 비싸면 search node 수는 줄어도 전체 실행 시간이 더 늘어날 수 있다. 따라서 보통은 cheap constraint나 간단한 bound를 먼저 검사하고, 더 비싼 검사는 필요한 경우 뒤에서 수행한다.

```text
cheap impossible check
        ↓ 통과
simple bound
        ↓ 통과
expensive validation
        ↓
next branch
```

즉 pruning도 `얼마나 많이 자르는가`뿐 아니라 `판단 비용이 얼마인가`를 함께 봐야 한다.

### Heuristic과 correctness-preserving pruning을 구분한다

검색 시스템이나 추천 시스템에서는 정확한 최적해보다 빠른 근사 결과가 더 중요할 수도 있다. 이런 경우 heuristic으로 가능성이 낮은 branch를 버릴 수 있다. 그러나 이것은 **정답 보존이 증명된 pruning과 다른 계약**이다.

정확한 알고리즘이라면 pruning 조건이 유효한 답을 제거하지 않음을 설명할 수 있어야 하고, approximate search라면 일부 답을 포기할 수 있음을 결과 계약에 명시해야 한다.

### 실제 시스템에서의 적용

조합 탐색을 backend 요청 경로에서 수행한다면 pruning만 믿고 입력을 무제한 허용하면 안 된다. pruning effectiveness는 입력에 따라 크게 달라질 수 있기 때문이다.

최대 depth, candidate 수, 실행 시간 budget 같은 hard limit을 별도로 두고, timeout으로 중단했을 때 반환값이 complete인지 partial인지 구분해야 한다. 성능 최적화와 결과 정확성 계약을 같은 것으로 취급하지 않는 것이 중요하다.

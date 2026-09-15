---
kind: concept
contentKey: dsa.core.recursion-backtracking.pruning
topicContentKey: dsa.core.recursion-backtracking
slug: pruning
title: "Pruning"
summary: "불가능한 branch를 조기에 제거해 search space를 줄이는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Pruning

Pruning은 backtracking search에서 현재 partial state만 보고도 **이 branch에서는 유효한 답을 만들 수 없다고 판단할 수 있을 때** 더 깊은 탐색을 중단하는 것이다.

예를 들어 모든 후보가 양수인 조합 합 문제에서 현재 합이 이미 target을 넘었다면 값을 더 추가해 target으로 돌아올 수 없다. 이 조건이 문제 정의에서 항상 참이라면 해당 branch를 안전하게 제거할 수 있다.

중요한 것은 pruning 조건이 빠른가보다 **정답을 제거하지 않는가**다. 최적화 문제에서 현재 점수가 best보다 낮다는 이유만으로 branch를 자르면 안 된다. 남은 선택으로 best를 넘을 가능성이 있다면 탐색을 계속해야 한다.

반대로 현재 값과 남은 선택으로 만들 수 있는 최선의 upper bound까지 계산해도 기존 best보다 나쁘다면 그 branch는 제거할 수 있다. Constraint violation이나 이런 bound가 pruning의 근거가 된다.

Pruning predicate 자체도 비용이 들므로, expensive한 검사를 수행해 branch 몇 개만 줄인다면 전체 시간은 오히려 늘 수 있다. 따라서 correctness를 보존하는 조건 중에서도 판단 비용과 줄어드는 search space를 함께 고려해야 한다.

Pruning의 핵심은 heuristic하게 가능성이 낮은 branch를 버리는 것이 아니라, **버린 branch 안에는 정답이 없다는 근거를 설명할 수 있는 것**이다.

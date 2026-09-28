---
kind: concept
contentKey: dsa.core.recursion-backtracking.pruning
topicContentKey: dsa.core.recursion-backtracking
slug: pruning
title: "가지치기(Pruning)"
summary: "불가능한 분기를 조기에 제거해 탐색 공간을 줄이는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/lectures/keynote/67CombinatorialSearch.pdf"
    title: "Combinatorial Search (Algorithms, 4th Edition)"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "백트래킹 탐색 트리, 재귀 선택, 막다른 경로와 pruning 예시를 확인한다."
    displayOrder: 1
---
# 가지치기(Pruning)

Pruning은 백트래킹 search에서 현재 partial 상태만 보고도 **이 분기에서는 유효한 답을 만들 수 없다고 판단할 수 있을 때** 더 깊은 탐색을 중단하는 것이다.

예를 들어 모든 후보가 양수인 조합 합 문제에서 현재 합이 이미 대상을 넘었다면 값을 더 추가해 대상으로 돌아올 수 없다. 이 조건이 문제 정의에서 항상 참이라면 해당 분기를 안전하게 제거할 수 있다.

```text
현재 partial state
├─ 제약을 만족함 ───────────→ child branch를 계속 탐색
└─ target 초과(모두 양수) ─→ prune: descendant 전체를 방문하지 않음
```

Pruning은 현재 노드 하나를 건너뛰는 것이 아니라, 그 상태에서 이어지는 search 부분 트리 전체를 탐색 대상에서 제거한다.

중요한 것은 pruning 조건이 빠른가보다 **정답을 제거하지 않는가**다. 최적화 문제에서 현재 점수가 best보다 낮다는 이유만으로 분기를 자르면 안 된다. 남은 선택으로 best를 넘을 가능성이 있다면 탐색을 계속해야 한다.

반대로 현재 값과 남은 선택으로 만들 수 있는 최선의 upper bound까지 계산해도 기존 best보다 나쁘다면 그 분기는 제거할 수 있다. 제약 조건 violation이나 이런 bound가 pruning의 근거가 된다.

Pruning predicate 자체도 비용이 들므로, expensive한 검사를 수행해 분기 몇 개만 줄인다면 전체 시간은 오히려 늘 수 있다. 따라서 정확성을 보존하는 조건 중에서도 판단 비용과 줄어드는 탐색 공간을 함께 고려해야 한다.

Pruning의 핵심은 heuristic하게 가능성이 낮은 분기를 버리는 것이 아니라, **버린 분기 안에는 정답이 없다는 근거를 설명할 수 있는 것**이다.

---
kind: concept
contentKey: dsa.core.recursion-backtracking.backtracking-tree
topicContentKey: dsa.core.recursion-backtracking
slug: backtracking-tree
title: "Backtracking Tree"
summary: "선택과 복구로 탐색 상태를 분기하고 되돌린다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Backtracking Tree

backtracking은 현재 partial solution에 선택을 하나 적용하고, 하위 탐색이 끝나면 그 선택을 undo한다. 탐색 tree의 각 node는 지금까지 선택한 상태이며, 같은 mutable collection을 공유한다면 복구 순서가 correctness의 일부가 된다.

가능한 선택을 빠짐없이 열되 제약을 위반한 branch는 결과 후보로 내지 않는다. branch 수는 지수적으로 커질 수 있으므로 상태 표현, 방문 방지, pruning 조건이 실제 비용을 좌우한다.

### Backend 연결

규칙 조합을 탐색하는 validation이나 추천 후보 생성에서는 요청별 탐색 예산과 깊이를 둔다. 부분 결과를 저장할 때는 탐색 중간 상태를 canonical 데이터로 오인하지 않도록 분리한다.

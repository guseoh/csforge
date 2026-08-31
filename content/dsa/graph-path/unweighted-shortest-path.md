---
kind: concept
contentKey: dsa.core.graph-path.unweighted-shortest-path
topicContentKey: dsa.core.graph-path
slug: unweighted-shortest-path
title: "Unweighted Shortest Path"
summary: "BFS layer가 edge 수 기준 최단 거리가 되는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "graph의 경로와 연결성 알고리즘을 확인한다."
    displayOrder: 1
---
# Unweighted Shortest Path

가중치가 모두 같은 graph에서는 한 edge를 더 사용하는 경로가 이전 layer보다 먼저 도착할 수 없다. BFS는 거리 `d`의 모든 vertex를 처리한 뒤 `d+1`을 발견하므로 처음 기록한 거리가 edge 수 기준 최단 거리다.

parent를 함께 저장하면 거리를 역추적해 실제 경로를 복원할 수 있다. 도달 불가능한 vertex는 distance를 별도 sentinel로 두며, 0과 혼동하지 않는다.

### Backend 연결

관련 concept를 최대 hop 수로 추천하거나 prerequisite까지의 단계를 표시할 때 사용할 수 있다. edge 수가 의미하는 학습 비용이 동일하지 않다면 weighted algorithm을 선택해야 한다.


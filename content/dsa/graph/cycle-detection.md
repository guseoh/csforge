---
kind: concept
contentKey: dsa.core.graph.cycle-detection
topicContentKey: dsa.core.graph
slug: cycle-detection
title: "Cycle Detection"
summary: "undirected parent와 directed recursion state로 cycle을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/42digraph/"
    title: "Algorithms, 4th Edition: Directed Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "directed graph의 cycle과 순서를 확인한다."
    displayOrder: 1
---
# Cycle Detection

undirected graph에서는 이미 방문한 이웃이 현재 vertex의 parent가 아니면 cycle 후보가 된다. directed graph에서는 현재 DFS 경로에 있는 vertex를 다시 만나는 back edge가 cycle을 뜻하며, 단순히 visited 여부만으로는 cross edge와 구분할 수 없다.

따라서 directed 탐색은 `unvisited`, `in progress`, `finished` 상태를 유지한다. cycle을 허용하지 않는 데이터라면 검증 실패를 명확히 반환하고 일부 edge만 제거해 조용히 보정하지 않는다.

### Backend 연결

concept prerequisite graph에 cycle이 생기면 학습 순서를 계산할 수 없다. import Preview에서 cycle 경로를 보여주고 Apply 전에 차단하면 잘못된 curriculum을 저장하지 않는다.


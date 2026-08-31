---
kind: concept
contentKey: dsa.core.graph.dfs
topicContentKey: dsa.core.graph
slug: dfs
title: "DFS"
summary: "stack 또는 recursion으로 깊이 우선 방문·완료 상태를 추적한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "graph의 경로와 연결성 알고리즘을 확인한다."
    displayOrder: 1
---
# DFS

DFS는 한 이웃을 따라 더 이상 갈 수 없을 때 되돌아와 다음 이웃을 처리한다. recursion stack 또는 명시적 stack이 현재 경로를 표현하고, discovered와 finished 시점을 구분하면 cycle·topological order 같은 성질을 추론할 수 있다.

각 vertex를 처음 방문할 때 표시하고 모든 adjacency를 검사하면 adjacency list에서 `O(V+E)`다. 재귀 깊이가 입력에 비례할 수 있으므로 큰 graph에서는 명시적 stack이나 깊이 제한을 검토한다.

### Backend 연결

콘텐츠 관계의 reachable 검증이나 cycle 조사에 DFS를 사용할 수 있다. 실패한 경로를 진단하려면 parent와 현재 recursion path를 별도 기록하고 canonical 관계를 변경하지 않는다.

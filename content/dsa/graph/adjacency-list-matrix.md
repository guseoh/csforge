---
kind: concept
contentKey: dsa.core.graph.adjacency-list-matrix
topicContentKey: dsa.core.graph
slug: adjacency-list-matrix
title: "인접 리스트와 인접 행렬"
summary: "두 표현의 공간과 간선 조회 비용을 비교한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "무방향 그래프 표현, BFS 최단 경로, DFS와 연결 요소 탐색을 확인한다."
    displayOrder: 1
---
# 인접 리스트와 인접 행렬

같은 그래프도 어떻게 저장하느냐에 따라 공간 사용량과 연산 비용이 달라진다. 대표적인 표현이 adjacency list와 adjacency matrix다.

Adjacency list는 각 정점이 실제 neighbor만 저장한다.

```text
A: B, D
B: A, C
C: B
D: A
```

정점 수를 V, 간선 수를 E라 하면 저장 공간은 O(V+E)이고, 한 정점의 이웃을 순회하는 비용은 그 정점의 degree에 비례한다. Sparse 그래프에서 특히 효율적이다.

Adjacency matrix는 `V × V` 표의 `(u,v)` 위치에 간선 존재 여부나 가중치를 저장한다. 특정 간선의 존재를 O(1)에 확인할 수 있지만, 실제 간선이 적어도 O(V²) 공간을 사용하고 한 정점의 모든 이웃을 찾으려면 행 전체를 확인해야 한다.

```text
                 list        matrix
space            O(V+E)      O(V²)
iterate neighbors degree(u)   O(V)
edge(u,v)        표현에 의존   O(1)
```

따라서 sparse/dense 여부뿐 아니라 **주로 수행할 연산이 이웃 순회인지, 임의 간선 존재 확인인지**를 기준으로 representation을 선택해야 한다.

---
kind: concept
contentKey: dsa.core.graph.connected-components
topicContentKey: dsa.core.graph
slug: connected-components
title: "Connected Components"
summary: "미방문 정점에서 탐색을 반복해 component를 세는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "vertex, edge, path, connectivity 같은 graph 기본 모델을 확인한다."
    displayOrder: 1
---
# Connected Components

Undirected graph에서 connected component는 서로 path로 도달 가능한 vertex들의 maximal 집합이다. 서로 다른 component 사이에는 연결 path가 없다.

```text
A -- B -- C      D -- E      F

{A,B,C}  {D,E}  {F}
```

전체 component를 찾으려면 모든 vertex를 순회하면서 아직 방문하지 않은 vertex에서 BFS나 DFS를 새로 시작한다. 한 번의 탐색에서 방문한 vertex는 모두 같은 component에 속한다.

```text
for v in vertices:
    if not visited[v]:
        traverse(v)
        componentCount++
```

따라서 새로운 탐색을 시작한 횟수가 component 수가 된다. Edge가 하나도 없는 isolated vertex도 자기 자신만으로 하나의 component이므로 vertex 전체를 기준으로 순회해야 한다.

각 vertex에 component id를 저장하면 이후 두 vertex가 같은 component에 속하는지 빠르게 비교할 수 있다. 다만 graph의 edge가 바뀌면 기존 component 정보도 다시 계산해야 할 수 있다.

Directed graph에서는 방향을 무시한 weak connectivity와 서로 양방향 도달 가능한 strong connectivity를 별도로 구분한다. 여기서의 connected component는 기본적으로 undirected graph를 대상으로 한다.

---
kind: concept
contentKey: dsa.core.graph.connected-components
topicContentKey: dsa.core.graph
slug: connected-components
title: "연결 요소(Connected Components)"
summary: "미방문 정점에서 탐색을 반복해 연결 요소를 세는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "무방향 그래프 표현, BFS 최단 경로, DFS와 연결 요소 탐색을 확인한다."
    displayOrder: 1
---
# 연결 요소(Connected Components)

무방향 그래프에서 연결 요소는 서로 경로를 통해 도달할 수 있는 정점들의 **최대 집합**이다. 서로 다른 연결 요소 사이에는 연결 경로가 없다.

```text
A -- B -- C      D -- E      F

{A,B,C}  {D,E}  {F}
```

전체 연결 요소를 찾으려면 모든 정점을 순회하면서 아직 방문하지 않은 정점에서 BFS나 DFS를 새로 시작한다. 한 번의 탐색에서 방문한 정점은 모두 같은 연결 요소에 속한다.

```text
for v in vertices:
    if not visited[v]:
        traverse(v)
        componentCount++
```

따라서 새로운 탐색을 시작한 횟수가 연결 요소 수가 된다. 간선이 하나도 없는 **고립 정점(isolated vertex)**도 자기 자신만으로 하나의 연결 요소이므로 정점 전체를 기준으로 순회해야 한다.

각 정점에 연결 요소 ID를 저장하면 이후 두 정점이 같은 연결 요소에 속하는지 빠르게 비교할 수 있다. 다만 그래프의 간선이 바뀌면 기존 연결 요소 정보가 더 이상 현재 구조를 나타내지 않을 수 있으므로 다시 계산해야 할 수 있다.

방향 그래프에서는 방향을 무시하고 연결 여부를 보는 약한 연결성과, 서로 양방향으로 도달 가능한 강한 연결성을 별도로 구분한다. 여기서 설명하는 연결 요소는 기본적으로 무방향 그래프를 대상으로 한다.

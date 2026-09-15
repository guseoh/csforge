---
kind: concept
contentKey: dsa.core.graph.cycle-detection
topicContentKey: dsa.core.graph
slug: cycle-detection
title: "Cycle Detection"
summary: "undirected parent과 directed recursion state로 cycle을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/42digraph/"
    title: "Algorithms, 4th Edition: Directed Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "DAG, cycle과 topological ordering의 관계를 확인한다."
    displayOrder: 1
---
# Cycle Detection

Cycle은 edge를 따라 출발한 vertex로 다시 돌아오는 경로다. Undirected graph와 directed graph에서는 이미 방문한 vertex를 다시 만났을 때의 의미가 다르므로 판정 state도 다르다.

Undirected DFS에서 `u → v`로 이동하면 v의 adjacency에는 다시 u가 보인다. 이것은 같은 edge의 반대 방향일 뿐 cycle이 아니다. 따라서 **parent가 아닌 이미 방문한 neighbor**를 만났을 때 cycle이 존재한다고 판단할 수 있다.

Directed graph에서는 visited 여부 하나로 충분하지 않다. 다음처럼 현재 DFS path 안에 있는지까지 구분해야 한다.

```text
UNVISITED
IN_PROGRESS
FINISHED
```

현재 `IN_PROGRESS`인 vertex로 향하는 edge를 만나면 현재 path의 ancestor로 돌아가는 back edge이므로 directed cycle이다. 이미 `FINISHED`인 vertex를 가리키는 edge는 그것만으로 cycle을 의미하지 않는다.

핵심은 "전에 본 vertex인가"가 아니라 **현재 탐색 경로가 다시 닫히는가**다. 이 차이를 이해하면 DAG의 정상적인 cross edge를 cycle로 잘못 판단하는 실수를 피할 수 있다.

Directed graph에 cycle이 있으면 모든 edge의 선행 관계를 만족하는 topological order를 만들 수 없다. 따라서 cycle detection은 topological sort와 직접 연결된다.

---
kind: concept
contentKey: dsa.core.graph.graph-model
topicContentKey: dsa.core.graph
slug: graph-model
title: "그래프 모델"
summary: "정점·간선·direction·가중치로 문제를 그래프로 모델링한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "무방향 그래프 표현, BFS 최단 경로, DFS와 연결 요소 탐색을 확인한다."
    displayOrder: 1
---
# 그래프 모델

그래프는 대상을 정점으로, 대상 사이의 관계를 간선으로 표현한다. 알고리즘을 고르기 전에 **간선이 무엇을 의미하는지**를 먼저 정의해야 한다.

Undirected 그래프의 간선 `u-v`는 양방향 관계를 나타내고, directed 그래프의 `u -> v`는 방향이 있는 관계를 나타낸다. Weighted 그래프는 간선에 거리·시간·비용 같은 값을 추가한다.

```text
vertex: A, B, C
edge  : A -> B
weight: 5
```

경로는 간선을 따라 이어지는 정점 sequence다. Directed 그래프에서는 방향을 따라가야 하므로 A에서 B로 갈 수 있다고 B에서 A로도 갈 수 있는 것은 아니다.

가중치가 있다면 값의 의미와 허용 범위도 model의 일부다. 예를 들어 음수 간선을 허용하는지 여부는 어떤 shortest-path 알고리즘을 사용할 수 있는지 직접 결정한다.

중복 간선과 self-loop를 허용할지도 명시해야 한다. 같은 두 정점 사이에 여러 관계가 존재할 수 있는지, `A -> A`가 유효한지에 따라 그래프의 불변식과 알고리즘 결과가 달라질 수 있다.

그래프 문제의 첫 단계는 알고리즘이 아니라 **정점, 간선, direction, 가중치와 허용 관계를 정확히 정의하는 것**이다.

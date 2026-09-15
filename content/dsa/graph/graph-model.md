---
kind: concept
contentKey: dsa.core.graph.graph-model
topicContentKey: dsa.core.graph
slug: graph-model
title: "Graph Model"
summary: "vertex·edge·direction·weight로 문제를 graph로 모델링한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "vertex, edge, path, connectivity 같은 graph 기본 모델을 확인한다."
    displayOrder: 1
---
# Graph Model

Graph는 대상을 vertex로, 대상 사이의 관계를 edge로 표현한다. 알고리즘을 고르기 전에 **edge가 무엇을 의미하는지**를 먼저 정의해야 한다.

Undirected graph의 edge `u-v`는 양방향 관계를 나타내고, directed graph의 `u -> v`는 방향이 있는 관계를 나타낸다. Weighted graph는 edge에 거리·시간·비용 같은 값을 추가한다.

```text
vertex: A, B, C
edge  : A -> B
weight: 5
```

Path는 edge를 따라 이어지는 vertex sequence다. Directed graph에서는 방향을 따라가야 하므로 A에서 B로 갈 수 있다고 B에서 A로도 갈 수 있는 것은 아니다.

Weight가 있다면 값의 의미와 허용 범위도 model의 일부다. 예를 들어 음수 edge를 허용하는지 여부는 어떤 shortest-path 알고리즘을 사용할 수 있는지 직접 결정한다.

중복 edge와 self-loop를 허용할지도 명시해야 한다. 같은 두 vertex 사이에 여러 관계가 존재할 수 있는지, `A -> A`가 유효한지에 따라 graph의 invariant와 알고리즘 결과가 달라질 수 있다.

Graph 문제의 첫 단계는 알고리즘이 아니라 **vertex, edge, direction, weight와 허용 관계를 정확히 정의하는 것**이다.

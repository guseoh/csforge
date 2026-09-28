---
kind: concept
contentKey: dsa.core.graph-path.minimum-spanning-tree
topicContentKey: dsa.core.graph-path
slug: minimum-spanning-tree
title: "최소 신장 트리(MST)"
summary: "모든 정점을 최소 가중치로 연결하는 불변식과 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "MST의 컷 속성(cut property), Prim·Kruskal 선택과 구현 비용을 확인한다."
    displayOrder: 1
---
# 최소 신장 트리(MST)

연결된 무방향 가중치 그래프에서 신장 트리(spanning tree)는 **모든 정점을 포함하면서 사이클이 없는 연결 부분 그래프**다. 정점이 `V`개라면 신장 트리는 정확히 `V-1`개의 간선을 가진다.

최소 신장 트리(MST)는 가능한 신장 트리 가운데 **선택한 간선 가중치의 총합이 가장 작은 트리**다.

```text
목표: 특정 시작 정점에서 목적지까지의 거리 최소화가 아니라
      모든 정점을 연결하는 간선의 총 가중치 최소화
```

이 점에서 최단 경로 문제와 목적이 다르다. MST 안의 두 정점 사이 경로가 원래 그래프에서 두 정점 사이의 최단 경로라는 보장은 없다.

MST 알고리즘의 탐욕 선택은 컷 속성(cut property)과 연결된다. 정점 집합을 두 부분으로 나누는 컷을 생각했을 때, 그 컷을 가로지르는 적절한 최소 가중치 간선은 현재까지의 선택을 깨뜨리지 않고 MST에 포함할 수 있는 **안전한 간선(safe edge)**이 된다.

Kruskal은 여러 연결 요소를 합치는 방식으로, Prim은 하나의 트리를 바깥으로 확장하는 방식으로 이 성질을 사용한다.

같은 가중치의 간선이 여러 개라면 MST가 하나만 존재하지 않을 수도 있다. 또 그래프가 연결되어 있지 않다면 모든 정점을 하나의 신장 트리로 연결할 수 없고, 연결 요소마다 최소 신장 트리를 만든 **최소 신장 포리스트(minimum spanning forest)**를 생각해야 한다.

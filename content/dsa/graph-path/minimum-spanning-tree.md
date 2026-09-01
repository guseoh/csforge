---
kind: concept
contentKey: dsa.core.graph-path.minimum-spanning-tree
topicContentKey: dsa.core.graph-path
slug: minimum-spanning-tree
title: "Minimum Spanning Tree"
summary: "weighted undirected graph의 모든 vertex를 cycle 없이 잇는 최소 총비용 tree를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "spanning tree, cut property와 MST 선택 근거를 확인한다."
    displayOrder: 1
---
# Minimum Spanning Tree

### 모든 vertex를 최소 총비용으로 연결한다

Connected weighted undirected graph에서 spanning tree는 모든 vertex를 포함하면서 cycle이 없는 연결 subgraph다. Vertex가 `V`개인 tree는 정확히 `V-1`개의 edge를 가진다.

가능한 spanning tree가 여러 개라면 각 tree의 edge weight 합을 비교할 수 있다. 이 총합이 가장 작은 spanning tree가 Minimum Spanning Tree, MST다.

```text
목표: source-to-target 거리 최소화가 아니라
      전체 vertex를 연결하는 edge 총합 최소화
```

### Shortest path와 문제 자체가 다르다

MST와 shortest path tree는 둘 다 tree 모양 결과를 만들 수 있어 자주 혼동한다.

Shortest path는 특정 source에서 각 target까지의 path cost를 최소화한다. MST는 개별 source-target path가 얼마나 짧은지와 무관하게 **전체 연결에 사용한 edge weight 합**을 최소화한다.

따라서 MST path가 source에서 target까지 shortest path라는 보장은 없다.

### Cycle이 없는 이유

Spanning tree에 cycle이 있다면 cycle 안 edge 하나를 제거해도 나머지 edge를 통해 vertex들이 계속 연결되어 있다. Weight가 음수 같은 특수한 모델을 별도로 허용하지 않는 일반 MST 문제에서는 불필요한 cycle edge를 유지할 이유가 없다.

Tree 구조이므로 `V-1`개의 edge를 선택하면 연결성과 cycle-free 조건이 함께 중요하다. Edge 수만 `V-1`이라고 자동으로 spanning tree인 것은 아니다. 모든 vertex가 실제로 connected인지 확인해야 한다.

### Cut Property

Graph의 vertex 집합을 두 부분으로 나누는 경계를 cut이라고 하자. 현재 MST의 일부 edge가 이 cut을 아직 연결하지 않았을 때, cut을 가로지르는 가장 가벼운 safe edge를 선택할 수 있다는 성질이 cut property다.

이 원리가 Kruskal과 Prim의 greedy 선택을 정당화한다. 두 알고리즘의 구현 방식은 다르지만 "현재 선택에 안전한 최소 edge"라는 관점을 공유한다.

### Cycle 관점

Cycle 안에서 상대적으로 무거운 edge를 제외하고도 나머지 vertex를 연결할 수 있다면 그 무거운 edge는 최소 총비용 tree에 불리하다. 이 cycle property는 Kruskal이 이미 연결된 component 사이에 cycle을 만드는 edge를 건너뛰는 직관과 연결된다.

### MST가 유일하지 않을 수 있다

같은 weight를 가진 edge가 여러 개라면 총 weight가 같은 MST가 여러 개 존재할 수 있다. 따라서 특정 edge 집합 자체가 유일하다고 가정하면 안 된다.

Deterministic output이 필요하면 edge key 같은 tie-breaker를 둘 수 있지만, 이것은 MST correctness와 별도 요구다.

### Disconnected graph

Graph가 disconnected라면 모든 vertex를 하나의 tree로 연결할 수 없으므로 MST가 존재하지 않는다. 각 component마다 MST를 계산하면 Minimum Spanning Forest를 얻을 수 있다.

### 실제 문제와 맞는지 먼저 확인한다

Network cable 설치 비용처럼 모든 지점을 최소 총비용으로 연결하려는 문제에는 MST가 잘 맞는다. 반면 redundancy, capacity, 장애 우회, source별 latency가 중요하다면 단순 MST는 충분하지 않다.

즉 MST는 "연결 비용 최소화"라는 매우 구체적인 objective를 가진다. 실제 시스템 요구를 그 objective로 축약해도 되는지 먼저 확인해야 한다.

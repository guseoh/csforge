---
kind: concept
contentKey: dsa.core.graph.topological-sort
topicContentKey: dsa.core.graph
slug: topological-sort
title: "Topological Sort"
summary: "DAG의 선행 관계를 indegree 또는 finish order로 선형화한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/42digraph/"
    title: "Algorithms, 4th Edition: Directed Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "DAG, cycle과 topological ordering의 관계를 확인한다."
    displayOrder: 1
---
# Topological Sort

Topological sort는 directed edge `u -> v`를 "u가 v보다 먼저 와야 한다"는 선행 관계로 보고, 모든 edge의 조건을 만족하도록 vertex를 한 줄로 나열하는 방법이다.

```text
A -> C
B -> C
C -> D
```

가능한 순서는 `A, B, C, D` 또는 `B, A, C, D`처럼 여러 개일 수 있다. 직접 선행 관계가 없는 vertex 사이의 상대 순서는 유일하지 않을 수 있다.

Topological order는 cycle이 없는 directed graph, 즉 DAG에서만 존재한다. `A -> B -> C -> A`처럼 cycle이 있으면 서로가 서로보다 먼저 와야 하는 모순이 생긴다.

Kahn 알고리즘은 indegree가 0인 vertex부터 제거한다. 현재 indegree가 0이라는 것은 아직 남아 있는 graph에서 선행 조건이 없다는 뜻이다.

```text
1. 모든 vertex의 indegree 계산
2. indegree 0을 queue에 추가
3. 하나를 꺼내 결과에 추가
4. outgoing edge의 neighbor indegree 감소
5. 새로 0이 된 vertex를 queue에 추가
```

모든 과정을 끝냈는데 처리한 vertex 수가 V보다 작다면 남은 vertex들이 서로 cycle을 이루고 있어 valid topological order가 없다는 뜻이다.

DFS 방식에서는 모든 descendant를 처리한 뒤의 finish order를 역순으로 사용할 수도 있다. 이 경우에도 DFS 중 back edge가 발견되면 cycle이므로 결과를 만들 수 없다.

Topological sort의 핵심은 **edge가 표현하는 선행 관계를 유지하면서 모든 vertex를 선형화하는 것**이다.

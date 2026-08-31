---
kind: concept
contentKey: dsa.core.graph-path.prim
topicContentKey: dsa.core.graph-path
slug: prim
title: "Prim"
summary: "현재 tree와 frontier를 잇는 최소 edge를 선택한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "MST의 cut과 cycle 선택 근거를 확인한다."
    displayOrder: 1
---
# Prim

Prim은 하나의 vertex에서 시작해 현재 tree와 바깥 vertex를 잇는 최소 frontier edge를 반복 선택한다. 선택할 때마다 tree에 새 vertex를 추가하고 그 vertex의 incident edge로 frontier를 갱신한다.

priority queue가 outdated edge를 포함할 수 있으므로 endpoint가 이미 tree 안인지 확인한다. disconnected graph에서는 시작 component만 처리하므로 모든 component를 순회하면 forest가 된다.

### Backend 연결

현재 선택된 콘텐츠 묶음에 가장 낮은 연결 비용으로 새 concept을 붙이는 모델에 응용할 수 있다. 알고리즘 적용 전에 edge가 undirected이고 weight가 additive인지 검증한다.


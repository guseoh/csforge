---
kind: concept
contentKey: dsa.core.graph-path.bellman-ford
topicContentKey: dsa.core.graph-path
slug: bellman-ford
title: "Bellman-Ford"
summary: "모든 edge relaxation 반복과 negative cycle 감지를 수행한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "weighted shortest path의 relaxation 조건을 확인한다."
    displayOrder: 1
---
# Bellman-Ford

Bellman-Ford는 모든 edge를 반복적으로 relaxation해 음수 edge가 있는 graph의 single-source shortest path를 계산한다. 단순 경로는 최대 `V-1`개의 edge를 가지므로 그만큼 pass한 뒤에도 개선이 가능하면 reachable negative cycle을 의심한다.

한 pass에서 갱신이 없으면 조기 종료할 수 있지만, predecessor와 distance의 source 초기화는 정확해야 한다. negative cycle이 있으면 유한한 최단 거리가 정의되지 않을 수 있으므로 상태를 오류로 구분한다.

### Backend 연결

제약·보상 모델에 음수 비용이 허용되는 경우 결과와 negative cycle 진단을 함께 저장한다. 진단 없이 임의의 큰 수를 답으로 반환하면 추천 품질과 재현성이 무너진다.


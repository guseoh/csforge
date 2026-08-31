---
kind: concept
contentKey: dsa.core.trees.balanced-tree-motivation
topicContentKey: dsa.core.trees
slug: balanced-tree-motivation
title: "Balanced Tree Motivation"
summary: "편향된 BST가 선형화되는 문제와 balance 목적을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/33balanced/"
    title: "Algorithms, 4th Edition: Balanced Search Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "tree height와 balancing의 이유를 확인한다."
    displayOrder: 1
---
# Balanced Tree Motivation

BST에 오름차순 key를 차례로 넣으면 각 node가 한 child만 가진 chain이 되어 검색과 update가 O(n)으로 악화된다. balanced tree는 height를 log n 근처로 유지해 path 비용을 제한하지만 balance metadata와 rotation을 관리하는 update 비용을 추가한다.

완벽히 균등한 tree를 매번 만드는 것이 항상 최적은 아니다. 삽입·삭제가 많은 workload에서는 제한된 imbalance를 허용하는 정책이 전체 비용과 구현 복잡도의 균형을 이룬다.

### Backend 연결

정렬된 map을 선택할 때 read-heavy인지 write-heavy인지와 worst-case SLA를 본다. hash table의 평균 lookup과 balanced tree의 ordered traversal을 요구사항별로 구분한다.


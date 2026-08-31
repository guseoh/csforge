---
kind: concept
contentKey: dsa.core.trees.tree-terminology
topicContentKey: dsa.core.trees
slug: tree-terminology
title: "Tree Terminology"
summary: "root·leaf·depth·height와 subtree 관계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/32bst/"
    title: "Algorithms, 4th Edition: Binary Search Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "BST ordering invariant와 탐색 경로를 확인한다."
    displayOrder: 1
---
# Tree Terminology

tree는 cycle 없이 parent-child 관계를 가진 연결 구조이며 root에서 시작해 subtree를 재귀적으로 가진다. leaf는 child가 없고 depth는 root에서의 edge 수, height는 subtree 아래 가장 긴 edge 수다. 이 용어를 섞으면 balance와 복잡도 계산이 틀어진다.

같은 node 수라도 한쪽으로 치우친 tree의 height는 n에 가깝고 균형 tree는 log n에 가깝다. operation 비용은 node 수보다 탐색 path의 height에 의해 결정되는 경우가 많다.

### Backend 연결

계층형 category와 routing tree를 모델링할 때 depth 제한과 cycle 검사를 둔다. database path나 JSON nesting을 자료구조 tree의 자동 balance 보장으로 오해하지 않는다.

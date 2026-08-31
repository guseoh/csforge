---
kind: concept
contentKey: dsa.core.trees.binary-search-tree
topicContentKey: dsa.core.trees
slug: binary-search-tree
title: "Binary Search Tree"
summary: "left < node < right invariant가 검색 경로를 줄이는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/32bst/"
    title: "Algorithms, 4th Edition: Binary Search Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "BST ordering invariant와 탐색 경로를 확인한다."
    displayOrder: 1
---
# Binary Search Tree

BST는 각 node의 left subtree key가 작고 right subtree key가 크다는 ordering invariant를 가진다. 검색은 비교 결과에 따라 한 subtree만 선택해 height만큼 내려가며, 삽입·삭제도 이 invariant를 보존하도록 successor나 predecessor를 연결한다.

입력 순서가 이미 정렬되면 tree가 한쪽으로 치우쳐 O(n)이 된다. duplicate key를 왼쪽에 둘지 count로 합칠지 정책이 없으면 search·delete 결과가 일관되지 않는다.

### Backend 연결

ordered index가 필요한 in-memory 구조에서 balance 보장과 memory overhead를 비교한다. key mutation은 node가 놓인 ordering을 깨뜨리므로 저장 후 식별 필드를 바꾸지 않는다.


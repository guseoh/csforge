---
kind: concept
contentKey: dsa.core.trees.binary-tree-traversal
topicContentKey: dsa.core.trees
slug: binary-tree-traversal
title: "Binary Tree Traversal"
summary: "preorder·inorder·postorder·level order의 방문 상태를 비교한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/32bst/"
    title: "Algorithms, 4th Edition: Binary Search Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "BST ordering invariant와 탐색 경로를 확인한다."
    displayOrder: 1
---
# Binary Tree Traversal

preorder는 node를 먼저, inorder는 left·node·right, postorder는 child 뒤에 node를 방문한다. level order는 queue에 현재 level의 child를 넣어 너비 순서로 처리한다. 재귀 구현은 call stack이 방문 상태를 보존하고 반복 구현은 명시적 stack/queue가 이를 대신한다.

BST의 inorder 결과는 정렬 순서가 되지만 일반 binary tree에는 그런 보장이 없다. visited를 잘못 관리하거나 child를 두 번 넣으면 누락·중복 방문과 공간 폭증이 생긴다.

### Backend 연결

계층 JSON 생성과 dependency walk에서 필요한 순서가 무엇인지 먼저 정한다. 깊은 tree는 recursive stack 한계와 streaming 결과를 함께 고려한다.

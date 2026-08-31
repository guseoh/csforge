---
kind: concept
contentKey: dsa.core.trees.tree-rotation
topicContentKey: dsa.core.trees
slug: tree-rotation
title: "Tree Rotation"
summary: "inorder를 유지하면서 높이를 바꾸는 rotation의 링크 갱신을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/33balanced/"
    title: "Algorithms, 4th Edition: Balanced Search Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "tree height와 balancing의 이유를 확인한다."
    displayOrder: 1
---
# Tree Rotation

rotation은 subtree root와 child의 parent link를 바꾸면서 inorder key 순서를 유지하는 local transformation이다. right rotation은 왼쪽 child를 올리고 그 child의 오른쪽 subtree를 내려보내며, parent·child·root 연결을 모두 갱신해야 한다.

rotation 하나가 전체 tree를 정렬하는 것은 아니며 AVL·red-black 같은 balance 규칙의 일부다. 색·height metadata를 갱신하는 순서가 틀리면 다음 search는 맞아 보여도 이후 rotation에서 invariant가 깨진다.

### Backend 연결

ordered index 구현을 리뷰할 때 rotation 전후 inorder와 parent link를 테스트한다. lock을 잡은 concurrent tree에서 local pointer 갱신의 atomicity도 별도로 보장해야 한다.

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
    recommendation: "tree path, subtree와 height가 search 비용에 연결되는 방식을 확인한다."
    displayOrder: 1
---
# Binary Search Tree

Binary Search Tree(BST)는 각 node를 기준으로 left subtree에는 더 작은 key, right subtree에는 더 큰 key가 오도록 ordering invariant를 유지한다. Duplicate를 허용한다면 어느 쪽에 둘지, 별도 count로 합칠지 같은 정책도 함께 정의해야 한다.

```text
        8
      /   \
     3     12
    / \    / \
   1   6  10  14
```

Key 10을 찾을 때 8보다 크므로 left subtree 전체를 버릴 수 있고, 12보다 작으므로 12의 right subtree도 볼 필요가 없다. Search와 insert는 이런 비교를 반복하며 root에서 하나의 path만 따라간다.

따라서 비용은 tree의 node 수보다 height `h`에 직접 좌우되어 O(h)이다. Height가 O(log n) 수준이면 효율적이지만, 정렬된 key를 순서대로 넣어 한쪽으로 치우치면 height가 O(n)까지 커질 수 있다. BST라는 이름만으로 logarithmic search가 보장되는 것은 아니다.

Delete는 구조와 ordering을 함께 보존해야 한다. Leaf는 바로 제거할 수 있고, child가 하나라면 그 child를 연결할 수 있다. Child가 둘인 node는 inorder successor 또는 predecessor 같은 대체 key를 사용해 모든 subtree의 ordering invariant가 계속 성립하도록 해야 한다.

BST에서 중요한 것은 pointer가 연결되어 있다는 사실이 아니라 **모든 node에서 ordering invariant가 유지된다는 것**이다. 이 invariant가 깨지면 node가 실제로 존재해도 search가 잘못된 방향을 선택해 찾지 못할 수 있다.

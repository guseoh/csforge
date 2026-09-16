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
    recommendation: "tree path, subtree와 height가 search 비용에 연결되는 방식을 확인한다."
    displayOrder: 1
---
# Tree Terminology

Tree는 node 사이의 parent-child 관계로 계층을 표현하는 자료구조다. Rooted tree에서는 하나의 root에서 시작하고, root를 제외한 각 node는 하나의 parent를 가진다. Child가 없는 node를 leaf라 하고, 어떤 node와 그 아래 descendants 전체를 그 node의 subtree라고 한다.

```text
        A
      /   \
     B     C
    / \
   D   E
```

위 tree에서 A는 root이고 D, E, C는 leaf다. B의 subtree는 B, D, E로 이루어진다. 이런 관계는 이후 traversal, BST, heap 같은 구조의 invariant를 표현하는 기본 언어가 된다.

Depth와 height는 방향이 다르다. Node의 depth는 root에서 그 node까지의 edge 수이고, node의 height는 그 node에서 가장 깊은 leaf까지의 최대 edge 수다. 따라서 root의 depth는 0이고 leaf의 height는 0이다. Tree 전체의 height는 root의 height다.

많은 tree operation의 비용은 node 수 `n` 자체보다 실제로 따라가야 하는 path 길이, 즉 height `h`에 직접 좌우된다. 같은 수의 node를 가져도 균형 잡힌 tree는 height가 작을 수 있지만 한쪽으로 치우친 tree는 height가 `n-1`까지 커질 수 있다.

자료구조 의미의 tree는 cycle이 없고 root에서 각 node로 가는 경로가 하나라는 성질을 가진다. 일반 graph는 이런 제약을 반드시 만족하지 않으므로, tree와 graph를 같은 계층 구조라는 이유만으로 동일하게 취급해서는 안 된다.

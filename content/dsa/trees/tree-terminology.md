---
kind: concept
contentKey: dsa.core.trees.tree-terminology
topicContentKey: dsa.core.trees
slug: tree-terminology
title: "트리 용어"
summary: "루트·리프·깊이·높이와 부분 트리 관계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/32bst/"
    title: "Algorithms, 4th Edition: Binary Search Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "BST 정렬 불변식, 탐색 경로, 순회와 트리 높이가 연산 비용에 미치는 영향을 확인한다."
    displayOrder: 1
---
# 트리 용어

트리(tree)는 노드 사이의 부모-자식 관계로 계층을 표현하는 자료구조다. 루트가 있는 트리(rooted tree)에서는 하나의 루트에서 시작하고, 루트를 제외한 각 노드는 하나의 부모를 가진다. 자식이 없는 노드를 리프(leaf)라 하고, 어떤 노드와 그 아래 모든 자손을 그 노드의 부분 트리(subtree)라고 한다.

```text
        A
      /   \
     B     C
    / \
   D   E
```

위 트리에서 A는 루트이고 D, E, C는 리프다. B의 부분 트리는 B, D, E로 이루어진다. 이런 관계는 이후 트리 순회, 이진 탐색 트리(BST), 힙 같은 구조의 불변식을 설명하는 기본 언어가 된다.

깊이와 높이는 기준 방향이 다르다. 노드의 깊이는 루트에서 그 노드까지의 간선 수이고, 노드의 높이는 그 노드에서 가장 깊은 리프까지의 최대 간선 수다. 따라서 루트의 깊이는 0이고 리프의 높이는 0이다. 트리 전체의 높이는 루트의 높이다.

많은 트리 연산의 비용은 노드 수 `n` 자체보다 실제로 따라가야 하는 경로 길이, 즉 높이 `h`에 직접 좌우된다. 같은 수의 노드를 가져도 균형 잡힌 트리는 높이가 작을 수 있지만 한쪽으로 치우친 트리는 높이가 `n-1`까지 커질 수 있다.

자료구조로서 트리는 사이클이 없고 루트에서 각 노드로 가는 경로가 하나라는 성질을 가진다. 일반 그래프는 이런 제약을 반드시 만족하지 않으므로 단순히 둘 다 연결 구조라는 이유로 같은 것으로 취급해서는 안 된다.

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
    recommendation: "tree path, subtree와 height가 search 비용에 연결되는 방식을 확인한다."
    displayOrder: 1
---
# Binary Tree Traversal

Binary tree traversal은 모든 node를 방문하되, node 자신을 left/right subtree보다 언제 처리하는지에 따라 순서가 달라진다.

```text
        A
       / \
      B   C
     / \
    D   E
```

이 tree의 preorder는 `A B D E C`, inorder는 `D B E A C`, postorder는 `D E B C A`다. Level order는 depth가 작은 node부터 방문하므로 `A B C D E`가 된다.

세 가지 depth-first traversal은 재귀 구조에서 처리 위치만 바뀐다고 볼 수 있다.

```text
preorder  : visit(node) → left → right
inorder   : left → visit(node) → right
postorder : left → right → visit(node)
```

Preorder는 parent를 먼저 처리해야 할 때, postorder는 child 결과를 모두 얻은 뒤 parent를 처리해야 할 때 자연스럽다. Inorder는 일반 binary tree를 자동으로 정렬하는 방식이 아니라, **BST ordering invariant가 있을 때** key를 정렬된 순서로 방문한다.

Recursive traversal은 call stack이 현재 node와 복귀 위치를 기억한다. Iterative traversal은 이 state를 explicit stack에 직접 저장한다. Level order는 같은 depth의 node를 먼저 처리해야 하므로 queue를 사용한다.

모든 node를 한 번씩 방문한다면 시간 복잡도는 O(n)이다. 추가 공간은 traversal 방식과 tree height에 따라 달라진다. 특히 skewed tree에서 recursive DFS는 호출 깊이가 O(n)까지 커질 수 있으므로, traversal의 방문 순서와 함께 어떤 state를 어디에 저장하는지도 이해해야 한다.

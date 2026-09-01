---
kind: concept
contentKey: dsa.core.trees.binary-tree-traversal
topicContentKey: dsa.core.trees
slug: binary-tree-traversal
title: "Binary Tree Traversal"
summary: "preorder·inorder·postorder·level order를 방문 시점과 필요한 state structure로 비교한다."
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

### 같은 tree라도 언제 node를 처리하느냐에 따라 결과가 달라진다

binary tree traversal은 모든 node를 방문하지만 **node 자신을 child보다 언제 처리하는지**에 따라 의미가 달라진다.

```text
        A
       / \
      B   C
     / \
    D   E
```

이 tree에서 preorder는 `A B D E C`, inorder는 `D B E A C`, postorder는 `D E B C A`가 된다. level order는 depth가 작은 node부터 `A B C D E` 순서로 방문한다.

### preorder, inorder, postorder는 재귀 호출의 처리 위치가 다르다

재귀 함수를 생각하면 세 방식은 node를 처리하는 한 줄의 위치만 달라진다.

```text
preorder  : visit(node) → left → right
inorder   : left → visit(node) → right
postorder : left → right → visit(node)
```

preorder는 parent의 정보를 먼저 사용해야 할 때 자연스럽고, postorder는 child 결과를 모두 얻은 뒤 parent를 계산하거나 제거할 때 적합하다. inorder는 **BST ordering invariant가 있을 때** key를 정렬된 순서로 방문한다. 일반 binary tree의 inorder가 자동으로 sorted라는 뜻은 아니다.

### recursion은 call stack에 방문 상태를 숨겨 둔다

recursive traversal에서는 runtime call stack이 `현재 node`, `어느 child까지 처리했는가`를 기억한다. iterative traversal에서는 이 state를 직접 stack에 넣어야 한다. level order는 DFS stack이 아니라 queue를 사용해 현재 depth의 node를 먼저 처리한다.

깊이가 매우 큰 skewed tree라면 recursion depth가 tree height만큼 증가해 stack limit 문제가 생길 수 있다. 이 경우 explicit stack으로 바꿔도 total work O(n)은 같지만 call-stack dependency를 제어할 수 있다.

### traversal order는 작업의 dependency를 표현한다

directory-like tree를 삭제한다고 가정하면 parent를 먼저 삭제하는 preorder는 child가 아직 남아 있는 상태를 만들 수 있다. child cleanup이 선행되어야 한다면 postorder가 자연스럽다. 반대로 serialized structure를 parent부터 생성해야 한다면 preorder가 더 적합할 수 있다.

따라서 traversal은 이름을 외우는 문제가 아니라 **현재 operation에서 parent와 child 중 누가 먼저 처리되어야 correctness가 성립하는가**를 결정하는 문제다.

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
    recommendation: "rotation 전후 ordering invariant와 local link 변화를 확인한다."
    displayOrder: 1
---
# Tree Rotation

Rotation은 BST의 key ordering을 유지한 채 local subtree의 모양을 바꾸는 transformation이다. Balanced tree는 insert/delete 뒤 height invariant를 복구할 때 이 연산을 사용한다.

예를 들어 `y`를 기준으로 right rotation하면 다음처럼 바뀐다.

```text
        y                  x
       / \                / \
      x   C      →       A   y
     / \                    / \
    A   B                  B   C
```

Rotation 전후 inorder sequence는 모두 `A, x, B, y, C`다. 즉 key의 정렬 관계는 그대로이고 parent-child 구조와 subtree height만 달라진다.

Correctness를 위해서는 여러 link를 함께 갱신해야 한다. `x`가 `y`의 자리를 차지하고, `B`는 `y`의 left subtree가 되며, `y`는 `x`의 right child가 된다. 기존 parent가 있다면 새 subtree root를 가리키도록 연결해야 하고, parent pointer나 height/color metadata를 저장한다면 그것도 현재 구조와 맞춰야 한다.

Rotation 자체가 balance policy는 아니다. 언제 left/right rotation을 할지, 한 번 또는 두 번 수행할지, 어떤 metadata를 갱신할지는 AVL이나 red-black tree 같은 별도의 balance invariant가 결정한다.

따라서 rotation을 이해할 때는 pointer 배치만 외우기보다 **inorder ordering은 보존되고, local shape만 바뀐다는 invariant**를 기준으로 전후 상태를 추적하는 것이 중요하다.

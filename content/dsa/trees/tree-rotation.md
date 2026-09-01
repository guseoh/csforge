---
kind: concept
contentKey: dsa.core.trees.tree-rotation
topicContentKey: dsa.core.trees
slug: tree-rotation
title: "Tree Rotation"
summary: "BST inorder ordering을 보존하면서 local subtree의 높이와 parent-child 연결을 바꾸는 rotation을 설명한다."
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

### rotation은 정렬 순서를 바꾸지 않고 모양을 바꾼다

rotation은 balanced search tree가 height를 조정할 때 사용하는 local transformation이다. 핵심은 subtree root와 child의 parent-child 관계를 바꾸면서 **inorder key 순서를 그대로 유지**하는 것이다.

예를 들어 `y`를 기준으로 right rotation한다고 하자.

```text
        y                  x
       / \                / \
      x   C    →         A   y
     / \                    / \
    A   B                  B   C
```

rotation 전 inorder는 `A, x, B, y, C`이고 rotation 후에도 동일하다. 그래서 BST ordering correctness를 유지하면서 subtree의 높이 분포만 바꿀 수 있다.

### link 하나만 바꾸는 연산이 아니다

right rotation에서는 최소한 다음 관계를 함께 갱신해야 한다.

1. x가 y의 자리를 차지한다.
2. B는 y의 left subtree가 된다.
3. y는 x의 right child가 된다.
4. y의 기존 parent가 있었다면 그 parent도 새 subtree root x를 가리켜야 한다.

parent pointer를 저장하는 구현이라면 각 node의 parent도 일관되게 바꿔야 한다. 이 중 하나라도 빠지면 subtree가 유실되거나 cycle이 생길 수 있다.

### rotation 자체가 balance policy는 아니다

rotation은 도구일 뿐이다. 언제 left/right rotation을 할지, 한 번인지 두 번인지, 어떤 metadata를 갱신할지는 AVL·red-black tree 같은 balance rule이 결정한다.

따라서 `rotation을 하면 항상 balance된다`고 이해하면 안 된다. 잘못된 위치에서 rotation하거나 height/color metadata를 갱신하지 않으면 BST ordering은 잠시 맞아 보여도 balance invariant가 깨질 수 있다.

### 검증할 때는 inorder와 구조 invariant를 함께 본다

rotation 테스트에서는 단순히 root key만 확인하지 않는다. 전후 inorder sequence가 같은지, subtree의 모든 node가 여전히 도달 가능한지, parent-child link가 양방향으로 일치하는지, balance metadata가 현재 구조와 맞는지를 확인해야 한다.

이렇게 보면 rotation은 pointer trick이 아니라 **ordered set을 보존한 채 tree shape를 바꾸는 invariant-preserving transformation**으로 이해할 수 있다.

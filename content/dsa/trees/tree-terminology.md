---
kind: concept
contentKey: dsa.core.trees.tree-terminology
topicContentKey: dsa.core.trees
slug: tree-terminology
title: "Tree Terminology"
summary: "root·parent·child·subtree·depth·height를 하나의 경로 모델로 연결해 tree operation 비용을 읽는 기준을 만든다."
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

### tree는 parent-child 관계가 만드는 계층 구조다

rooted tree에서는 하나의 root에서 시작해 각 node가 0개 이상의 child를 가진다. root를 제외한 node는 하나의 parent를 가지며, 어떤 node와 그 아래 descendants를 함께 보면 하나의 subtree가 된다. leaf는 child가 없는 node다.

```text
        A   ← root
      /   \
     B     C
    / \
   D   E       ← D,E,C는 leaf
```

A의 child는 B,C이고 B의 subtree는 B,D,E다. 이런 관계를 정확히 구분해야 traversal, BST, heap처럼 이후 자료구조의 invariant를 문장으로 표현할 수 있다.

### depth와 height는 방향이 다르다

depth는 root에서 현재 node까지 내려온 edge 수다. 반대로 node의 height는 그 node에서 가장 깊은 leaf까지 내려가는 longest path의 edge 수다. tree height는 root의 height다.

위 예에서 A의 depth는 0, D의 depth는 2다. D의 height는 0이고 B의 height는 1, tree height는 2다.

이 차이가 중요한 이유는 많은 tree operation의 비용이 전체 node 수 n보다 **실제로 따라가는 path의 길이, 즉 height**에 직접 좌우되기 때문이다.

### node 수가 같아도 height는 크게 달라질 수 있다

5개의 node가 balanced하게 배치되면 height가 작지만, 모든 node가 한 child만 갖는 chain이면 height는 n-1까지 커진다.

```text
balanced-ish       skewed
    A                 A
   / \                 \
  B   C                 B
 / \                     \
D   E                     C
                            \
                             D
```

따라서 `tree이므로 빠르다`는 말은 성립하지 않는다. search structure라면 ordering invariant와 함께 height를 어떻게 제한하는지가 중요하다.

### tree와 graph의 경계

일반 graph와 달리 rooted tree는 parent-child 구조에서 cycle이 없어 root에서 각 node로 가는 경로가 하나라는 성질을 사용한다. 실제 category/dependency data가 cycle을 허용하면 자료구조 의미의 tree가 아니다. application model을 tree라고 부르기 전에 orphan, multiple parent, cycle 허용 여부를 먼저 확인해야 한다.

---
kind: concept
contentKey: dsa.core.trees.balanced-tree-motivation
topicContentKey: dsa.core.trees
slug: balanced-tree-motivation
title: "Balanced Tree Motivation"
summary: "편향된 BST가 선형화되는 문제와 balance의 목적을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/33balanced/"
    title: "Algorithms, 4th Edition: Balanced Search Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "rotation 전후 ordering invariant와 local link 변화를 확인한다."
    displayOrder: 1
---
# Balanced Tree Motivation

BST는 ordering invariant로 올바른 검색 방향을 정하지만, height가 작다는 보장은 하지 않는다. 예를 들어 오름차순 key를 차례로 insert하면 한쪽 child만 이어지는 구조가 될 수 있다.

```text
1
 \
  2
   \
    3
     \
      4
```

이 경우 height가 O(n)이므로 search와 insert도 O(n)까지 악화된다. Balancing의 목적은 **ordering을 유지하면서 search/update가 따라가는 path의 길이를 제한하는 것**이다.

Balanced search tree는 subtree height, color, rank 같은 추가 invariant를 사용해 한 방향으로 tree가 계속 커지는 것을 제한한다. AVL tree와 red-black tree처럼 구체적인 규칙은 다르지만, 충분히 작은 height를 유지해 O(log n) 수준의 path를 보장하려는 목표는 같다.

이 보장을 위해 insert/delete 뒤에는 rotation이나 metadata update 같은 추가 작업이 필요할 수 있다. 즉 단순 BST보다 update 구현이 복잡해지는 대신, 입력 순서가 나빠도 search path가 선형으로 무너지는 것을 막는다.

Balance는 tree를 항상 완전한 모양으로 만드는 것이 아니다. 필요한 height bound를 유지할 정도의 imbalance는 허용할 수 있으며, 얼마나 엄격하게 균형을 제한하는지는 search path 길이와 update 비용 사이의 trade-off가 된다.

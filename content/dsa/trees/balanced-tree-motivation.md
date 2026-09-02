---
kind: concept
contentKey: dsa.core.trees.balanced-tree-motivation
topicContentKey: dsa.core.trees
slug: balanced-tree-motivation
title: "Balanced Tree Motivation"
summary: "BST의 height가 O(n)으로 무너지는 문제와 balance invariant가 path 길이를 제한하는 이유를 설명한다."
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

### BST의 성능은 ordering만으로 보장되지 않는다

BST는 key 비교로 한 subtree를 버릴 수 있지만 search 비용은 여전히 tree height `h`에 비례한다. 입력 순서가 좋으면 h가 log n 근처일 수 있지만, 오름차순 key를 그대로 insert하면 한쪽 child만 이어지는 chain이 만들어질 수 있다.

```text
1 → 2 → 3 → 4 → 5
```

이 경우 search·insert는 최악 O(n)이다. 즉 **BST ordering invariant는 correctness를 보장하지만 작은 height까지 보장하지는 않는다.** balancing이 필요한 이유가 여기 있다.

### balance는 path 길이에 추가 제약을 둔다

balanced search tree는 subtree height, node color, rank 같은 추가 metadata/invariant를 사용해 특정 방향으로 height가 계속 커지는 것을 제한한다. 구체적인 규칙은 AVL, red-black tree 등 구현마다 다르지만 목표는 공통적이다.

```text
search/update path length를 O(log n) 수준으로 제한
```

이를 위해 insert/delete 뒤 local rotation과 metadata update가 추가될 수 있다. 따라서 read path는 안정되지만 update implementation은 단순 BST보다 복잡해진다.

### 완벽한 균형이 목표는 아니다

모든 insert 뒤 tree를 완전 binary tree 모양으로 다시 만드는 것은 지나치게 비싸다. 실제 balanced tree는 correctness와 height upper bound에 필요한 정도의 imbalance를 허용한다.

예를 들어 더 강한 balance 규칙은 search path를 조금 더 짧게 만들 수 있지만 update 때 더 자주 rotation해야 할 수 있다. 반대로 느슨한 규칙은 update work를 줄이는 대신 최대 height가 조금 커질 수 있다.

### hash table과의 비교도 요구사항에서 시작한다

ordered traversal, predecessor/successor, range search가 필요하면 balanced tree가 자연스럽다. 단순 equality lookup만 필요하면 hash table이 더 적합할 수 있다. 여기서 중요한 것은 `tree가 O(log n), hash가 O(1)`이라는 숫자 비교 하나가 아니라 **worst-case 보장, ordering 필요성, memory layout, update 비율**을 함께 보는 것이다.

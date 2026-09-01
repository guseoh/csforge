---
kind: concept
contentKey: dsa.core.trees.binary-search-tree
topicContentKey: dsa.core.trees
slug: binary-search-tree
title: "Binary Search Tree"
summary: "ordering invariant가 search path를 한쪽 subtree로 줄이는 원리와 height 의존 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/32bst/"
    title: "Algorithms, 4th Edition: Binary Search Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "BST search/insert/delete와 tree height 관계를 확인한다."
    displayOrder: 1
---
# Binary Search Tree

### ordering invariant가 불가능한 절반을 버리게 한다

BST는 각 node를 기준으로 left subtree에는 더 작은 key, right subtree에는 더 큰 key가 있다는 ordering invariant를 유지한다. duplicate를 허용한다면 어느 쪽에 둘지 또는 count/value로 합칠지 별도 정책이 필요하다.

```text
        8
      /   \
     3     12
    / \    / \
   1   6  10  14
```

key 10을 찾을 때 8보다 크므로 left subtree 전체를 볼 필요가 없고, 12보다 작으므로 12의 right subtree도 버릴 수 있다. search는 매 비교마다 한 child path만 선택한다.

### 비용은 node 수보다 height에 직접 좌우된다

search, insert는 root에서 한 path를 따라가므로 O(h)이고 h는 tree height다. 균형이 잘 잡혀 h가 O(log n)이면 효율적이지만, 정렬된 key를 그대로 넣어 한쪽 child만 이어지는 tree가 되면 h가 O(n)까지 증가한다.

```text
1
 \
  2
   \
    3
     \
      4
```

이 상태에서는 이름은 tree여도 lookup이 사실상 linked-list traversal처럼 동작한다.

### insert와 delete는 ordering을 보존해야 한다

insert는 search와 같은 비교 경로를 따라 빈 child 위치를 찾는다. delete는 경우가 나뉜다. leaf는 제거하면 되고, child가 하나면 그 child를 올릴 수 있다. child가 둘이면 inorder successor 또는 predecessor 같은 대체 key를 사용해 ordering을 보존해야 한다.

여기서 pointer 연결만 맞는다고 충분하지 않다. delete 후에도 **모든 left subtree key < node < 모든 right subtree key**라는 전역 invariant가 유지되어야 한다.

### mutable key는 tree 안의 위치를 무효화한다

node가 tree에 들어간 뒤 ordering에 참여하는 key를 임의로 바꾸면 실제 위치와 key ordering이 달라질 수 있다. 예를 들어 left subtree 안의 key를 root보다 큰 값으로 바꾸면 search가 그 node가 존재하는 방향을 다시 방문하지 않을 수 있다.

따라서 ordered structure에서는 key mutation을 제한하거나 remove 후 key를 바꾸고 reinsert하는 식으로 invariant를 회복해야 한다.

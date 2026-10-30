---
kind: concept
contentKey: dsa.core.trees.binary-search-tree
topicContentKey: dsa.core.trees
slug: binary-search-tree
title: "이진 탐색 트리(Binary Search Tree)"
summary: "왼쪽 < 현재 노드 < 오른쪽 정렬 불변식이 탐색 범위를 줄이는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/32bst/"
    title: "Algorithms, 4th Edition: Binary Search Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "BST 정렬 불변식, 탐색 경로, 순회와 트리 높이가 연산 비용에 미치는 영향을 확인한다."
    displayOrder: 1
---
# 이진 탐색 트리(Binary Search Tree)

이진 탐색 트리(BST)는 각 노드를 기준으로 왼쪽 부분 트리에는 더 작은 키, 오른쪽 부분 트리에는 더 큰 키가 오도록 **정렬 불변식**을 유지한다. 중복 키를 허용한다면 어느 쪽에 둘지, 개수를 별도로 저장할지 같은 정책도 함께 정의해야 한다.

```text
        8
      /   \
     3     12
    / \    / \
   1   6  10  14
```

키 10을 찾을 때는 8보다 크므로 왼쪽 부분 트리 전체를 제외할 수 있고, 12보다 작으므로 12의 오른쪽 부분 트리도 볼 필요가 없다. 탐색과 삽입은 이런 비교를 반복하며 루트에서 하나의 경로만 따라간다.

따라서 비용은 트리의 전체 노드 수보다 높이 `h`에 직접 좌우되어 O(h)이다. 높이가 O(log n) 수준이면 효율적이지만, 정렬된 키를 순서대로 넣어 한쪽으로 치우치면 높이가 O(n)까지 커질 수 있다. **BST라는 사실만으로 O(log n) 탐색이 보장되는 것은 아니다.**

삭제는 구조와 정렬 불변식을 함께 보존해야 한다. 리프 노드는 바로 제거할 수 있고, 자식이 하나라면 그 자식을 기존 위치에 연결할 수 있다. 자식이 둘인 노드는 중위 순회 기준 다음 값(inorder successor)이나 이전 값(inorder predecessor)을 이용해 대체하면서 모든 부분 트리의 정렬 불변식이 계속 성립하도록 해야 한다.

BST에서 중요한 것은 포인터가 연결되어 있다는 사실이 아니라 **모든 노드에서 정렬 불변식이 유지된다는 것**이다. 이 불변식이 깨지면 키가 실제로 존재해도 탐색이 잘못된 방향을 선택해 찾지 못할 수 있다.

---
kind: concept
contentKey: dsa.core.trees.trie
topicContentKey: dsa.core.trees
slug: trie
title: "Trie"
summary: "문자열 prefix를 shared path로 저장하는 시간·메모리 trade-off를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/52trie/"
    title: "Algorithms, 4th Edition: Tries"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "prefix path, terminal marker와 trie lookup의 시간·공간 trade-off를 확인한다."
    displayOrder: 1
---
# Trie

Trie는 문자열의 각 character를 경로 선택에 사용해 공통 prefix를 공유하는 자료구조다. `app`, `apple`, `apt`를 저장하면 `a-p`까지의 path를 함께 사용한다.

```text
(root)
  └─ a
      └─ p
          ├─ p* ─ l ─ e*
          └─ t*
```

`*`는 그 node까지의 path 자체가 실제 key임을 나타내는 terminal marker다. 이 표시가 없으면 `app`이 저장된 key인지, 단지 `apple`의 prefix인지 구분할 수 없다.

문자열 길이를 L이라 하면 exact lookup이나 prefix lookup은 보통 L개의 character를 따라가며 child를 찾는다. 따라서 저장된 전체 key 수보다 검색 문자열 길이에 비용이 더 직접적으로 연결된다. 다만 각 node의 child를 array로 둘지 map으로 둘지에 따라 상수 비용과 메모리 사용량은 달라진다.

삭제할 때는 공유 prefix를 보존해야 한다. `app`과 `apple`이 함께 저장되어 있다면 `app`을 지울 때 terminal marker만 먼저 해제하고, 더 이상 다른 key가 사용하지 않는 node만 아래에서 위로 제거해야 한다.

Trie는 prefix query에 자연스럽지만 node와 child metadata가 많이 필요할 수 있다. Alphabet이 크거나 prefix 공유가 적으면 full key를 다른 구조에 저장하는 것보다 메모리 사용량이 커질 수 있다. 따라서 빠른 prefix traversal과 storage overhead 사이의 trade-off를 고려해야 한다.

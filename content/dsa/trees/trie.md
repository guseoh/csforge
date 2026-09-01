---
kind: concept
contentKey: dsa.core.trees.trie
topicContentKey: dsa.core.trees
slug: trie
title: "Trie"
summary: "문자열의 prefix를 공유 path로 저장하고 terminal marker로 key와 prefix를 구분하는 원리를 설명한다."
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

### key 전체를 비교하는 대신 문자 경로를 공유한다

trie는 문자열의 각 character를 edge 선택으로 사용한다. 공통 prefix를 가진 key들은 앞부분 node를 공유하므로 prefix 자체가 탐색 경로가 된다.

예를 들어 `app`, `apple`, `apt`를 저장하면 다음처럼 생각할 수 있다.

```text
(root)
  └─ a
      └─ p
          ├─ p* ─ l ─ e*
          └─ t*
```

`*`는 해당 node까지의 path가 실제 key로 끝난다는 terminal marker다. 이 marker가 없으면 `app`이 저장된 key인지 단지 `apple`의 prefix인지 구분할 수 없다.

### lookup 비용은 저장된 key 개수보다 검색 문자열 길이에 가깝다

문자열 길이를 L이라고 하면 exact lookup과 prefix lookup은 일반적으로 L개의 character를 따라가며 child를 찾는다. 물론 각 node의 child representation이 array인지 map인지에 따라 상수 비용과 memory 사용량은 달라진다.

이 특성 때문에 prefix query에서는 전체 key를 scan하거나 모든 문자열을 비교하는 것보다 자연스러운 구조가 될 수 있다.

### 삭제는 공유 prefix를 보존해야 한다

`app`과 `apple`이 함께 있을 때 `app`을 삭제한다고 해서 `a-p-p` path 전체를 지우면 `apple`도 사라진다. 먼저 `app` terminal marker를 해제하고, 아래 subtree나 다른 terminal key가 없는 node만 bottom-up으로 정리해야 한다.

즉 trie delete의 invariant는 **삭제 대상 key만 제거하고 다른 key가 공유하는 prefix path는 보존하는 것**이다.

### 빠른 prefix search와 memory overhead를 교환한다

alphabet 크기가 작고 각 node가 dense child array를 가지면 child lookup은 빠르지만 대부분 slot이 비어 memory 낭비가 클 수 있다. sparse map을 사용하면 빈 공간은 줄지만 pointer/hash lookup overhead가 늘어난다.

또한 긴 문자열과 낮은 prefix sharing에서는 node 수가 많아져 hash table에 full key를 저장하는 것보다 훨씬 많은 memory를 쓸 수도 있다. compressed trie 같은 변형은 이런 path overhead를 줄이는 선택이다.

### 문자열의 '같음' 규칙도 먼저 정해야 한다

Unicode 문자열에서는 visually similar input이 다른 code-point sequence일 수 있다. case folding이나 normalization을 적용할지 결정하지 않은 채 raw character path를 만들면 사용자 입장에서는 같은 문자열이 서로 다른 trie path에 저장될 수 있다.

따라서 autocomplete나 routing prefix에 trie를 사용한다면 자료구조 이전에 **canonical string representation과 equality 규칙**부터 고정해야 한다.

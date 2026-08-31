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
    recommendation: "prefix path와 terminal marker를 확인한다."
    displayOrder: 1
---
# Trie

trie는 문자열의 각 character를 edge로 삼아 공통 prefix가 같은 node path를 공유한다. 단어 끝에 terminal 표시를 두면 `app`과 `apple`을 구분하면서 prefix 검색은 문자열 길이에 비례해 진행할 수 있다.

alphabet이 크면 child map이 많은 빈 공간을 만들고, sparse map은 pointer와 lookup 비용을 낸다. 삭제는 terminal을 지우고 더 이상 다른 단어가 사용하지 않는 node만 정리해야 하며, 단어 자체가 없어졌다고 prefix node를 모두 지우면 안 된다.

### Backend 연결

autocomplete와 routing prefix를 설계할 때 query 길이·alphabet·memory budget을 비교한다. Unicode normalization을 먼저 정하지 않으면 같은 사용자 입력이 다른 path가 된다.


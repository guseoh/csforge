---
kind: concept
contentKey: dsa.core.search-sort.radix-sort
topicContentKey: dsa.core.search-sort
slug: radix-sort
title: "Radix Sort"
summary: "자리별 stable pass가 전체 순서를 만드는 전제를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://algs4.cs.princeton.edu/51radix/"
    title: "Algorithms, 4th Edition: String Sorts"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "LSD/MSD radix sort와 stable digit pass의 역할을 확인한다."
    displayOrder: 1
---
# Radix Sort

Radix sort는 key 전체를 서로 비교하지 않고, integer나 fixed-format string처럼 여러 digit으로 분해 가능한 key를 자리별로 처리한다. LSD 방식은 가장 낮은 자리부터 높은 자리 순으로 여러 번 정렬한다.

```text
170, 045, 075, 090, 002, 024
→ 일의 자리
→ 십의 자리
→ 백의 자리
```

LSD radix sort에서 중요한 invariant는 **k번째 pass가 끝나면 낮은 k자리까지의 순서가 올바르다**는 것이다. 다음 자리로 넘어갈 때 같은 digit을 가진 원소들의 기존 순서를 보존해야 이전 pass의 결과가 유지되므로, 각 pass는 stable해야 한다.

원소 수를 n, digit 수를 d, radix 크기를 r이라 하면 counting-style pass를 사용할 때 대략 O(d(n+r))의 비용이 든다. Digit 수가 고정되고 radix가 적절하면 comparison sort보다 유리할 수 있지만, key 길이나 radix가 크면 pass 수와 auxiliary storage가 커진다.

Radix sort 역시 comparison lower bound를 깨뜨리는 것이 아니라 **digit representation이라는 추가 구조를 사용해 comparison-only model 밖에서 동작하는 것**이다.

Signed integer나 variable-length string에서는 digit의 순서와 종료 규칙을 명확히 정해야 한다. 어떤 representation을 어떤 lexicographic 또는 numeric order로 정렬하려는지 먼저 고정해야 correctness를 설명할 수 있다.

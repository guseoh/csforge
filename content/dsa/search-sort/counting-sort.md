---
kind: concept
contentKey: dsa.core.search-sort.counting-sort
topicContentKey: dsa.core.search-sort
slug: counting-sort
title: "Counting Sort"
summary: "제한된 key 범위의 빈도로 비교를 없애는 조건과 공간을 분석한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://algs4.cs.princeton.edu/51radix/"
    title: "Algorithms, 4th Edition: String Sorts"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "LSD/MSD radix sort와 stable digit pass의 역할을 확인한다."
    displayOrder: 1
---
# Counting Sort

Counting sort는 key가 작은 정수 범위에 있다는 정보를 이용해 원소끼리 직접 비교하지 않고 정렬한다. 값 범위가 `0..k-1`이라면 크기 k의 count array를 만들고 각 값의 빈도를 센다.

```text
input : 2 0 2 1 0
value : 0 1 2
count : 2 1 2
```

단순 정수라면 count를 작은 key부터 읽어 `0,0,1,2,2`를 만들 수 있다. Record를 stable하게 정렬해야 한다면 누적 count를 이용해 각 key가 들어갈 output range를 계산하고 기존 상대 순서를 보존하도록 배치한다.

원소 수를 n, key 범위 크기를 k라 하면 시간은 O(n+k), count storage는 O(k)가 필요하다. 따라서 k가 n에 비해 매우 크거나 key가 sparse하면 이 방식의 장점이 사라질 수 있다.

Counting sort가 O(n log n) comparison lower bound보다 빠를 수 있는 이유는 comparison만 사용하는 것이 아니라 **key range라는 추가 구조를 직접 이용하기 때문**이다.

음수를 포함한다면 최소값을 기준으로 offset을 두는 등 key를 count index 범위로 mapping해야 한다. 핵심은 key 범위가 명확하고 충분히 작다는 전제가 실제로 성립하는지 확인하는 것이다.

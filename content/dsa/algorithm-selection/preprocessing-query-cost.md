---
kind: concept
contentKey: dsa.core.algorithm-selection.preprocessing-query-cost
topicContentKey: dsa.core.algorithm-selection
slug: preprocessing-query-cost
title: "Preprocessing and Query Cost"
summary: "전처리 비용과 반복 query 절감량을 합산해 손익분기점을 판단한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Preprocessing and Query Cost

전처리는 **지금 비용을 내고 이후 반복 작업을 싸게 만드는 선택**이다. 데이터를 한 번 정렬해 binary search를 사용하거나, prefix sum을 만들어 range sum query를 `O(1)`에 처리하거나, index를 구축해 반복 lookup을 줄이는 것이 대표적이다.

전처리가 좋은지는 query 하나만 보고 판단할 수 없다. 전체 비용을 다음처럼 봐야 한다.

```text
총 비용
= preprocessing cost
+ query count × per-query cost
+ update/rebuild cost
```

예를 들어 원소 `n`개를 매 query마다 선형 탐색하면 `Q`개의 query에 대략 `O(Qn)`이 든다. 한 번 `O(n log n)`으로 정렬한 뒤 각 query를 `O(log n)`에 처리하면 총비용은 `O(n log n + Q log n)`이다. `Q`가 작으면 정렬 비용이 오히려 손해일 수 있고, `Q`가 커질수록 초기 비용을 빠르게 회수한다.

### 손익분기점을 계산한다

가령 선형 scan 한 번을 100 ms, 전처리를 800 ms, 전처리 후 query를 5 ms라고 단순화해 보자. query가 한 번이면 전처리 방식은 805 ms라서 100 ms scan보다 느리다. 하지만 10번 조회하면 scan은 1,000 ms, 전처리 방식은 850 ms가 된다. 이처럼 **몇 번의 query부터 preprocessing이 이득인지** 계산할 수 있다.

실제 알고리즘에서는 절대 시간 대신 operation count로 먼저 비교하고 benchmark로 상수를 확인한다. 전처리 자체도 memory와 temporary buffer를 사용할 수 있으므로 Memory Limit와 함께 봐야 한다.

### 데이터가 바뀌면 유지 비용이 생긴다

정렬된 array, hash index, prefix table 같은 파생 구조는 원본이 바뀔 때 같이 갱신하거나 다시 계산해야 한다. 따라서 read-heavy workload에서는 전처리 이득이 커질 수 있지만 write-heavy workload에서는 maintenance 비용이 query 절감보다 커질 수 있다.

예를 들어 `prefixSum[i]`는 immutable array의 반복 range query에는 훌륭하지만 값이 매번 수정된다면 update마다 뒤쪽 합을 모두 바꾸는 구조는 적합하지 않다. 이 경우 Fenwick tree나 segment tree처럼 update와 query를 모두 고려한 다른 구조가 후보가 된다.

### 전처리는 correctness contract도 가진다

파생 구조가 원본보다 오래된 상태라면 빠르더라도 잘못된 답을 낼 수 있다. 따라서 실제 시스템의 index나 projection에서는 rebuild 시점, update 적용 순서, stale 허용 범위를 별도로 정의한다. 알고리즘 선택에서 preprocessing은 단순한 속도 최적화가 아니라 **초기 비용, 반복 횟수, 갱신 빈도, freshness를 함께 계산하는 trade-off**다.

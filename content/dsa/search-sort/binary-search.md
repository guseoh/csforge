---
kind: concept
contentKey: dsa.core.search-sort.binary-search
topicContentKey: dsa.core.search-sort
slug: binary-search
title: "Binary Search"
summary: "정렬 invariant를 이용해 답이 있을 수 있는 구간을 절반씩 줄이는 탐색을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "logarithmic search의 operation count와 정렬 전제를 확인한다."
    displayOrder: 1
---
# Binary Search

### 정렬돼 있기 때문에 절반을 버릴 수 있다

binary search는 단순히 mid를 반복해서 보는 알고리즘이 아니다. **현재 탐색 구간이 정렬되어 있다는 전제** 덕분에 mid와 target의 비교 한 번으로 한쪽 절반 전체가 답이 아님을 증명하고 버릴 수 있다.

예를 들어 다음 배열에서 23을 찾는다고 하자.

```text
[3, 7, 11, 18, 23, 31, 42]
```

mid가 18이면 target이 더 크므로 18보다 왼쪽에 있는 3,7,11은 볼 필요가 없다. 이후 `[23,31,42]`만 남긴다. 이런 식으로 candidate range가 매 단계 대략 절반으로 줄기 때문에 O(log n) 비교로 탐색할 수 있다.

### 핵심은 '답이 아직 이 구간 안에 있다'는 invariant다

구현은 inclusive `[left,right]`를 쓸 수도 있고 half-open `[left,right)`를 쓸 수도 있다. 어느 표현이든 중요한 것은 loop 시작마다 **target이 존재한다면 현재 search interval 안에 있다**는 invariant를 유지하는 것이다.

mid가 target보다 작다면 mid와 그 왼쪽은 버릴 수 있고, target보다 크다면 mid와 그 오른쪽을 버릴 수 있다. 매 반복에서 interval이 반드시 작아져야 종료도 보장된다.

### mid 계산과 종료 조건은 correctness의 일부다

고정 폭 정수에서 `left + right`가 overflow할 수 있는 환경이라면 보통 `left + (right-left)/2` 같은 형태로 mid를 계산한다. 또 left/right update가 mid를 다시 포함시키는 식으로 작성되면 interval이 더 이상 줄지 않아 infinite loop가 생길 수 있다.

empty array, 원소 하나, target이 최솟값보다 작음, 최댓값보다 큼 같은 입력은 이런 boundary bug를 잘 드러낸다.

### 중복 원소에서 '찾았다'가 끝이 아닐 수 있다

`[1,2,2,2,5]`에서 target 2를 찾는 것만 목표라면 어느 2를 반환해도 된다. 하지만 첫 2 또는 마지막 2가 필요하면 일반 binary search보다 boundary search가 필요하다.

즉 binary search를 사용할 때는 먼저 `존재 여부`, `임의 위치`, `첫 허용 위치`, `마지막 허용 위치` 중 어떤 계약을 원하는지 정해야 한다.

### 정렬 invariant가 깨지면 빠르게 틀린 답을 낸다

binary search는 배열이 정렬됐다는 사실을 매 lookup마다 다시 검증하지 않는다. concurrent mutation이나 잘못된 comparator 때문에 ordering이 깨지면 O(log n)으로 더 빨리 잘못된 구간을 버릴 수 있다.

따라서 sorted snapshot, immutable view 또는 적절한 synchronization처럼 **정렬 상태가 lookup 동안 유효하다는 전제**가 필요하다.

---
kind: concept
contentKey: dsa.core.search-sort.counting-sort
topicContentKey: dsa.core.search-sort
slug: counting-sort
title: "Counting Sort"
summary: "bounded integer key의 frequency와 prefix count를 이용해 comparison 없이 O(n+k) 정렬하는 조건을 설명한다."
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

### key 자체를 비교하지 않고 각 값이 몇 번 나왔는지 센다

counting sort는 key가 작은 정수 범위에 있다는 추가 정보를 사용한다. 값 범위가 `0..k-1`이라면 크기 k의 count array를 만들고 각 key frequency를 센다.

예를 들어 입력이 `[2,0,2,1,0]`이면:

```text
value : 0 1 2
count : 2 1 2
```

단순한 숫자 정렬이라면 count만 순서대로 읽어 `0,0,1,2,2`를 만들 수 있다. 비교를 하지 않으므로 comparison-sort lower bound의 모델에 속하지 않는다.

### record를 stable하게 정렬하려면 누적 count가 필요하다

원소가 단순 숫자가 아니라 `(key, payload)` record라면 같은 key의 상대 순서를 보존하면서 output 위치를 정해야 한다. frequency를 cumulative position으로 바꾸면 각 key의 output range를 계산할 수 있다.

```text
frequency → prefix/cumulative count → output index
```

입력을 stable한 방향으로 순회하며 해당 key의 다음 output slot에 배치하면 equal-key order를 보존할 수 있다. 이 stable distribution은 LSD radix sort의 내부 pass로도 중요하다.

### 시간 O(n+k)는 k가 작다는 조건을 숨기고 있다

n개 input을 한 번 세고 크기 k의 count array를 순회하므로 시간과 extra space에 k가 직접 들어간다.

```text
Time  = O(n + k)
Space = O(k)  (+ output buffer if needed)
```

n=1,000인데 key가 0부터 10^12까지 흩어질 수 있다면 k 크기의 dense array를 만드는 것은 현실적이지 않다. sparse key라면 comparison sort나 hash/map 기반 grouping이 더 적합할 수 있다.

### 음수와 offset, count overflow도 계약이다

key가 `-50..50`처럼 음수를 포함하면 `index = key - minKey` 같은 offset mapping이 필요하다. 외부 입력이 선언한 범위를 넘어오면 count array out-of-bounds나 지나친 allocation이 발생할 수 있으므로 min/max 검증을 먼저 해야 한다.

또 n이 매우 크다면 count 누적 합을 담는 정수 type이 overflow하지 않는지도 확인해야 한다.

### 작은 enum/status 같은 bounded key에 특히 자연스럽다

status code, grade, 작은 rank처럼 가능한 key 수가 입력 수에 비해 충분히 작고 범위가 확실할 때 counting 접근이 강하다. 반대로 일반 문자열이나 sparse identifier를 억지로 정수 range로 확장하면 memory trade-off가 나빠진다.

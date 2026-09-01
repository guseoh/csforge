---
kind: concept
contentKey: dsa.core.search-sort.comparison-sort-lower-bound
topicContentKey: dsa.core.search-sort
slug: comparison-sort-lower-bound
title: "Comparison Sort Lower Bound"
summary: "comparison decision tree가 n!개의 순서를 구분해야 하므로 Ω(n log n) 비교가 필요한 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "comparison model의 sorting lower bound와 non-comparison sort의 다른 전제를 비교한다."
    displayOrder: 1
---
# Comparison Sort Lower Bound

### comparison 하나는 가능한 순서를 두 갈래로 나눈다

comparison sort는 원소의 실제 bit pattern이나 값 범위를 직접 이용하지 않고 두 원소를 비교한 결과만으로 정렬 순서를 알아낸다. 서로 다른 n개 원소의 가능한 입력 순서는 `n!`개다.

각 comparison 결과를 decision tree의 branch로 생각하면 sorting algorithm은 어떤 입력 순서가 들어와도 최종적으로 정확한 permutation 하나를 구분해야 한다.

```text
          a < b ?
         /       \
      yes         no
      /             \
   next compare    next compare
      ...             ...
```

leaf 하나가 한 가능한 sorted-order decision을 나타낸다면 최소 n!개의 leaf가 필요하다.

### binary decision tree의 높이가 comparison 수의 lower bound가 된다

높이 h인 binary tree가 가질 수 있는 leaf는 최대 `2^h`개이므로 모든 순서를 구분하려면 다음이 필요하다.

```text
2^h >= n!
h >= log2(n!)
```

그리고 `log(n!)`은 asymptotically `Θ(n log n)`이므로 comparison만 사용하는 일반 sorting의 worst-case에는 `Ω(n log n)` comparisons가 필요하다.

이 주장은 merge sort가 O(n log n)이라는 사실과 연결된다. asymptotic comparison count 관점에서 이미 lower bound와 같은 차수에 도달한 것이다.

### 이 lower bound는 '모든 정렬'의 하한이 아니다

counting sort나 radix sort가 특정 조건에서 O(n+k) 또는 digit 수에 비례한 시간으로 동작한다고 해서 lower bound를 깨뜨린 것은 아니다. 이들은 두 key를 비교하는 정보만 사용하는 comparison model이 아니라 **key의 정수 범위, digit/bit representation 같은 추가 구조**를 이용한다.

따라서 `sorting은 무조건 Ω(n log n)`이라고 일반화하면 틀리다. 정확한 표현은 comparison-based sorting에 대한 lower bound다.

### 더 좋은 알고리즘을 찾기 전에 입력에 추가 구조가 있는지 확인한다

일반 object comparator만 주어지면 comparison lower bound를 피하기 어렵다. 하지만 key가 작은 정수 범위에 제한되거나 고정 길이 digit으로 분해 가능하면 non-comparison sort 후보가 생긴다.

그 대신 counting/radix 계열은 key range, extra memory, digit pass 같은 다른 비용을 지불한다. 그래서 알고리즘 선택은 lower bound 하나가 아니라 **사용할 수 있는 입력 정보와 memory budget**까지 함께 본다.

---
kind: concept
contentKey: dsa.core.search-sort.merge-sort
topicContentKey: dsa.core.search-sort
slug: merge-sort
title: "Merge Sort"
summary: "분할된 두 sorted sequence를 merge invariant로 결합해 O(n log n) 정렬을 만드는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "merge-based sorting의 안정성과 sequential merge 특성을 확인한다."
    displayOrder: 1
---
# Merge Sort

### 큰 배열을 정렬된 작은 배열로 만든 뒤 다시 합친다

merge sort는 입력을 절반씩 나눠 더 이상 나눌 필요가 없는 크기까지 내려간 뒤, 이미 정렬된 두 sequence를 합치면서 결과를 만든다.

```text
[7,2,5,1]
  ↓ split
[7,2] [5,1]
  ↓
[7] [2] [5] [1]
  ↓ merge
[2,7] [1,5]
  ↓ merge
[1,2,5,7]
```

분할 자체가 정렬을 만드는 것은 아니다. 핵심 work는 두 sorted sequence를 선형 시간에 merge하는 단계다.

### merge invariant는 출력 prefix가 항상 확정된 최소 원소들이다

left와 right sequence의 현재 첫 원소를 비교해 더 작은 값을 output에 추가한다. 이때 output에 이미 들어간 prefix는 두 입력의 남은 원소보다 작거나 같고 최종 정렬 결과에서 위치가 확정된 상태다.

한쪽 sequence가 먼저 끝나면 다른 쪽의 남은 원소는 이미 정렬돼 있으므로 그대로 이어 붙일 수 있다. 이 invariant 덕분에 한 번의 merge는 두 sequence 전체 길이에 비례한 O(n)이다.

### 재귀 depth와 각 level의 총 work를 함께 보면 O(n log n)이다

매 단계 입력 크기가 절반으로 줄어 recursion level은 O(log n)이고, 각 level에서 전체 원소를 merge하는 총 work는 O(n)이다.

```text
O(n) work per level × O(log n) levels
= O(n log n)
```

입력 순서가 이미 정렬돼 있어도 기본 merge sort의 asymptotic bound가 크게 무너지지 않는다는 점은 quicksort와 다른 특징이다.

### stable하게 구현할 수 있지만 보조 공간이 필요할 수 있다

left와 right의 key가 같을 때 left 원소를 먼저 output에 넣으면 기존 상대 순서를 보존해 stable sort가 된다. array merge sort는 보통 O(n) auxiliary buffer를 사용한다.

반면 linked list에서는 link를 재연결해 merge할 수 있고, external sort에서는 disk에 있는 sorted run을 sequential read하면서 merge하는 패턴이 자연스럽다. merge sort의 강점은 단순 Big-O뿐 아니라 **순차적인 merge access pattern**에도 있다.

### in-place만 고집하면 다른 비용이 커질 수 있다

보조 배열을 줄이는 in-place merge 변형은 가능하지만 구현 복잡성과 data movement가 커질 수 있다. 따라서 memory O(n)을 무조건 단점으로 보고 제거하기보다 데이터 크기, available memory, stability, sequential I/O 요구를 같이 본다.

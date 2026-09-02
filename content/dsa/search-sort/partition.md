---
kind: concept
contentKey: dsa.core.search-sort.partition
topicContentKey: dsa.core.search-sort
slug: partition
title: "Partition"
summary: "미분류 구간을 줄이며 pivot 기준의 left/right invariant를 유지하는 pointer 상태 변화를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/23quicksort/"
    title: "Algorithms, 4th Edition: Quicksort"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "partition invariant, pivot choice와 quicksort의 평균·최악 비용을 확인한다."
    displayOrder: 1
---
# Partition

### 정렬하는 것이 아니라 pivot을 기준으로 구역을 만든다

partition의 목표는 현재 range 전체를 정렬하는 것이 아니다. pivot을 기준으로 `작은 쪽`, `아직 분류하지 않은 쪽`, `큰 쪽` 같은 구간 invariant를 유지하면서 미분류 영역을 줄이는 것이다.

예를 들어 Lomuto 계열을 단순화해 생각하면 다음 invariant를 둘 수 있다.

```text
[left ... i]       < pivot
[i+1 ... j-1]      아직 처리한 결과상 >= pivot
[j ... end-1]      미분류
[end]               pivot
```

j가 오른쪽으로 이동하면서 `a[j] < pivot`인 원소를 만나면 작은 구간 뒤로 보내고 i를 증가시킨다. 마지막에 pivot을 경계 위치로 옮기면 pivot 왼쪽과 오른쪽의 조건이 확정된다.

### loop invariant가 pointer update correctness를 설명한다

partition bug는 보통 swap 자체보다 pointer가 어떤 구간을 의미하는지 불명확해서 생긴다. `< pivot` 영역이 정확히 어디까지인지, 현재 index가 처리 전인지 처리 후인지, pivot을 range 안에 포함하는지 먼저 정해야 한다.

한 번의 iteration 뒤에도 각 구간 정의가 유지되고 미분류 영역이 반드시 줄어들어야 loop 종료를 보장할 수 있다.

### `<`와 `<=` 선택은 duplicate 처리와 연결된다

pivot과 같은 값이 많을 때 equal value를 왼쪽에 둘지 오른쪽에 둘지 partition condition에 따라 달라진다. 잘못된 조건은 correctness를 바로 깨뜨리지 않더라도 한쪽 subproblem에 equal keys가 몰려 recursion balance를 나쁘게 만들 수 있다.

3-way partition은 이를 명시적으로:

```text
< pivot | == pivot | > pivot
```

세 구역으로 나눠 duplicate가 많은 input에서 같은 값들을 재귀 대상에서 제외할 수 있다.

### partition 완료는 subarray 정렬 완료가 아니다

partition 뒤에는 pivot의 최종 위치와 양쪽 범위 조건만 보장된다. 왼쪽 내부 `[2,1]`이나 오른쪽 `[7,6]`은 아직 정렬되지 않을 수 있다. quicksort가 각각을 다시 partition하는 이유다.

이 경계를 놓치면 partition function 하나를 호출한 뒤 전체 배열이 정렬됐다고 잘못 가정하게 된다.

### in-place swap은 input ownership을 바꾼다

partition은 흔히 같은 array 안에서 swap하므로 extra buffer는 적지만 원본 순서를 파괴한다. caller가 input array의 기존 순서를 재사용해야 한다면 copy를 만들거나 mutation contract를 명시해야 한다.

따라서 알고리즘의 space complexity뿐 아니라 **누가 array를 소유하며 mutation을 허용하는가**도 실제 API 설계에서는 중요한 조건이다.

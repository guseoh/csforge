---
kind: concept
contentKey: dsa.core.search-sort.linear-search
topicContentKey: dsa.core.search-sort
slug: linear-search
title: "Linear Search"
summary: "정렬 전제 없이 순차적으로 후보를 제거하는 탐색의 correctness와 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Linear Search

### 가장 단순한 탐색은 후보를 하나씩 확인한다

linear search는 첫 원소부터 차례로 target equality를 검사한다. 정렬이나 별도 index가 없어도 사용할 수 있다는 것이 가장 큰 장점이다.

```text
[7, 2, 9, 4, 5]
 target = 4

7 ✗ → 2 ✗ → 9 ✗ → 4 ✓
```

찾으면 즉시 종료할 수 있고, 끝까지 갔는데도 없으면 miss다. 따라서 target이 첫 위치에 있으면 비교 1번으로 끝나지만 마지막에 있거나 존재하지 않으면 n개를 모두 확인해야 한다.

### correctness는 '무엇을 찾는다'는 계약부터 정한다

중복 key가 있을 때 요구사항이 first match인지 any match인지 all matches인지에 따라 알고리즘 결과가 달라진다. first match라면 왼쪽부터 scan하면서 처음 equality가 true인 순간 반환하면 된다. all matches라면 조기 종료하면 안 된다.

따라서 linear search의 loop invariant는 예를 들어 다음처럼 쓸 수 있다.

```text
index i 이전의 모든 원소는 이미 검사했고 target이 아니었다.
```

반복이 끝났을 때 전체 range가 검사됐으므로 target이 없다는 결론을 낼 수 있다.

### worst-case O(n)은 단순하지만 때로 충분히 좋은 선택이다

n이 작고 상한이 명확하면 별도 index를 만들거나 정렬하는 비용보다 linear scan이 단순하고 빠를 수 있다. 한 번만 검색할 데이터에 O(n log n) sort를 먼저 하는 것이 오히려 낭비일 수도 있다.

반대로 같은 collection에서 search가 반복되고 n이 커지면 O(n) scan이 누적된다. 이때는 정렬 후 binary search, hash table, tree 같은 구조로 preprocessing/update 비용을 지불하고 lookup을 줄이는 선택을 비교한다.

### Big-O만으로 실제 scan 비용이 완전히 같지는 않다

array의 연속 memory를 순차 scan하는 것과 linked structure를 pointer로 따라가는 것은 둘 다 O(n)이어도 locality와 branch/memory access 비용이 다를 수 있다. 하지만 이런 implementation cost는 linear search의 correctness와 점근 비용을 바꾸는 별도 층위다.

따라서 작은 bounded list에 대한 단순 filter인지, 수십만 item에서 반복되는 lookup인지 workload를 먼저 확인하고 선택한다.

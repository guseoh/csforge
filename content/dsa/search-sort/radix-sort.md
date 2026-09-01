---
kind: concept
contentKey: dsa.core.search-sort.radix-sort
topicContentKey: dsa.core.search-sort
slug: radix-sort
title: "Radix Sort"
summary: "digit별 stable pass가 이전 자리의 순서를 보존해 전체 key ordering을 만드는 조건을 설명한다."
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

### key 전체를 비교하지 않고 자리별로 정렬한다

radix sort는 integer나 fixed-format string처럼 key를 여러 digit으로 분해할 수 있을 때 각 digit을 기준으로 여러 pass를 수행한다. LSD(least significant digit) 방식은 가장 낮은 자리부터 시작한다.

예를 들어 세 자리 십진수:

```text
170, 045, 075, 090, 002, 024
```

을 일의 자리 → 십의 자리 → 백의 자리 순으로 stable sort하면 마지막에는 전체 숫자 순서가 정렬된다.

### LSD에서 각 pass가 stable해야 이전 자리 정보가 살아남는다

첫 pass에서 일의 자리 순서가 만들어진 뒤 십의 자리로 정렬할 때, 십의 자리가 같은 원소 사이에서는 기존 일의 자리 순서를 보존해야 한다. stable하지 않으면 이전 pass가 만든 ordering information을 잃는다.

즉 LSD radix sort의 correctness는 다음 invariant로 생각할 수 있다.

```text
k번째 pass가 끝나면 낮은 k자리까지의 key 순서가 올바르다.
```

다음 stable pass가 더 높은 digit을 기준으로 그룹을 만들면서 같은 digit 그룹 내부의 이전 ordering을 유지하면 invariant가 확장된다.

### 시간은 n뿐 아니라 digit 수와 radix에 좌우된다

원소 수 n, 처리할 digit 수 d, 각 digit의 범위 radix r을 생각하면 counting-style pass를 사용할 경우 대략 `O(d × (n+r))` 형태로 볼 수 있다.

따라서 digit 수가 고정되고 radix가 적절하면 매우 빠를 수 있지만, key 길이가 길거나 alphabet/radix가 지나치게 크면 pass와 auxiliary memory 비용이 커진다.

### signed integer와 variable-length string은 표현 규칙이 필요하다

음수를 raw unsigned digit처럼 처리하면 원하는 numeric ordering과 다를 수 있다. 문자열도 shorter key를 어떻게 취급할지, end-of-string을 어떤 rank로 둘지 정해야 한다.

Unicode string을 byte 단위로 radix sort할 경우 byte encoding order와 사용자에게 기대되는 locale/collation order가 같지 않을 수 있다. 따라서 `문자열이니까 radix sort`가 아니라 **어떤 representation의 lexicographic order를 원하는가**를 먼저 정의해야 한다.

### comparison lower bound를 피하는 대신 key structure에 의존한다

radix sort가 O(n log n)보다 빠를 수 있는 것은 comparison만으로 정보를 얻지 않고 digit representation을 직접 사용하기 때문이다. 그 대신 generic comparator만 제공되는 object에는 바로 적용할 수 없다.

고정 폭 integer ID, bounded code처럼 representation이 명확한 대량 key에서는 후보가 되지만, memory bandwidth와 auxiliary buffer 비용까지 실제 workload에서 비교해야 한다.

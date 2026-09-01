---
kind: concept
contentKey: dsa.core.algorithm-selection.data-shape
topicContentKey: dsa.core.algorithm-selection
slug: data-shape
title: "Data Shape"
summary: "정렬·중복·key 범위·분포가 알고리즘의 전제와 실제 비용을 바꾸는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Data Shape

입력 크기 `n`이 같아도 데이터의 모양이 다르면 좋은 알고리즘이 달라진다. 이미 정렬돼 있는지, 중복이 많은지, key 범위가 작은지, 값이 특정 구간에 몰리는지, graph가 sparse인지 dense인지 같은 성질은 알고리즘이 기대하는 전제를 직접 바꾼다.

예를 들어 100만 개 정수를 정렬해야 하는데 값의 범위가 `0..999`로 제한돼 있다면 비교 정렬만 볼 필요가 없다. 빈도 배열을 사용하면 `O(n + k)`의 counting sort가 후보가 된다. 반대로 key가 64-bit 전체 범위에 흩어져 있고 실제 값 종류도 많다면 `k`에 비례한 table은 비현실적일 수 있다.

### 이미 가진 구조를 활용할 수 있는가

데이터가 이미 정렬돼 있다면 exact lookup에는 binary search를 사용할 수 있고, 두 집합의 교집합이나 합 조건을 찾는 문제에서는 two-pointer가 유리할 수 있다. 하지만 이 정렬 상태를 유지하기 위해 매 insert마다 큰 이동 비용을 지불해야 한다면 write-heavy workload에서는 hash나 tree가 더 나을 수 있다.

중복도 마찬가지다. distinct key가 적으면 counting/frequency 구조가 잘 맞을 수 있고, 중복이 매우 많은 quicksort에서는 pivot 선택과 3-way partition 여부가 실제 비용에 영향을 준다. hash table에서는 key 분포와 hash quality가 좋지 않으면 특정 bucket이나 probe cluster에 작업이 몰려 expected `O(1)`과 실제 latency가 멀어질 수 있다.

### 평균 분포와 adversarial input을 구분한다

“대부분 random하다”는 관찰은 평균 성능 설명에는 쓸 수 있지만 correctness나 worst-case 보장을 대신하지 않는다. 외부 입력이 algorithm behavior를 결정한다면 skew, duplicate-heavy, sorted/reverse-sorted, empty, single-element 같은 case를 별도로 봐야 한다.

그래프도 좋은 예다. `V = 10,000`, `E = 20,000`인 sparse graph에 `V²` adjacency matrix를 만들면 edge 수와 무관하게 1억 칸을 준비하게 된다. 반면 정점 수가 작고 edge 존재 여부를 매우 자주 확인하는 dense graph라면 matrix의 `O(1)` membership check가 이점이 될 수 있다.

### Data shape는 추측이 아니라 입력 계약이다

실전에서는 production sample을 보고 평균 분포를 측정하되, 그 분포가 API 계약으로 보장되는지 구분한다. 보장되지 않는 특성을 근거로 알고리즘 correctness를 세우지 않는다. 알고리즘 선택은 `n` 하나만 보는 작업이 아니라 **입력의 구조적 성질과 그 성질이 유지되는 조건까지 확인하는 작업**이다.

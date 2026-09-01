---
kind: concept
contentKey: dsa.core.algorithm-selection.memory-limit
topicContentKey: dsa.core.algorithm-selection
slug: memory-limit
title: "Memory Limit"
summary: "추가 자료구조의 실제 peak memory가 허용 예산 안에 드는지 계산한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Memory Limit

시간을 줄이기 위해 메모리를 더 쓰는 선택은 흔하다. hash table로 lookup을 빠르게 하고, DP table로 중복 계산을 제거하고, prefix sum을 미리 저장하면 query를 줄일 수 있다. 하지만 추가 메모리가 실제 budget을 넘으면 더 빠른 알고리즘도 사용할 수 없다.

가장 먼저 **entry 수 × entry당 필요한 값의 크기**로 하한을 잡는다. 예를 들어 `int` 1,000,000개를 연속 배열로 저장하면 원시 데이터만 약 4 MB다. 같은 값을 객체와 hash entry로 보관하면 object header, reference, bucket table, alignment 때문에 실제 사용량은 훨씬 커질 수 있다. 따라서 “원소가 백만 개니까 4 MB”라는 계산은 primitive array 같은 단순 구조에서만 가까운 값이다.

### 평균이 아니라 peak를 계산한다

메모리 문제는 보통 평균보다 peak에서 발생한다. resize 중인 dynamic array나 hash table은 잠시 old/new storage를 동시에 가질 수 있고, merge sort는 입력 외에 임시 배열을 요구할 수 있다. 요청 하나가 20 MB를 쓴다고 해도 같은 작업 30개가 동시에 진행되면 해당 부분만 600 MB가 된다.

```text
steady state memory
+ temporary buffer
+ resize/rebuild 중 중복 storage
+ concurrent operations
= 실제 peak 후보
```

JVM에서는 여기에 다른 heap object와 GC 여유 공간도 존재하고, native buffer나 OS page cache는 Java heap과 다른 예산을 사용한다. 따라서 알고리즘의 space complexity와 프로세스의 전체 memory consumption을 같은 값으로 보면 안 된다.

### Time-Space Trade-off를 숫자로 비교한다

예를 들어 query가 한 번뿐인 데이터에 거대한 lookup table을 만드는 것은 전처리 시간과 메모리만 늘릴 수 있다. 반대로 같은 key lookup이 매우 자주 반복되고 데이터 크기가 제한돼 있다면 `O(n)` scan을 계속 수행하는 것보다 bounded hash/index를 유지하는 편이 낫다.

메모리를 줄일 때도 비용이 생긴다. DP full table을 rolling row로 줄이면 이전 state를 덮어쓰지 않도록 iteration order를 맞춰야 하고, path reconstruction 정보가 사라질 수 있다. 즉 공간 최적화는 단순히 배열 크기를 줄이는 일이 아니라 **어떤 state를 미래 계산과 결과 복원에 정말 필요한지 판단하는 작업**이다.

실무에서는 입력 상한, 동시 실행 수, peak allocation을 계산한 뒤 실제 profiler와 memory metric으로 확인한다. 감당할 수 없는 메모리를 쓰는 후보는 시간 복잡도가 좋아도 선택지에서 제외한다.

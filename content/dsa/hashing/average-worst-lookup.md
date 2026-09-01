---
kind: concept
contentKey: dsa.core.hashing.average-worst-lookup
topicContentKey: dsa.core.hashing
slug: average-worst-lookup
title: "Average and Worst Lookup"
summary: "hash table의 expected O(1) lookup이 어떤 분포 가정 위에 있고 언제 O(n)까지 악화되는지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "hash table의 expected lookup과 collision이 만든 긴 search path를 비교한다."
    displayOrder: 1
---
# Average and Worst Lookup

### O(1)은 무조건적인 worst-case 보장이 아니다

hash table을 설명할 때 lookup이 O(1)이라고 말하지만, 더 정확하게는 **hash가 key를 충분히 분산시키고 load factor가 적절하다는 조건에서 expected/average lookup이 상수 시간에 가깝다**는 의미로 이해해야 한다.

lookup의 실제 경로는 대략 다음과 같다.

```text
hash 계산
  ↓
bucket/initial slot 계산
  ↓
collision path를 따라 equality 비교
```

첫 두 단계가 상수 시간이어도 마지막 collision path가 길면 전체 lookup은 길어진다.

### chaining에서는 chain length, open addressing에서는 probe length가 핵심이다

separate chaining에서 모든 key가 우연히 같은 bucket으로 가면 하나의 linked collection을 거의 끝까지 검색해야 해 O(n)이 될 수 있다. open addressing에서도 collision이 하나의 긴 probe cluster를 만들면 target이나 empty slot을 찾기까지 많은 slot을 확인할 수 있다.

즉 implementation strategy는 달라도 worst-case의 본질은 비슷하다. **후보 위치를 충분히 좁히지 못해 실제 equality 비교 수가 n에 가까워지는 것**이다.

### expected complexity에는 입력 분포 가정이 숨어 있다

평균 O(1)을 사용할 때는 key distribution, hash quality, load factor, resize policy 같은 전제가 있다. 실제 입력이 이 전제와 크게 다르거나 외부 사용자가 의도적으로 collision을 유도할 수 있다면 평균 분석만으로 request path의 upper bound를 설명할 수 없다.

따라서 API timeout이나 capacity planning에서 `HashMap이니까 O(1)`이라는 한 문장만으로 latency upper bound를 잡으면 안 된다. 평균 operation count와 worst-case path, 실제 key distribution을 구분해야 한다.

### tail latency를 보려면 평균 외의 상태를 관찰한다

평균 lookup이 짧아도 특정 bucket의 chain만 매우 길 수 있다. 운영에서 hash 기반 index를 병목으로 의심한다면 다음처럼 내부 비용을 드러내는 evidence가 더 유용하다.

- entry count와 capacity
- load factor
- bucket length 또는 probe count distribution
- resize 빈도와 pause
- 특정 입력 패턴에서 collision 증가 여부

이렇게 보면 hash table의 평균 O(1)을 버릴 필요 없이, **그 기대가 어떤 조건에서 성립하는지**를 정확히 사용할 수 있다.

---
kind: concept
contentKey: dsa.core.hashing.load-factor
topicContentKey: dsa.core.hashing
slug: load-factor
title: "Load Factor"
summary: "entry 수와 bucket/slot 수의 비율이 collision path와 resize threshold에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "separate chaining의 lookup/insert/delete와 chain length 비용을 확인한다."
    displayOrder: 1
---
# Load Factor

### table이 얼마나 차 있는지를 나타내는 비율

load factor는 일반적으로 `α = entry count / bucket(or slot) count`로 정의한다. 같은 entry 수라도 bucket 수가 적으면 더 많은 key가 같은 collision path를 공유하게 되고, bucket 수가 많으면 빈 공간이 늘어난다.

예를 들어 entry 12개를 bucket 16개에 저장하면 `α = 0.75`다. 이 숫자는 lookup 비용 그 자체는 아니지만 table이 collision을 얼마나 자주 만날 가능성이 있는지와 resize가 필요한 시점을 판단하는 중요한 신호다.

### chaining과 open addressing에서 의미가 조금 다르다

separate chaining에서는 한 bucket에 여러 entry를 둘 수 있으므로 α가 1을 넘어도 저장 자체는 가능하다. 균등 분포를 가정하면 α는 평균 chain 길이를 생각하는 기준이 된다.

open addressing은 entry가 table slot 안에 직접 들어가므로 α가 1에 가까워질수록 빈 slot을 찾는 probe가 길어진다. 완전히 차면 새 entry를 넣을 수 없다. 그래서 open addressing은 보통 높은 occupancy에 도달하기 전에 resize하는 것이 중요하다.

### threshold는 시간과 공간의 교환이다

낮은 threshold에서 일찍 resize하면 collision/probe를 줄이기 쉽지만 더 큰 table을 빨리 확보하므로 unused memory와 cache footprint가 늘 수 있다. 높은 threshold는 memory 사용률은 높일 수 있지만 lookup/insert의 평균·tail 비용이 커질 가능성이 있다.

```text
낮은 α  → 많은 빈 공간, 짧은 collision path
높은 α  → 공간 효율 증가, 긴 chain/probe 가능성 증가
```

따라서 `0.75가 정답` 같은 숫자를 외우기보다 implementation과 workload가 선택한 threshold가 어떤 trade-off를 만드는지 이해해야 한다.

### load factor만으로 분포 품질을 보장할 수는 없다

α가 낮아도 hash distribution이 나쁘면 특정 bucket 하나에 많은 key가 몰릴 수 있다. 반대로 평균 α가 같더라도 bucket length variance나 probe cluster가 다르면 실제 latency도 다르다.

그래서 운영에서 hash table 비용을 본다면 entry count/capacity뿐 아니라 chain length, probe count, resize 횟수와 tail latency를 함께 봐야 한다.

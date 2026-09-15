---
kind: concept
contentKey: dsa.core.hashing.average-worst-lookup
topicContentKey: dsa.core.hashing
slug: average-worst-lookup
title: "Average and Worst Lookup"
summary: "hash table의 expected O(1) lookup이 분포·load factor 가정 위에 있고 collision path가 길면 O(n)까지 악화될 수 있음을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "separate chaining의 lookup/insert/delete와 chain length 비용을 확인한다."
    displayOrder: 1
---
# Average and Worst Lookup

Hash table lookup을 흔히 `O(1)`이라고 말하지만, 이는 hash가 key를 충분히 분산시키고 load factor가 적절하게 유지된다는 조건에서 **expected 또는 average cost가 상수 수준**이라는 의미로 이해해야 한다.

Lookup은 hash와 bucket/slot 계산 뒤 collision path에서 실제 key를 비교한다.

```text
hash 계산 → 후보 위치 → collision path → equality 확인
```

Separate chaining에서 key들이 한 bucket에 몰리면 chain을 길게 순회해야 하고, open addressing에서도 긴 probe cluster가 생기면 많은 slot을 확인해야 한다. 극단적으로 후보가 `n`개 가까이 늘어나면 lookup이 `O(n)`까지 악화될 수 있다.

따라서 expected `O(1)`에는 hash distribution, load factor와 collision strategy에 대한 전제가 숨어 있다. 평균적인 lookup이 빠르다는 사실과 모든 입력에서 상수 시간이 보장된다는 주장은 다르다.

**Hash table의 성능을 이해할 때는 O(1)을 암기하기보다 왜 후보 수가 평균적으로 작게 유지되는지, 그리고 그 가정이 깨지면 어떤 경로가 길어지는지를 설명할 수 있어야 한다.**

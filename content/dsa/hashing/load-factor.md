---
kind: concept
contentKey: dsa.core.hashing.load-factor
topicContentKey: dsa.core.hashing
slug: load-factor
title: "Load Factor"
summary: "entry 수와 bucket·slot 수의 비율이 collision path와 resize 필요성에 미치는 영향을 설명한다."
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

Load factor는 hash table이 저장 위치에 비해 얼마나 많은 entry를 담고 있는지를 나타내는 비율이다.

```text
α = entry count / bucket(or slot) count
```

같은 entry 수라도 bucket이나 slot 수가 적으면 collision path가 길어질 가능성이 커지고, 반대로 table을 크게 만들면 lookup 여유는 늘지만 비어 있는 공간도 많아진다.

Separate chaining에서는 한 bucket에 여러 entry를 둘 수 있으므로 `α > 1`도 가능하다. 균등 분포를 가정하면 load factor는 평균 chain 길이를 생각하는 기준이 된다. Open addressing에서는 entry가 table slot에 직접 들어가므로 `α`가 1에 가까워질수록 빈 slot을 찾는 probe가 급격히 길어질 수 있다.

그래서 hash table은 보통 특정 load factor에 도달하면 capacity를 늘린다. Threshold를 낮게 잡으면 collision을 줄이기 쉽지만 더 많은 memory를 사용하고, 높게 잡으면 공간 활용률은 좋아지지만 lookup·insert에서 더 긴 chain이나 probe를 감수할 수 있다.

Load factor만으로 성능을 완전히 예측할 수는 없다. Hash 분포가 나쁘면 낮은 load factor에서도 일부 bucket에 값이 몰릴 수 있다. **Load factor는 collision 비용과 memory 사용 사이의 균형을 관리하는 핵심 상태 값**이다.

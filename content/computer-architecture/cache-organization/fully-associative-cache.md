---
kind: concept
contentKey: computer-architecture.core.cache-organization.fully-associative-cache
topicContentKey: computer-architecture.core.cache-organization
slug: fully-associative-cache
title: "Fully-Associative Cache"
summary: "memory block을 어느 line에도 배치할 수 있게 해 conflict를 줄이는 대신 전체 tag 검색과 replacement 비용이 커지는 구조를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Fully-Associative Cache

Fully-associative cache에서는 memory block이 cache의 어느 line에도 들어갈 수 있다. 특정 index가 placement를 제한하지 않으므로 전체 cache를 하나의 set으로 보고 모든 line을 후보로 생각할 수 있다.

이 자유도 덕분에 direct-mapped cache처럼 특정 index 하나를 두고 block이 반복해서 서로 밀어내는 conflict miss를 줄일 수 있다.

### Placement가 자유로운 만큼 lookup이 복잡하다

요청한 block이 어느 line에 있는지 모르기 때문에 hit 여부를 확인하려면 cache에 있는 여러 tag와 요청 tag를 비교해야 한다.

```text
requested tag
   ├─ compare line 0
   ├─ compare line 1
   ├─ compare line 2
   └─ ...
```

Cache가 커질수록 이런 비교와 selection logic의 area·전력·timing 비용도 커진다. Miss가 발생하고 빈 line이 없다면 cache 전체 후보 중 어느 line을 내보낼지도 결정해야 한다.

### Conflict miss를 줄여도 모든 miss가 사라지는 것은 아니다

처음 접근하는 block에서 발생하는 compulsory miss는 그대로 존재한다. Working set 자체가 cache capacity보다 크다면 capacity miss도 발생한다.

즉 fully-associative 구조는 placement 제약을 크게 줄이는 방법이지 `miss가 없는 cache`가 아니다.

정리하면 placement 자유도는 다음 순서로 커진다.

```text
direct-mapped < set-associative < fully-associative
```

반대로 lookup과 replacement hardware의 복잡도도 일반적으로 커진다. 그래서 실제 cache는 크기와 latency 목표에 맞춰 적절한 associativity를 선택한다.

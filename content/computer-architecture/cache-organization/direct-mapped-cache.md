---
kind: concept
contentKey: computer-architecture.core.cache-organization.direct-mapped-cache
topicContentKey: computer-architecture.core.cache-organization
slug: direct-mapped-cache
title: "직접 사상(Direct-Mapped) Cache"
summary: "각 memory block이 하나의 cache 위치로만 mapping될 때 lookup이 단순해지는 대신 conflict miss가 생기는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# 직접 사상(Direct-Mapped) Cache

Direct-mapped cache에서는 각 memory block이 cache의 **정해진 line 하나에만** 들어갈 수 있다. Address의 index가 확인할 line을 바로 선택하고, 그 line에 저장된 tag가 요청한 memory block과 같은지 비교한다.

후보가 하나뿐이므로 lookup 구조가 단순하다.

```text
memory block ──> index 계산 ──> cache line 하나 선택
                                  │
                                  └─ tag 일치? → hit / miss
```

### 단순한 대신 conflict에 취약하다

서로 다른 memory block이 같은 index로 mapping될 수 있다. 예를 들어 A와 B가 같은 line을 사용해야 하고 프로그램이 다음처럼 반복 접근한다고 하자.

```text
A → B → A → B → ...
```

A를 넣으면 B가 밀려나고, B를 넣으면 A가 밀려난다. Cache의 다른 line이 비어 있어도 두 block은 그 위치밖에 사용할 수 없기 때문에 계속 miss가 날 수 있다. 이것이 conflict miss다.

### 전체 용량만으로 hit 여부를 판단할 수 없다

Working set의 크기가 cache capacity보다 작더라도 address들이 같은 index에 몰리면 실제 hit rate는 낮아질 수 있다. Direct-mapped 구조에서는 **어느 주소가 어느 line으로 mapping되는가**가 중요하다.

이 conflict를 줄이기 위해 다음 Concept의 set-associative cache는 하나의 index에 여러 후보 line을 둔다. 대신 lookup과 replacement 구조는 더 복잡해진다.

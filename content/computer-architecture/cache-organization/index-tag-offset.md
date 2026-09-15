---
kind: concept
contentKey: computer-architecture.core.cache-organization.index-tag-offset
topicContentKey: computer-architecture.core.cache-organization
slug: index-tag-offset
title: "Tag·Index·Offset"
summary: "cache capacity·line size·associativity에서 set 수를 구하고 address bit를 offset·index·tag로 나누는 방법을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Tag·Index·Offset

Byte-addressable memory와 power-of-two cache 구성을 가정하면 address를 `tag`, `index`, `offset`으로 나누어 cache lookup을 이해할 수 있다.

- **offset**: 선택된 cache line 안에서 어느 byte를 사용할지 고른다.
- **index**: 어느 set을 확인할지 고른다.
- **tag**: 그 set에 들어 있는 line이 요청한 memory block과 같은지 확인한다.

```text
high bits                              low bits
|              tag              | index | offset |
```

### 먼저 line 수와 set 수를 구한다

Cache capacity를 `C`, line size를 `B`, associativity를 `A`라고 하면 다음처럼 계산할 수 있다.

```text
line count = C / B
set count  = (C / B) / A
```

예를 들어 32KiB cache, 64-byte line, 4-way cache라면 전체 line은 512개이고 set은 128개다.

64 byte line 안의 byte를 고르려면 6 bit가 필요하므로 offset은 6 bit다. 128 set 중 하나를 고르려면 7 bit가 필요하므로 index는 7 bit다. 32-bit address라면 나머지 19 bit가 tag가 된다.

### Associativity가 바뀌면 index 폭도 달라진다

같은 capacity와 line size에서 associativity를 높이면 한 set 안의 way 수가 늘고 set 수는 줄어든다. 그러면 index bit 수가 줄고 tag bit 수가 늘어난다.

Direct-mapped cache는 associativity가 1이므로 set 수와 line 수가 같다. Fully-associative cache는 전체 cache가 하나의 set이므로 placement를 위한 index bit가 없다.

이 계산에서 가장 자주 틀리는 부분은 **전체 line 수와 set 수를 혼동하는 것**이다. 또한 실제 CPU의 cache indexing은 이 교육용 모델보다 복잡할 수 있으므로 이 식은 기본 원리를 이해하기 위한 모델로 사용한다.

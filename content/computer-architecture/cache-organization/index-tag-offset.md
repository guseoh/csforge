---
kind: concept
contentKey: computer-architecture.core.cache-organization.index-tag-offset
topicContentKey: computer-architecture.core.cache-organization
slug: index-tag-offset
title: "Index, Tag and Offset"
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
# Index, Tag and Offset

### Cache lookup을 계산하려면 먼저 line과 set의 수를 구한다

byte-addressable memory와 power-of-two 구성을 가정하면 cache address를 offset, index, tag로 나누어 생각할 수 있다. cache capacity가 `C` byte, line size가 `B` byte, associativity가 `A` way라면 전체 line 수는 `C / B`, set 수는 `(C / B) / A`다. line size와 set 수가 각각 2의 거듭제곱이라면 필요한 bit 수를 log2로 계산할 수 있다.

예를 들어 32KiB cache, 64-byte line, 4-way set-associative cache를 생각해 보자. 전체 line은 `32KiB / 64B = 512`개이고 set은 `512 / 4 = 128`개다. 64-byte line 안의 byte를 고르려면 offset 6 bit가 필요하고, 128 set 중 하나를 고르려면 index 7 bit가 필요하다. 32-bit address라면 나머지 `32 - 6 - 7 = 19` bit를 tag로 생각할 수 있다.

### Offset, index, tag는 lookup에서 서로 다른 역할을 가진다

offset은 선택된 cache line 안에서 원하는 byte/word가 어디에 있는지 정한다. index는 lookup할 set을 고른다. tag는 그 set의 각 way에 현재 들어 있는 block이 요청한 memory block과 같은지 확인하기 위한 identity 역할을 한다. set-associative cache에서는 index로 set 하나를 고른 뒤 그 안의 여러 way tag를 비교한다.

direct-mapped cache는 associativity가 1이므로 set 수와 line 수가 같고, index가 사실상 line 하나를 고른다. fully-associative cache는 전체 cache가 하나의 set인 모델이므로 placement를 위한 index bit가 없고 모든 line이 후보가 된다.

### Line size나 associativity를 바꾸면 bit 분할도 바뀐다

같은 cache capacity에서 line size를 키우면 offset bit는 늘고 전체 line 수와 set 수는 줄어들 수 있다. associativity를 높이면 한 set의 way 수가 늘어 set 수가 줄기 때문에 index bit가 감소하고 그만큼 tag bit가 늘어난다. 따라서 cache organization을 바꾸면 단순히 `way만 증가`하는 것이 아니라 address가 cache 위치로 mapping되는 방식 자체가 달라진다.

### 계산에서 자주 틀리는 부분

KiB를 byte로 바꾸지 않거나 line 수와 set 수를 혼동하면 index bit 계산이 틀어진다. 4-way cache에서 전체 512 line을 그대로 512 set으로 보면 안 된다. 또한 byte-address가 아니라 word-address를 가정한 문제라면 offset의 의미가 달라질 수 있으므로 address 단위를 먼저 확인해야 한다.

실제 modern CPU의 physical/virtual indexing, hash function, slice selection은 이 단순 모델보다 복잡할 수 있다. 이 계산은 cache mapping의 기본 원리를 이해하기 위한 model이며 특정 CPU의 undocumented mapping을 그대로 예측한다고 가정하지 않는다.

### Backend 성능에서의 활용

cache conflict를 설명하는 microbenchmark를 만들 때는 cache capacity만 적지 말고 line size, associativity, address/stride alignment를 함께 기록해야 한다. source-level object 주소와 physical cache index를 단순 동일시하지 말고, 재현 가능한 access pattern과 hardware counter를 기준으로 결과를 확인한다.

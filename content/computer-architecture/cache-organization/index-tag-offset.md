---
kind: concept
contentKey: computer-architecture.core.cache-organization.index-tag-offset
topicContentKey: computer-architecture.core.cache-organization
slug: index-tag-offset
title: "Index, Tag and Offset"
summary: "주소 bit를 offset·index·tag로 나눠 cache 위치를 계산한다."
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

line size가 `2^b` byte이면 낮은 b bit가 line 내부 offset이다. cache에 `2^s` set이 있으면 다음 s bit가 set index가 되고 나머지 상위 bit가 tag가 되어 해당 set의 tag와 비교된다. 예를 들어 32-bit 주소·16-byte line·256 set이면 offset 4 bit, index 8 bit, tag 20 bit다.

이 계산은 byte address와 line 수를 전제로 한다. word address를 넣거나 KiB와 byte를 섞으면 경계가 달라지고, associativity가 바뀌면 index가 가리키는 set 수만 달라진다.

### Backend 연결

cache conflict를 재현하는 microbenchmark는 주소 폭·alignment·stride를 명시한다. 숫자 하나를 복사하기보다 어떤 bit가 충돌을 만들었는지 기록해야 다른 CPU에서 재현할 수 있다.

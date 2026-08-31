---
kind: concept
contentKey: computer-architecture.core.cache-organization.write-allocate
topicContentKey: computer-architecture.core.cache-organization
slug: write-allocate
title: "Write Allocate"
summary: "write miss에서 line을 채울지 바로 memory에 쓸지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Write Allocate

write-allocate는 write miss가 나면 해당 line을 하위 계층에서 가져온 뒤 cache에서 갱신한다. 같은 line을 곧 다시 쓸 것이라는 spatial·temporal locality를 이용하지만, 처음 한 번 쓰기 위해 read-for-ownership traffic과 fill 비용을 낸다.

no-write-allocate는 cache를 채우지 않고 memory나 write buffer로 보낼 수 있어 streaming write에 유리할 때가 있다. 보통 write-back과 결합되는지, write-through와 어떤 경로를 갖는지를 함께 봐야 한다.

### Backend 연결

대용량 upload buffer나 zero-fill path를 튜닝할 때 read-before-write가 생기는지 확인한다. application의 “한 번만 쓰는 data”와 CPU cache의 line policy를 분리해 판단한다.

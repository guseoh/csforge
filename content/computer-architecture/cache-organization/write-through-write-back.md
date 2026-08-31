---
kind: concept
contentKey: computer-architecture.core.cache-organization.write-through-write-back
topicContentKey: computer-architecture.core.cache-organization
slug: write-through-write-back
title: "Write-Through and Write-Back"
summary: "write 시점의 memory 반영과 dirty line 비용을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Write-Through and Write-Back

write-through는 cache write마다 하위 memory에도 반영해 복사본이 빠르게 일치하지만 write traffic이 많다. write-back은 cache만 바꾸고 dirty bit를 세웠다가 eviction 때 한 번에 기록해 traffic을 줄이지만, eviction 전에는 memory가 최신이 아니다.

전원 장애와 coherence는 “write가 끝났다”의 의미를 바꿀 수 있다. write buffer와 fence가 있으면 CPU instruction 완료와 stable storage 또는 다른 core가 관찰하는 시점을 분리해야 한다.

### Backend 연결

durability를 cache policy로 대신 설명하지 않는다. database flush, fsync, replication acknowledgement는 각각 다른 소유자와 보장 경계를 갖는다.

---
kind: concept
contentKey: computer-architecture.core.cache-organization.set-associative-cache
topicContentKey: computer-architecture.core.cache-organization
slug: set-associative-cache
title: "Set-Associative Cache"
summary: "set 안의 여러 way가 conflict miss를 줄이는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Set-Associative Cache

set index가 후보 set을 정하고 그 안의 여러 way tag를 병렬 비교한다. 같은 set에 mapping되는 block을 여러 개 보존할 수 있어 direct-mapped보다 conflict miss가 줄지만, 비교기·전력·hit latency와 replacement 정책이 추가된다.

associativity를 무한히 높이면 fully associative에 가까워지지만 set 선택과 tag 비교 비용이 커진다. 실제 선택은 working set, access pattern, clock budget 사이의 절충이며 hit율 하나로 판단하지 않는다.

### Backend 연결

고정된 key hash나 메모리 stride가 특정 set만 쓰는지 확인할 때 유용하다. cache 크기 조정 전에 line size와 associativity, replacement counter를 함께 관찰한다.

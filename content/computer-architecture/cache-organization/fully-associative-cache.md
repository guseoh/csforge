---
kind: concept
contentKey: computer-architecture.core.cache-organization.fully-associative-cache
topicContentKey: computer-architecture.core.cache-organization
slug: fully-associative-cache
title: "Fully-Associative Cache"
summary: "어느 line에도 배치하는 대신 비교 비용을 지불하는 구조를 설명한다."
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

fully-associative cache는 index로 후보를 한정하지 않고 요청 tag를 모든 valid line과 비교한다. block을 어디든 놓을 수 있어 conflict miss가 최소화되지만 많은 비교기와 높은 전력, replacement 선택 비용이 필요하다.

작은 TLB나 victim cache에는 이 trade-off가 맞을 수 있지만 큰 data cache 전체에 적용하기는 어렵다. “conflict가 없다”는 장점도 capacity miss와 compulsory miss까지 없앤다는 뜻은 아니다.

### Backend 연결

작은 hot metadata cache가 높은 associativity를 쓰는 이유를 분석할 때 capacity와 lookup latency를 함께 본다. 자료구조의 hash collision과 hardware cache placement를 같은 현상으로 설명하지 않는다.

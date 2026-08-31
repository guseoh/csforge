---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.cache-line
topicContentKey: computer-architecture.core.memory-hierarchy
slug: cache-line
title: "Cache Line"
summary: "cache가 byte가 아닌 line 단위로 이동하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Cache Line

### cache가 가져오는 묶음

cache line은 tag와 valid/dirty 상태를 가진 data block이다. CPU가 line 안의 한 byte를 처음 요청하면 하위 계층에서 line 전체를 채우고, 이후 같은 line의 인접 byte는 hit가 된다. line이 너무 작으면 spatial benefit이 작고 너무 크면 쓰지 않을 data를 운반한다.

주소의 offset은 line 내부 위치를 고르고 tag/index는 line 후보를 찾는다. 두 주소가 다른 값이어도 같은 set에 경쟁하면 conflict miss가 생기며, line size만 늘려 이 문제를 해결할 수는 없다.

### Backend 연결

배열·record 배치와 false sharing을 분석할 때 field가 어느 line에 함께 놓이는지 확인한다. object 단위 cache hit와 실제 hardware line hit는 다른 측정이므로 숫자의 단위를 명시한다.

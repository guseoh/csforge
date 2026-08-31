---
kind: concept
contentKey: computer-architecture.core.multicore-memory.coherence-protocol-model
topicContentKey: computer-architecture.core.multicore-memory
slug: coherence-protocol-model
title: "Coherence Protocol Model"
summary: "line state와 invalidation 흐름으로 coherence를 추론한다."
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Coherence Protocol Model

coherence protocol은 line을 modified·exclusive·shared·invalid 같은 상태로 추적하고 read miss·write miss·snoop event에 따라 전이시킨다. 예를 들어 shared line에 write하려면 다른 cache copy를 무효화하고 writer가 ownership을 얻은 뒤 modified 상태로 바뀔 수 있다.

정확한 상태 이름은 protocol마다 다르지만 핵심은 “누가 최신 값을 소유하고 다른 copy는 읽을 수 있는가”다. invalidation acknowledgement가 끝나기 전의 관찰 시점과 memory ordering은 별도로 정의된다.

### Backend 연결

멀티스레드 latency spike를 조사할 때 lock wait, interconnect traffic, cache miss를 함께 수집한다. protocol 상태를 Java synchronization 보장으로 바로 번역하지 않는다.

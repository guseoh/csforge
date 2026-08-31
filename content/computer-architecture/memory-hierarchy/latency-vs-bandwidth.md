---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.latency-vs-bandwidth
topicContentKey: computer-architecture.core.memory-hierarchy
slug: latency-vs-bandwidth
title: "Latency versus Bandwidth"
summary: "첫 byte 지연과 지속 전송량을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Latency versus Bandwidth

### 시작 지연과 steady-state 처리량

latency는 요청을 시작해 첫 결과를 얻기까지의 시간이고 bandwidth는 일정 시간에 옮길 수 있는 data 양이다. 작은 random read는 latency에 민감하고 큰 sequential transfer는 bandwidth를 소비한다. 높은 bandwidth 장치도 첫 byte가 늦을 수 있다.

burst transfer는 fixed setup latency를 많은 byte에 나눌 때 유리하지만, queue가 길어지면 관측 latency가 증가한다. 따라서 theoretical bandwidth와 실제 요청의 size·concurrency·contention을 구분해 계산한다.

### Backend 연결

파일 upload와 API의 p99 지연을 같은 “네트워크 속도”로 설명하지 않는다. request size, connection reuse, storage flush, queue wait를 분해해 어느 계층의 한계인지 확인한다.

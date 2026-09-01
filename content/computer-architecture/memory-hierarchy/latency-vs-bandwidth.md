---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.latency-vs-bandwidth
topicContentKey: computer-architecture.core.memory-hierarchy
slug: latency-vs-bandwidth
title: "Latency versus Bandwidth"
summary: "한 access의 지연 시간과 단위 시간당 전송량을 구분하고 request size·concurrency에 따라 병목이 달라지는 이유를 설명한다."
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

### 빠르다는 말에는 서로 다른 두 질문이 섞일 수 있다

latency는 하나의 요청이 시작된 뒤 필요한 결과를 얻기까지 걸리는 시간이다. bandwidth는 일정 시간 동안 얼마나 많은 data를 이동하거나 처리할 수 있는지를 뜻한다. 두 값은 관련되어 있지만 같은 지표는 아니다. memory system이 초당 매우 많은 byte를 전송할 수 있어도 한 random load가 결과를 받기까지는 긴 latency가 필요할 수 있다.

작은 random access는 매 요청에서 기다리는 시간이 중요하므로 latency에 민감하다. 반면 큰 sequential transfer는 초기 access latency를 한 번 지불한 뒤 많은 data를 연속으로 옮길 수 있어 sustained bandwidth가 중요해진다. 그래서 `DRAM bandwidth가 높다`는 사실만으로 pointer chasing 같은 dependent random load가 빠르다고 말할 수 없다.

### Parallelism은 latency를 없애기보다 겹칠 수 있다

하나의 memory request가 100ns를 기다려야 하더라도 서로 독립적인 여러 request를 동시에 outstanding 상태로 둘 수 있다면 memory system은 그 대기 시간을 겹치면서 높은 aggregate throughput을 낼 수 있다. 반대로 다음 address가 앞 load 결과에 의존한다면 한 request가 끝나야 다음을 보낼 수 있어 available bandwidth를 충분히 사용하지 못할 수 있다.

따라서 bandwidth saturation과 latency bottleneck은 다른 형태로 나타난다. 많은 core나 DMA device가 동시에 memory를 사용하면 aggregate bandwidth 한계에 도달해 각 요청이 queue에서 더 오래 기다릴 수 있고, 이때 contention 때문에 관측 latency도 함께 증가한다.

### Transfer size가 크면 fixed cost를 나눌 수 있지만 공짜는 아니다

line fill이나 burst transfer는 command/setup 비용을 여러 byte에 나눠 spatial locality가 있는 workload의 효율을 높일 수 있다. 하지만 실제로 필요하지 않은 data까지 가져오면 bandwidth와 cache capacity를 낭비한다. 큰 batch도 per-operation overhead를 줄일 수 있지만 queue에 오래 머물거나 다른 요청을 밀어내 tail latency를 악화시킬 수 있다.

그래서 theoretical peak bandwidth를 실제 application 성능으로 그대로 환산하지 않는다. request size, access pattern, concurrency, queueing, read/write mix를 함께 측정해야 한다.

### Backend에서 throughput과 latency를 분리해야 하는 이유

예를 들어 content import가 초당 100MB를 처리한다고 해서 작은 API read의 p99가 낮다는 뜻은 아니다. import는 큰 sequential transfer와 batching으로 bandwidth를 활용할 수 있지만 API 요청은 작은 random DB page access, lock wait, network round trip 같은 latency에 민감할 수 있다.

성능 목표를 잡을 때 `초당 처리 건수`와 `한 요청이 끝나는 시간`을 따로 기록한다. throughput을 올리기 위해 batch나 concurrency를 키웠을 때 queueing으로 p99가 악화될 수 있고, 반대로 latency를 줄이기 위해 동시성을 제한하면 aggregate throughput이 낮아질 수 있다. 어떤 지표가 사용자 경험과 현재 병목을 나타내는지 먼저 결정해야 한다.

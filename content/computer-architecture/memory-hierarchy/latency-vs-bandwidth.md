---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.latency-vs-bandwidth
topicContentKey: computer-architecture.core.memory-hierarchy
slug: latency-vs-bandwidth
title: "지연 시간과 대역폭"
summary: "한 번의 접근이 끝나는 시간과 단위 시간당 전송할 수 있는 양을 구분한다."
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
# 지연 시간과 대역폭

Memory가 `빠르다`는 말에는 서로 다른 두 질문이 섞일 수 있다. **지연 시간(latency)** 은 하나의 요청이 결과를 얻기까지 걸리는 시간이고, **대역폭(bandwidth)** 은 일정 시간 동안 얼마나 많은 data를 옮길 수 있는지를 뜻한다.

높은 bandwidth를 가진 memory system도 random load 하나의 결과를 받기까지는 오래 걸릴 수 있다. 반대로 한 번의 접근 latency가 짧더라도 동시에 많은 data를 계속 보내는 능력은 제한될 수 있다.

### 작은 random access는 latency에 민감하다

다음 address가 앞 load 결과에 의존하는 pointer chasing을 생각해 보자. 한 요청이 끝나야 다음 요청 주소를 알 수 있으므로 여러 memory access를 동시에 겹치기 어렵다. 이런 workload에서는 각 access의 latency가 직접적인 병목이 되기 쉽다.

```text
load A ──wait──> address B
                 │
                 └─ load B ──wait──> address C
```

### 독립적인 요청이 많으면 bandwidth를 활용할 수 있다

서로 독립적인 memory 요청을 여러 개 동시에 outstanding 상태로 둘 수 있다면 각 요청의 대기 시간을 겹칠 수 있다. 한 요청의 latency 자체가 사라지는 것은 아니지만 memory system 전체는 더 높은 처리량을 낼 수 있다.

큰 sequential transfer도 초기 접근 비용을 지불한 뒤 연속된 data를 많이 이동하므로 sustained bandwidth가 중요해진다.

### 둘은 서로 영향을 주기도 한다

많은 core나 device가 동시에 memory를 사용해 bandwidth 한계에 가까워지면 요청이 queue에 쌓이고 개별 access latency도 증가할 수 있다. 그래서 latency와 bandwidth는 같은 지표는 아니지만 완전히 독립적이지도 않다.

Memory 성능을 판단할 때는 access pattern, transfer size, dependency와 concurrency를 함께 봐야 한다. `최대 bandwidth가 높다`는 사양 하나만으로 모든 workload가 빨라진다고 결론내릴 수 없다.

---
kind: concept
contentKey: infrastructure.core.compute.resource-boundaries
topicContentKey: infrastructure.core.compute
slug: resource-boundaries
title: "Resource Request와 Limit"
summary: "CPU·memory request가 scheduling에, limit이 실행 중 자원 사용 상한에 어떤 영향을 주는지 구분하고 throttling·OOM을 capacity 관점에서 판단한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"
    title: "Kubernetes Documentation: Resource Management for Pods and Containers"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "resource request·limit과 scheduling·runtime enforcement 확인"
---
# Resource Request와 Limit

Kubernetes에서 CPU와 memory를 선언하는 값은 단순한 문서가 아닙니다. **Request는 scheduler가 Pod를 어디에 배치할지 판단하는 기준**이 되고, limit은 실행 중 container가 사용할 수 있는 자원 상한과 연결됩니다.

```text
Node: 4 CPU / 8 GiB

Pod A request: 1 CPU / 2 GiB
Pod B request: 2 CPU / 4 GiB
        │
        └─ scheduler가 배치 가능성을 계산
```

Request를 실제 필요량보다 지나치게 낮게 잡으면 한 node에 너무 많은 workload가 들어가 contention이 커질 수 있습니다. 반대로 과하게 높이면 실제 자원이 남아 있어도 Pod가 배치되지 못할 수 있습니다.

### CPU와 memory limit은 실패 형태가 다르다

CPU 사용이 limit을 넘으면 일반적으로 실행 시간이 제한되어 latency 증가로 드러날 수 있습니다. Memory는 같은 방식으로 느려지는 것이 아니라 limit과 node pressure 상황에서 OOM kill이나 eviction 같은 종료로 이어질 수 있습니다.

```text
CPU pressure
→ throttling
→ 응답 지연 증가 가능

Memory pressure
→ OOM / eviction 가능
→ process restart
```

JVM 애플리케이션에서는 heap만 계산해서는 부족합니다. Metaspace, thread stack, direct/native memory와 같은 process memory도 container budget 안에 들어갑니다.

### 선언값은 실제 사용량과 함께 조정한다

Request와 limit은 한 번 정하고 끝나는 상수가 아닙니다. 실제 CPU 사용률, memory working set, throttling, OOM/restart, pending Pod를 관측해 workload에 맞게 조정해야 합니다.

또한 request를 생략하고 limit만 설정했을 때 platform이 request 값을 어떻게 기본화하는지도 현재 Kubernetes 설정과 계약으로 확인합니다.

Resource 설정의 목적은 최대한 작은 숫자를 넣는 것이 아니라 **scheduler가 현실적인 capacity를 보게 하고, 한 workload가 다른 workload의 자원을 무제한으로 침범하지 못하게 하는 것**입니다.

---
kind: concept
contentKey: infrastructure.core.compute.resource-boundaries
topicContentKey: infrastructure.core.compute
slug: resource-boundaries
title: "resource requests와 limits"
summary: "CPU·memory request와 limit이 scheduling·throttling·OOM/eviction에 미치는 영향을 판단한다"
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
# resource requests와 limits

Container가 사용할 CPU와 memory를 선언하는 것은 단순한 설정값이 아니라 scheduler와 runtime에게 capacity 계약을 전달하는 일입니다. Kubernetes의 request는 scheduler가 Pod를 어느 node에 배치할 수 있는지 계산할 때 사용하는 기준이고, limit은 실행 중 container가 사용할 수 있는 자원의 상한을 표현합니다.

```text
node capacity 4 CPU / 8 GiB
pod A request 1 CPU / 2 GiB
pod B request 2 CPU / 4 GiB
```

### request와 limit의 의미를 구분한다

request를 실제 필요량보다 지나치게 낮게 잡으면 한 node에 많은 Pod가 배치되어 contention과 memory pressure가 커질 수 있고, 반대로 지나치게 높게 잡으면 실제 여유가 있어도 scheduler가 배치 가능한 node를 찾지 못할 수 있습니다. limit을 너무 낮게 두면 CPU throttling이나 memory limit 초과로 application이 느려지거나 종료될 수 있습니다. **기본 scheduling 판단은 request를 기준으로 하며 limit 자체를 node의 예약량처럼 계산하지는 않습니다.** 다만 request를 생략하고 limit만 지정한 경우 Kubernetes가 해당 limit을 request 값으로 사용할 수 있으므로, 이때는 결과적으로 limit 설정이 scheduling에도 영향을 줄 수 있습니다.

### memory와 CPU 실패가 다르다

CPU limit은 일반적으로 throttling을 통해 실행 시간을 제한하므로 latency 증가로 나타날 수 있습니다. memory limit은 CPU처럼 단순히 느려지는 상한이 아니며, 초과 상황에서는 cgroup·kernel·kubelet의 메모리 관리와 Pod 상태에 따라 OOM kill이나 eviction으로 이어질 수 있습니다. JVM application은 heap만 limit 안에 맞추면 되는 것이 아니라 metaspace, thread stack, native/direct memory와 sidecar까지 포함해 container budget을 봐야 합니다.

### 문제를 풀 때 확인할 것

1. request가 placement capacity를 과대·과소 표현하지 않는지 봅니다.
2. CPU throttling과 memory OOM/eviction을 구분합니다.
3. request를 생략했을 때 limit이 default request로 반영되는 설정인지 확인합니다.
4. JVM·sidecar·temporary storage의 실제 footprint를 계산합니다.
5. 선언값 변경 뒤 latency·restart·node utilization과 pending Pod를 측정합니다.

### 면접에서 설명한다면

Request는 scheduler가 필요한 자원을 계산하는 기준이고 limit은 실행 중 사용할 수 있는 상한입니다. CPU limit은 throttling과 latency에, memory limit은 OOM kill 같은 실패에 연결될 수 있습니다. request를 생략한 경우 limit이 request로 사용될 수 있다는 예외까지 구분하고, JVM heap뿐 아니라 native memory와 sidecar를 포함한 실제 footprint를 metric으로 비교해 조정해야 합니다.


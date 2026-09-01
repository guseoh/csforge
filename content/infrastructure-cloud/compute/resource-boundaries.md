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

Container가 사용할 CPU와 memory를 선언하는 것은 단순한 설정값이 아니라 scheduler와 runtime에게 capacity 계약을 전달하는 일입니다. Kubernetes의 request는 배치 가능성을 계산하는 기준이고 limit은 실행 중 사용할 수 있는 상한으로 작동합니다.

```text
node capacity 4 CPU / 8 GiB
pod A request 1 CPU / 2 GiB
pod B request 2 CPU / 4 GiB
```

### request와 limit의 의미를 구분한다

request를 실제 peak 사용량보다 낮게 쓰면 node에 과도하게 배치되어 contention이 커질 수 있습니다. limit을 너무 낮게 두면 CPU throttling이나 memory limit 초과로 application이 느려지거나 종료될 수 있고, 너무 높게 두면 scheduler가 남은 공간을 보수적으로 판단할 수 있습니다.

### memory와 CPU 실패가 다르다

CPU 부족은 대체로 scheduling delay·throttling·latency로 나타나지만 memory 초과는 OOM kill이나 eviction으로 process restart로 이어질 수 있습니다. JVM application은 heap만 limit 안에 맞추면 되는 것이 아니라 metaspace, thread stack, native memory와 sidecar까지 포함해 container budget을 봐야 합니다.

### 문제를 풀 때 확인할 것

1. request가 placement capacity를 과대·과소 표현하지 않는지 봅니다.
2. CPU throttling과 memory OOM을 구분합니다.
3. JVM·sidecar·temporary storage의 실제 footprint를 계산합니다.
4. limit 초과가 restart와 data loss에 미치는 영향을 확인합니다.
5. limit 변경 뒤 latency·restart·node utilization을 측정합니다.

### 면접에서 설명한다면

Request는 scheduler가 필요한 자원을 계산하는 기준이고 limit은 실행 중 사용할 수 있는 상한입니다. CPU 부족은 throttling과 latency로, memory 초과는 OOM/restart로 나타날 수 있으므로 JVM heap만 보고 container memory를 정하지 않습니다. 선언값과 실제 사용량을 metric으로 비교해 조정해야 합니다.


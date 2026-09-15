---
kind: concept
contentKey: performance.core.measurement.saturation-queueing
topicContentKey: performance.core.measurement
slug: saturation-queueing
title: "포화와 대기열"
summary: "제한된 자원이 포화될 때 queue가 쌓이고 대기 시간이 늘어나는 흐름을 이해하고 utilization과 queue depth를 함께 해석한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"
    title: "Kubernetes Documentation: Resource Management for Pods and Containers"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "container resource boundary와 saturation 관측의 기반 확인"
---
# 포화와 대기열

CPU, worker thread, DB connection, message consumer처럼 동시에 처리할 수 있는 양이 제한된 자원에는 반드시 용량의 경계가 있습니다. 요청이 그 처리 속도보다 빠르게 들어오기 시작하면 바로 실패하기보다 먼저 queue가 쌓이고, 사용자는 실제 작업 시간에 더해 대기 시간까지 지불하게 됩니다.

```text
arrival
  │
  ▼
[ waiting queue ] ─▶ worker ─▶ response
       ▲
       └─ 처리 속도보다 유입이 빠르면 증가
```

그래서 utilization만 보고 포화를 판단하면 늦을 수 있습니다. CPU가 아직 100%가 아니어도 thread pool 앞의 queue가 계속 늘거나 DB connection 대기가 길어지면 이미 사용자 latency는 악화되고 있을 수 있습니다. 자원마다 포화를 드러내는 신호도 다릅니다.

| 자원 | 함께 볼 신호 |
| --- | --- |
| CPU | utilization, throttling, run queue |
| DB connection pool | active/waiting connection, wait time |
| worker queue | queue depth, oldest item age |
| memory | allocation pressure, GC, OOM |

Little's Law는 안정된 시스템에서 평균 시스템 내 작업 수, 도착률, 평균 체류 시간이 서로 연결된다는 직관을 줍니다. 이를 통해 처리량이 비슷한데 queue가 늘고 있다면 작업이 시스템 안에 더 오래 머물고 있다는 사실을 이해할 수 있습니다. 다만 실제 capacity 판단에서는 workload 변화와 여러 downstream 병목을 함께 측정해야 합니다.

포화 이후 무제한 queue로 버티면 장애가 사라지는 것이 아니라 긴 timeout과 memory pressure로 형태가 바뀝니다. 따라서 bounded queue, 동시성 제한, admission control이나 load shedding처럼 **받을 수 있는 양을 명시적으로 제한하는 정책**이 필요하며, 어떤 요청을 거절해도 되는지는 제품 중요도와 복구 가능성을 기준으로 정합니다.

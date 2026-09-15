---
kind: concept
contentKey: distributed.core.time-failure.failure-detectors
topicContentKey: distributed.core.time-failure
slug: failure-detectors
title: "장애 감지와 의심 판단"
summary: "heartbeat와 timeout이 node의 실제 죽음을 증명하는 것이 아니라 일정 시간 응답하지 않는다는 suspicion을 만든다는 점을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://etcd.io/docs/v3.5/op-guide/failures/"
    title: "etcd Documentation: Failure modes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "timeout 기반 leader failure detection과 election delay 확인"
  - url: "https://kubernetes.io/docs/concepts/architecture/leases/"
    title: "Kubernetes Documentation: Leases"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "heartbeat와 liveness 판단을 위한 Lease 확인"
---
# 장애 감지와 의심 판단

분산 시스템에서는 다른 node가 실제로 죽었는지 즉시 확인할 방법이 없습니다. Heartbeat가 오지 않거나 요청이 timeout되면 알 수 있는 것은 **일정 시간 동안 상대의 응답을 관찰하지 못했다는 사실**뿐입니다. 그래서 failure detector는 죽음을 증명하기보다 현재 node를 의심(suspect)하는 메커니즘으로 이해하는 편이 정확합니다.

```text
heartbeat 정상 수신  → reachable하다고 관찰
heartbeat 지연       → slow인지 failed인지 아직 모름
timeout 초과          → failed로 의심
```

Timeout을 짧게 잡으면 실제 장애를 빨리 감지할 수 있지만 순간적인 network delay나 긴 GC pause도 장애로 오인할 수 있습니다. 반대로 timeout을 길게 잡으면 false positive는 줄어들 수 있지만 실제로 죽은 node를 오래 기다려 recovery가 늦어집니다.

Heartbeat 역시 “서비스가 정상적으로 요청을 처리할 수 있다”는 보장은 아닙니다. Process가 heartbeat는 보내지만 DB connection이 고갈돼 실제 요청은 처리하지 못할 수도 있습니다. 따라서 liveness 신호와 readiness·dependency health·사용자 latency 같은 serving 상태를 구분해야 합니다.

```text
process heartbeat OK
        │
        ├─ DB 정상 → serving 가능
        └─ DB 장애 → heartbeat는 살아 있어도 요청 처리 실패
```

Failure detector의 판단을 곧바로 위험한 side effect의 권한으로 사용해서도 안 됩니다. 살아 있는 node를 잘못 의심하더라도 데이터가 깨지지 않도록 leader term, quorum, lease·fencing 같은 별도 safety mechanism이 필요할 수 있습니다.

즉 failure detection은 **다른 node의 상태를 불완전한 관찰로 추정하는 문제**이고, 그 추정이 틀렸을 때도 correctness를 지키는 것은 coordination protocol의 별도 책임입니다.

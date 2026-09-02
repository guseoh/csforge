---
kind: concept
contentKey: distributed.core.time-failure.failure-detectors
topicContentKey: distributed.core.time-failure
slug: failure-detectors
title: "failure detector와 suspicion"
summary: "timeout 기반 liveness 판단의 false positive·false negative와 recovery state를 다룬다"
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
# failure detector와 suspicion

Failure detector는 node가 실제로 죽었는지 직접 보는 마법이 아니라 heartbeat, response timeout, lease expiry 같은 관찰로 “현재 응답하지 않는다고 의심”하는 메커니즘입니다. 네트워크가 느리거나 process가 stop-the-world 중이면 살아 있는 node도 의심할 수 있고, 너무 관대하면 죽은 node를 오래 기다립니다.

### false positive와 false negative

```text
slow network / GC pause ─▶ healthy node를 dead로 의심
partition / crash       ─▶ 실제 node를 unavailable로 판단
long timeout            ─▶ stale owner가 오래 남음
```

이 판단은 safety와 liveness의 trade-off입니다. 새 leader를 빨리 뽑으면 이전 leader가 아직 write할 위험이 커지고, 보수적으로 기다리면 recovery latency가 커집니다. suspicion을 곧바로 destructive action으로 바꾸지 말고 lease, quorum, epoch와 결합합니다.

### heartbeat는 health check와 다르다

heartbeat는 process가 coordinator와 통신할 수 있다는 신호일 뿐 DB query나 실제 request 처리 가능성을 증명하지 않을 수 있습니다. readiness·dependency health·workload latency는 별도 signal로 관측하고, 어떤 signal이 ownership을 회수할 권한을 가지는지 명시합니다.

### recovery state를 설계한다

partition이 끝난 뒤 old node가 재접속하면 stale cache, 미전달 write, 이전 leader의 command가 남아 있을 수 있습니다. epoch/version을 비교해 오래된 actor의 write를 거부하고, 상태를 resync한 뒤 serving을 재개합니다. “재연결 성공”과 “정합한 상태로 복귀”를 같은 상태로 표현하지 않습니다.

### 문제를 풀 때 확인할 것

1. detector가 실제로 관측하는 signal과 blind spot을 적습니다.
2. timeout·heartbeat·lease duration과 recovery latency를 계산합니다.
3. false positive가 safety를 깨뜨리지 않는지 검토합니다.
4. heartbeat와 serving/readiness health를 구분합니다.
5. 재접속 node의 epoch·resync·stale command 처리를 정의합니다.

### 면접에서 설명한다면

Failure detector는 죽음을 증명하지 않고 일정 시간 응답이 없다는 suspicion을 만듭니다. timeout을 짧게 하면 빠른 복구와 false positive 비용이, 길게 하면 stale owner와 장애 감지 지연이 커집니다. lease·quorum·epoch/fencing으로 의심만으로 잘못된 side effect가 실행되지 않게 합니다.

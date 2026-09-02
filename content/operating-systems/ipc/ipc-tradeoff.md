---
kind: concept
contentKey: operating-systems.core.ipc.ipc-tradeoff
topicContentKey: operating-systems.core.ipc
slug: ipc-tradeoff
title: "IPC Trade-off"
summary: "pipe·shared memory·queue·socket의 복사·격리·복잡도를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/pipe.7.html"
    title: "pipe(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "pipe의 byte-stream semantics, capacity, EOF와 blocking/non-blocking 동작을 확인한다."
    displayOrder: 1
---
# IPC Trade-off

IPC를 선택할 때 `가장 빠른가` 하나만 비교하면 실제 장애와 운영 비용을 놓친다. 먼저 data가 어디에 존재하고 누가 ownership을 가지는지, kernel이 어떤 buffer·queue·endpoint를 관리하는지, sender와 receiver 사이에 copy가 몇 번 필요한지와 그 copy가 end-to-end latency에 어떤 영향을 주는지를 확인한다. 이어서 message boundary와 synchronization, capacity/backpressure, process 또는 host failure 때 복구할 상태를 비교해야 한다.

| 방식 | data 경로와 경계 | 대표 장점 | 직접 부담하는 문제 |
| --- | --- | --- | --- |
| pipe | kernel byte buffer, 보통 local process 사이 | 단순한 producer-consumer와 자연스러운 EOF | stream framing, bounded capacity, descriptor lifetime |
| message queue | kernel queue가 discrete message를 보존 | message boundary와 queue ownership | message size/capacity, copy, queue lifetime·priority 계약 |
| shared memory | 여러 address space가 같은 backing memory를 매핑 | 큰 data에서 kernel-mediated copy를 줄일 가능성 | mutex/atomic protocol, memory ordering, crash recovery와 layout compatibility |
| Unix-domain socket | 같은 host의 socket endpoint | socket lifecycle과 local namespace/credential 활용 | stream framing 또는 datagram semantics, endpoint cleanup |
| network socket | host·network를 잇는 socket과 transport | remote process로 확장, 표준 protocol 재사용 | serialization, timeout, partial transfer, network failure와 retry |

이 표에서 `copy가 적다`는 `동기화가 적다`는 뜻이 아니다. shared memory는 payload를 직접 보게 해 copy를 줄일 수 있지만 producer가 publish하기 전 consumer가 읽지 않도록 memory ordering과 ownership protocol을 추가해야 한다. 반대로 pipe·queue·socket은 kernel buffer가 process memory를 직접 공유하지 않게 해 boundary를 단순화하지만 capacity가 차면 backpressure가 sender에게 전달된다.

### Failure boundary와 lifecycle을 함께 선택한다

같은 host의 helper process가 crash했을 때 pipe와 socket은 EOF/reset처럼 관찰 가능한 channel failure를 제공할 수 있지만, 이미 처리된 command와 아직 buffer에 남은 command를 application이 구분해 복구해야 한다. shared memory는 channel 자체가 request 완료나 peer liveness를 알려 주지 않으므로 heartbeat, generation, ownership recovery 같은 protocol이 더 필요하다. network socket은 여기에 host reachability와 중간 network failure가 추가된다.

따라서 작은 control message와 명확한 종료 lifecycle에는 pipe·Unix socket·message queue가 읽기 쉬울 수 있고, 큰 local payload에는 shared memory가 후보가 될 수 있다. 다른 host로 확장하거나 이미 표준 request/response protocol이 필요하면 network socket을 선택하되 framing·timeout·재시도 semantics를 명시한다. 성능 숫자를 미리 가정하지 말고 payload 크기, access pattern, contention, failure recovery 비용을 측정한다.

CSForge의 DB outbox와 worker queue 같은 application messaging은 이 OS primitive와 별도의 durability·redelivery 계약을 가진다. 파생 search/AI 작업을 process IPC로 연결하더라도 canonical PostgreSQL state와 중복 delivery 복구를 application boundary에서 보장해야 한다.


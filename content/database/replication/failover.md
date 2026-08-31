---
kind: concept
contentKey: database.core.replication.failover
topicContentKey: database.core.replication
slug: failover
title: "Failover에서 최신성과 가용성 사이 선택"
summary: "primary 장애 시 replica를 승격할 때 asynchronous replication에서 아직 전달되지 않은 commit을 잃을 수 있는 이유와 synchronous replication의 latency·availability trade-off를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/warm-standby-failover.html"
    title: "PostgreSQL Documentation: Failover"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: standby promotion과 failover 절차 확인
  - url: "https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION"
    title: "PostgreSQL Documentation: Synchronous Replication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: synchronous commit과 standby acknowledgement trade-off 확인
---
# Failover에서 최신성과 가용성 사이 선택

Primary가 완전히 죽었을 때 replica를 새 primary로 승격하면 서비스를 빠르게 복구할 수 있습니다. 하지만 asynchronous replication에서는 primary가 사용자에게 commit 성공을 반환한 뒤 **그 WAL이 replica에 도착하기 전에 장애**가 날 수 있습니다.

```text
Client              Primary              Replica
  │                    │                    │
  │ UPDATE             │                    │
  ├───────────────────►│                    │
  │                    │ COMMIT             │
  │ success ◄──────────┤                    │
  │                    X crash              │
  │                    │                    │
  │                    │ WAL not received   │
                       │                    │
                       └──── lost on failover?
```

이 replica를 승격하면 사용자는 성공했다고 들었던 최신 transaction이 없을 수 있습니다.

### synchronous replication은 위험을 줄이는 대신 commit 경로를 늘린다

특정 synchronous standby가 WAL을 확인할 때까지 primary commit이 기다리도록 설정하면 data loss 가능성을 줄일 수 있습니다.

```text
Primary COMMIT
   │
   ├─ local WAL
   ├─ standby acknowledgement 대기
   ▼
Client success
```

하지만 standby/network가 느리거나 unavailable하면 commit latency가 증가하거나 write availability에 영향을 줄 수 있습니다.

### RPO와 RTO로 요구를 표현한다

| 개념 | 질문                                            |
| ---- | ----------------------------------------------- |
| RPO  | 장애 시 어느 정도 data loss를 허용할 수 있는가? |
| RTO  | 서비스 복구까지 얼마나 오래 걸려도 되는가?      |

모든 시스템이 zero-RPO/zero-RTO를 현실적인 비용으로 달성할 수 있는 것은 아닙니다. 결제 원장과 임시 analytics 데이터는 요구가 다를 수 있습니다.

### split brain도 막아야 한다

네트워크 분할에서 old primary와 promoted primary가 동시에 write를 받으면 서로 다른 history가 생길 수 있습니다. 실제 HA 시스템은 leader fencing, orchestrator, quorum/lease 같은 방식으로 **한 시점에 authoritative writer가 하나라는 계약**을 보호해야 합니다.

Failover는 “replica를 primary로 바꾸는 명령”이 아니라 **어떤 commit을 잃을 수 있는지, 언제 새 writer를 신뢰할지, old primary를 어떻게 차단할지**까지 포함하는 운영 설계입니다.

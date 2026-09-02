---
kind: concept
contentKey: database.core.replication.failover
topicContentKey: database.core.replication
slug: failover
title: "Failover에서 최신성과 가용성 사이 선택"
summary: "primary 장애 시 standby를 승격할 때 asynchronous replication에서 아직 안전하게 복제되지 않은 commit을 잃을 수 있는 이유와 synchronous replication의 acknowledgement 단계·latency·availability trade-off를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/warm-standby-failover.html"
    title: "PostgreSQL Documentation: Failover"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: standby promotion, old primary 차단과 PostgreSQL core failover 경계 확인
  - url: "https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION"
    title: "PostgreSQL Documentation: Synchronous Replication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: synchronous standby와 commit acknowledgement trade-off 확인
---
# Failover에서 최신성과 가용성 사이 선택

Primary가 완전히 죽었을 때 standby를 새 primary로 승격하면 서비스를 복구할 수 있습니다. 하지만 PostgreSQL streaming replication은 기본적으로 asynchronous이므로 primary가 사용자에게 commit 성공을 반환한 뒤 **그 transaction의 WAL이 failover 대상 standby에 안전하게 도착하기 전에 장애**가 날 수 있습니다.

```text
Client              Primary              Standby
  │                    │                    │
  │ UPDATE             │                    │
  ├───────────────────►│                    │
  │                    │ COMMIT             │
  │ success ◄──────────┤                    │
  │                    X crash              │
  │                                         │
  │                   WAL not safely present│
                                            │
                                 promote ────┘
```

이 standby를 승격하면 사용자는 성공했다고 들었던 최신 transaction이 새 primary history에 없을 수 있습니다. 여기서 중요한 경계는 “replay가 아직 끝나지 않았다” 자체가 아닙니다. standby가 이미 WAL을 안전하게 받아 두었다면 promotion 과정에서 사용 가능한 WAL을 recovery하며 따라갈 수 있습니다. **실제 data-loss window는 failover 대상이 해당 commit을 복구할 수 있을 만큼 WAL을 확보했는가**와 연결됩니다.

### synchronous replication은 어디까지 기다리는지까지 봐야 한다

“Synchronous standby가 응답한다”만으로는 보장이 충분히 구체적이지 않습니다. PostgreSQL은 `synchronous_standby_names`로 동기 대상 후보를 정하고, transaction의 `synchronous_commit` 값에 따라 primary가 어느 remote 단계까지 기다릴지를 바꿀 수 있습니다.

```text
Primary COMMIT
   │
   ├─ local WAL durability
   │
   ├─ remote_write  → standby OS에 WAL write 확인
   ├─ on            → standby의 WAL durable flush 확인
   └─ remote_apply  → standby가 WAL을 replay/apply한 것까지 확인
```

따라서 synchronous replication을 “replica에 보냈으니 zero-RPO”라고 한 문장으로 일반화하지 않습니다. 어떤 standby 집합을 동기로 요구하는지, commit이 remote write/flush/apply 중 어디까지 기다리는지, failover 대상이 그 acknowledgement 계약에 포함되는지를 함께 봐야 합니다.

동기 standby나 network가 느리거나 unavailable한데 설정이 여전히 그 acknowledgement를 요구하면 commit latency가 증가하거나 write progress가 멈출 수 있습니다. data-loss 위험을 줄이는 대신 latency와 availability 비용을 지불하는 셈입니다.

### RPO와 RTO로 요구를 표현한다

| 개념 | 질문 |
| --- | --- |
| RPO | 장애 시 어느 정도 data loss를 허용할 수 있는가? |
| RTO | 서비스 복구까지 얼마나 오래 걸려도 되는가? |

모든 시스템이 zero-RPO/zero-RTO를 현실적인 비용으로 달성할 수 있는 것은 아닙니다. 결제 원장과 임시 analytics 데이터는 요구가 다를 수 있습니다.

### promotion과 failover orchestration은 같은 기능이 아니다

PostgreSQL은 standby를 `pg_ctl promote` 또는 `pg_promote()`로 승격할 수 있지만, **primary 장애를 자동 판별하고 올바른 standby를 선택해 traffic을 옮기며 old primary를 차단하는 전체 HA orchestrator를 PostgreSQL core가 제공하는 것은 아닙니다.** 실제 failover 시스템은 외부의 failure detection/orchestration과 운영 절차를 결합합니다.

특히 old primary가 다시 살아나 writer로 요청을 받으면 두 writer가 서로 다른 history를 만들 수 있습니다. PostgreSQL 문서가 설명하듯 old primary가 더 이상 primary가 아님을 확실히 알리거나 STONITH/fencing 같은 방식으로 write 경로에서 제외해야 합니다.

Failover는 “standby를 primary로 바꾸는 명령”이 아니라 **어떤 commit을 보존하는지, 어느 remote acknowledgement를 기다렸는지, 누가 새 writer를 선택하는지, old primary를 어떻게 차단하는지**까지 포함하는 운영 설계입니다.

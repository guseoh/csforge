---
kind: concept
contentKey: database.core.replication.failover
topicContentKey: database.core.replication
slug: failover
title: "장애 조치(Failover)에서 최신성과 가용성 사이 선택"
summary: "프라이머리 장애 시 스탠바이를 승격할 때 비동기 복제에서 아직 안전하게 복제되지 않은 커밋을 잃을 수 있는 이유와 동기 복제의 응답 확인 단계·지연 시간·가용성 trade-off를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/warm-standby-failover.html"
    title: "PostgreSQL Documentation: Failover"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 스탠바이 승격, 이전 프라이머리 차단과 PostgreSQL core 장애 조치 경계 확인
  - url: "https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION"
    title: "PostgreSQL Documentation: Synchronous Replication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 동기 스탠바이와 커밋 응답 확인 단계의 trade-off 확인
---
# 장애 조치(Failover)에서 최신성과 가용성 사이 선택

프라이머리가 완전히 중단됐을 때 스탠바이를 새 프라이머리로 승격하면 서비스를 복구할 수 있습니다. 하지만 PostgreSQL 스트리밍 복제는 기본적으로 비동기이므로 프라이머리가 사용자에게 커밋 성공을 반환한 뒤 **그 트랜잭션의 WAL이 장애 조치 대상 스탠바이에 안전하게 도착하기 전에 장애**가 날 수 있습니다.

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

이 스탠바이를 승격하면 사용자는 성공했다고 들었던 최신 트랜잭션이 새 프라이머리 이력에 없을 수 있습니다. 여기서 중요한 경계는 “재실행이 아직 끝나지 않았다” 자체가 아닙니다. 스탠바이가 이미 WAL을 안전하게 받아 두었다면 승격 과정에서 사용 가능한 WAL을 복구·재실행하며 따라갈 수 있습니다. **실제 데이터 유실 구간은 장애 조치 대상이 해당 커밋을 복구할 수 있을 만큼 WAL을 확보했는가**와 연결됩니다.

### 동기 복제는 어디까지 기다리는지까지 봐야 한다

“동기 스탠바이가 응답한다”만으로는 보장이 충분히 구체적이지 않습니다. PostgreSQL은 `synchronous_standby_names`로 동기 대상 후보를 정하고, 트랜잭션의 `synchronous_commit` 값에 따라 프라이머리가 원격의 어느 단계까지 기다릴지를 바꿀 수 있습니다.

```text
Primary COMMIT
   │
   ├─ local WAL durability
   │
   ├─ remote_write  → standby OS에 WAL write 확인
   ├─ on            → standby의 WAL durable flush 확인
   └─ remote_apply  → standby가 WAL을 replay/apply한 것까지 확인
```

따라서 동기 복제를 “리플리카에 보냈으니 RPO 0”이라고 한 문장으로 일반화하지 않습니다. 어떤 스탠바이 집합을 동기로 요구하는지, 커밋이 원격 write/flush/apply 중 어디까지 기다리는지, 실제 장애 조치 대상이 그 응답 확인 계약에 포함되는지를 함께 봐야 합니다.

동기 스탠바이나 네트워크가 느리거나 사용할 수 없는데 설정이 여전히 그 응답을 요구하면 커밋 지연 시간이 증가하거나 쓰기 진행이 멈출 수 있습니다. 데이터 유실 위험을 줄이는 대신 지연 시간과 가용성 비용을 지불하는 셈입니다.

### RPO와 RTO로 요구를 표현한다

| 개념 | 질문 |
| --- | --- |
| RPO | 장애 시 어느 정도 데이터 유실을 허용할 수 있는가? |
| RTO | 서비스 복구까지 얼마나 오래 걸려도 되는가? |

모든 시스템이 RPO 0과 RTO 0을 현실적인 비용으로 달성할 수 있는 것은 아닙니다. 결제 원장과 임시 분석 데이터는 요구가 다를 수 있습니다.

### 승격과 장애 조치 오케스트레이션은 같은 기능이 아니다

PostgreSQL은 스탠바이를 `pg_ctl promote` 또는 `pg_promote()`로 승격할 수 있지만, **프라이머리 장애를 자동 판별하고 올바른 스탠바이를 선택해 트래픽을 옮기며 이전 프라이머리를 차단하는 전체 고가용성 오케스트레이터를 PostgreSQL core가 제공하는 것은 아닙니다.** 실제 장애 조치 시스템은 외부의 장애 감지·오케스트레이션과 운영 절차를 결합합니다.

특히 이전 프라이머리가 다시 살아나 쓰기 요청을 받으면 두 쓰기 노드가 서로 다른 이력을 만들 수 있습니다. PostgreSQL 문서가 설명하듯 이전 프라이머리가 더 이상 프라이머리가 아님을 확실히 알리거나 STONITH/fencing 같은 방식으로 쓰기 경로에서 제외해야 합니다.

장애 조치는 “스탠바이를 프라이머리로 바꾸는 명령”이 아니라 **어떤 커밋을 보존하는지, 어느 원격 응답 단계를 기다렸는지, 누가 새 쓰기 노드를 선택하는지, 이전 프라이머리를 어떻게 차단하는지**까지 포함하는 운영 설계입니다.

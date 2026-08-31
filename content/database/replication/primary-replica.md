---
kind: concept
contentKey: database.core.replication.primary-replica
topicContentKey: database.core.replication
slug: primary-replica
title: "Primary와 replica의 역할 분리"
summary: "쓰기 authoritative node와 WAL을 따라가는 replica를 구분하고 read scaling·failover를 위해 복제를 사용할 때 replica가 독립된 최신 원본이 아니라 지연 가능한 복제본임을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/warm-standby.html"
    title: "PostgreSQL Documentation: Warm Standby"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: primary/standby와 WAL 기반 replication 구조 확인
---
# Primary와 replica의 역할 분리

읽기 부하가 커졌을 때 replica를 추가하면 DB가 두 개 생기는 것처럼 보일 수 있습니다. 하지만 일반적인 PostgreSQL physical replication에서 **primary가 write의 authoritative source이고 replica는 primary의 WAL을 받아 상태를 따라가는 복제본**입니다.

```text
Client writes
     │
     ▼
  Primary
     │ WAL stream
     ├──────────────► Replica A
     └──────────────► Replica B
                         │
                         └─ read query 가능
```

### replica는 primary와 같은 순간을 보고 있다고 보장되지 않는다

Primary에서 commit이 성공한 직후 WAL이 replica에 도착하고 replay되기까지 시간이 필요할 수 있습니다. 따라서 사용자가 방금 저장한 값을 곧바로 replica에서 읽으면 이전 값을 볼 수 있습니다.

```text
Primary: order status = PAID commit
   │
   ├─ Client success response
   │
   └─ WAL 전송 중...
              │
Replica: 아직 CREATED
```

이 차이를 replication lag라고 합니다.

### read scaling에는 routing 정책이 필요하다

모든 SELECT를 무조건 replica로 보내면 read-after-write가 필요한 화면에서 stale data 문제가 생길 수 있습니다. 다음처럼 요구에 따라 나눌 수 있습니다.

| 조회 종류                      | 후보                               |
| ------------------------------ | ---------------------------------- |
| 방금 수정한 주문 상세          | primary 또는 consistency 보장 경로 |
| 통계·검색 보조 조회            | replica 허용 가능                  |
| 매우 최신성이 중요한 재고 검증 | primary 우선 검토                  |

어떤 read가 stale을 허용할 수 있는지는 product semantics가 결정합니다.

### replica는 backup과 같은 역할이 아니다

Primary에서 실수로 `DELETE`를 commit하면 그 WAL도 replica에 전달되어 삭제가 복제될 수 있습니다. replica는 high availability/read scaling에 유용하지만 사용자 실수나 logical corruption에서 과거 상태를 복원하는 backup/PITR과 다른 기능입니다.

Replication은 서버 수를 늘리는 기술이 아니라 **write source와 복제된 read state 사이의 최신성 계약을 새로 만드는 아키텍처**입니다.

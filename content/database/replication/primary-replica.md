---
kind: concept
contentKey: database.core.replication.primary-replica
topicContentKey: database.core.replication
slug: primary-replica
title: "프라이머리와 리플리카의 역할 분리"
summary: "쓰기 원본인 프라이머리(primary)와 WAL을 따라가는 스탠바이(standby)를 구분하고, 읽기 확장이나 장애 조치에 복제를 사용할 때 리플리카가 독립된 최신 원본이 아니라 지연될 수 있는 복제본임을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/warm-standby.html"
    title: "PostgreSQL Documentation: High Availability, Load Balancing, and Replication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: primary/standby, WAL 스트리밍과 Hot Standby 구조 확인
---
# 프라이머리와 리플리카의 역할 분리

읽기 부하가 커졌을 때 리플리카를 추가하면 DB가 두 개 생기는 것처럼 보일 수 있습니다. PostgreSQL의 물리 스트리밍 복제에서는 **프라이머리(primary)가 쓰기 원본 역할을 맡고, 스탠바이(standby)가 프라이머리에서 생성된 WAL을 받아 복구·재실행하며 상태를 따라갑니다.**

여기서 `standby`와 `read replica`를 완전히 같은 말로 쓰면 경계가 흐려집니다. PostgreSQL 스탠바이가 복구 중 읽기 전용 쿼리를 받으려면 **Hot Standby로 동작하도록 구성되어 있어야** 합니다. 즉 물리 스탠바이는 복제 역할을 나타내고, 그 스탠바이를 읽기 확장에도 사용할지는 별도의 읽기 제공 설정과 운영 정책이 포함된 문제입니다.

```text
Client writes
     │
     ▼
  Primary
     │ WAL stream
     ├──────────────► Standby A
     └──────────────► Hot Standby B
                         │
                         └─ read-only query serving 가능
```

### 스탠바이는 프라이머리와 같은 순간을 보고 있다고 보장되지 않는다

기본 스트리밍 복제는 비동기입니다. 프라이머리에서 커밋이 성공한 직후 WAL이 스탠바이에 도착하고 재실행되기까지 시간이 필요할 수 있습니다. 따라서 사용자가 방금 저장한 값을 곧바로 Hot Standby에서 읽으면 이전 값을 볼 수 있습니다.

```text
Primary: order status = PAID commit
   │
   ├─ Client success response
   │
   └─ WAL 전송/적용 중...
              │
Hot Standby: 아직 CREATED
```

이 차이를 복제 지연(replication lag)의 한 형태로 관측할 수 있습니다.

### 읽기 확장에는 라우팅 정책이 필요하다

모든 SELECT를 무조건 스탠바이로 보내면 쓰기 직후 읽기(read-after-write)가 필요한 화면에서 오래된 데이터가 보일 수 있습니다. 다음처럼 최신성 요구에 따라 나눌 수 있습니다.

| 조회 종류 | 후보 |
| --- | --- |
| 방금 수정한 주문 상세 | 프라이머리 또는 필요한 최신성을 보장하는 경로 |
| 통계·검색 보조 조회 | Hot Standby 허용 가능 |
| 매우 최신성이 중요한 재고 검증 | 프라이머리 우선 검토 |

어떤 조회가 일정 수준의 지연을 허용할 수 있는지는 제품의 사용자 경험과 일관성 요구가 결정합니다.

### 스탠바이는 백업과 같은 역할이 아니다

프라이머리에서 실수로 `DELETE`를 커밋하면 그 WAL도 스탠바이에 전달되어 삭제가 복제될 수 있습니다. 스탠바이는 고가용성과 읽기 확장에 유용하지만 사용자 실수나 논리적 데이터 손상에서 과거 상태를 복원하는 백업/PITR과는 다른 기능입니다.

복제는 서버 수를 늘리는 기술이 아니라 **쓰기 원본과 복제된 읽기 상태 사이에 새로운 최신성·장애 조치 계약을 만드는 아키텍처**입니다.

---
kind: concept
contentKey: database.core.replication.lag
topicContentKey: database.core.replication
slug: lag
title: "Replication lag와 read-after-write"
summary: "WAL 생성·전송·flush·replay 단계 사이 지연이 replica 최신성 차이를 만들고, lag를 단일 시간 숫자로만 보지 않고 사용자 consistency 요구와 함께 해석한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/warm-standby.html#STREAMING-REPLICATION"
    title: "PostgreSQL Documentation: Streaming Replication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: streaming WAL 전송과 standby replay 구조 확인
---
# Replication lag와 read-after-write

Replica가 늦는다고 할 때 단순히 network ping만 떠올리면 부족합니다. Primary에서 WAL이 생성된 뒤 replica가 그 변경을 실제 query에 보이게 하기까지 여러 단계가 있습니다.

```text
Primary
COMMIT
  │
  ├─ WAL generated
  └─ WAL sent ───────────────┐
                             ▼
Replica                  receive
                             │
                           flush
                             │
                           replay
                             │
                             ▼
                     SELECT에서 visible
```

network 지연뿐 아니라 replica CPU/I/O 부족, 긴-running query가 recovery conflict를 만들거나 WAL 생성량이 급증하는 상황도 replay lag를 키울 수 있습니다.

### lag는 사용자 증상으로 나타난다

```text
1. POST /orders/42/cancel
   → primary에서 CANCELLED commit

2. 즉시 GET /orders/42
   → replica routing
   → 아직 PAID 반환
```

사용자는 “취소가 실패했다”고 오해할 수 있습니다. backend가 replica를 도입할 때는 **몇 초의 stale을 허용할 수 있는 endpoint인지** 먼저 정해야 합니다.

### 해결은 replica를 더 빠르게 만드는 것만이 아니다

read-after-write가 필요한 짧은 구간만 primary로 보내거나, session/user 단위로 일정 시간 primary stickiness를 적용하거나, replica replay position이 특정 commit 위치를 따라왔는지 기다리는 방식 등을 검토할 수 있습니다. 각각 latency와 복잡성이 다릅니다.

### lag metric도 위치를 나눠 본다

PostgreSQL은 replication 상태에서 sent/write/flush/replay 위치 차이를 관측할 수 있습니다. “lag 3초” 하나보다 어디에서 밀렸는지 보면 원인을 더 잘 좁힐 수 있습니다.

Replication lag는 단순 인프라 숫자가 아니라 **읽기 consistency가 느슨해졌다는 product-visible 상태**입니다.

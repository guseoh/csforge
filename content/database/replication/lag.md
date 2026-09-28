---
kind: concept
contentKey: database.core.replication.lag
topicContentKey: database.core.replication
slug: lag
title: "복제 지연(Replication lag)과 쓰기 직후 읽기"
summary: "WAL 생성·전송·flush·replay 단계 사이의 지연이 리플리카 최신성 차이를 만들고, 복제 지연을 단일 시간 숫자로만 보지 않고 쓰기 직후 읽기(read-after-write) 같은 사용자 일관성 요구와 함께 해석한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/warm-standby.html#STREAMING-REPLICATION"
    title: "PostgreSQL Documentation: Streaming Replication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: WAL 스트리밍 전송과 스탠바이 재실행 구조 확인
---
# 복제 지연(Replication lag)과 쓰기 직후 읽기

리플리카가 늦는다고 할 때 단순히 네트워크 ping만 떠올리면 부족합니다. 프라이머리에서 WAL이 생성된 뒤 리플리카가 그 변경을 실제 쿼리에서 보이게 하기까지 여러 단계가 있습니다.

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

네트워크 지연뿐 아니라 리플리카의 CPU/I/O 부족, 오래 실행되는 쿼리로 인한 복구 충돌, WAL 생성량 급증도 재실행 지연을 키울 수 있습니다.

### 복제 지연은 사용자 증상으로 나타난다

```text
1. POST /orders/42/cancel
   → primary에서 CANCELLED commit

2. 즉시 GET /orders/42
   → replica routing
   → 아직 PAID 반환
```

사용자는 “취소가 실패했다”고 오해할 수 있습니다. 백엔드가 리플리카를 도입할 때는 **어떤 API가 몇 초 정도의 오래된 읽기를 허용할 수 있는지** 먼저 정해야 합니다.

### 해결은 리플리카를 더 빠르게 만드는 것만이 아니다

쓰기 직후 읽기가 필요한 짧은 구간만 프라이머리로 보내거나, 세션·사용자 단위로 일정 시간 프라이머리를 유지하거나, 리플리카의 재실행 위치가 특정 커밋 위치를 따라왔는지 확인한 뒤 읽게 하는 방식을 검토할 수 있습니다. 각각 지연 시간과 복잡성이 다릅니다.

### 복제 지연 지표도 단계를 나눠 본다

PostgreSQL은 복제 상태에서 sent/write/flush/replay 위치 차이를 관측할 수 있습니다. “지연 3초” 하나만 보는 것보다 어느 단계에서 밀렸는지 확인하면 원인을 더 잘 좁힐 수 있습니다.

복제 지연은 단순한 인프라 숫자가 아니라 **사용자가 보는 읽기 일관성이 느슨해졌다는 상태**입니다.

---
kind: concept
contentKey: database.core.storage.pages-buffer
topicContentKey: database.core.storage
slug: pages-buffer
title: "Page와 shared buffer에서 데이터가 움직이는 방식"
summary: "PostgreSQL이 table/index를 page 단위로 저장·읽고 shared buffer cache에서 page를 재사용하며 dirty page가 나중에 storage로 기록되는 흐름을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/storage-page-layout.html"
    title: "PostgreSQL Documentation: Database Page Layout"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: PostgreSQL page 구조와 기본 page size 확인
  - url: "https://www.postgresql.org/docs/current/runtime-config-resource.html#RUNTIME-CONFIG-RESOURCE-MEMORY"
    title: "PostgreSQL Documentation: Memory"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: shared_buffers와 memory 설정 확인
---
# Page와 shared buffer에서 데이터가 움직이는 방식

SQL에서는 row 단위로 데이터를 다루지만 storage device는 매번 “row 하나”라는 추상 단위로 읽고 쓰지 않습니다. PostgreSQL은 table과 index를 **고정 크기 page(block)** 단위로 관리하며 기본 build에서는 보통 8KB page를 사용합니다.

```text
relation file
┌──────── page 0 ────────┐
│ tuple A │ tuple B │ ...│
├──────── page 1 ────────┤
│ tuple C │ free space   │
└────────────────────────┘
```

### SELECT는 필요한 page를 memory에서 찾는다

단순화한 흐름은 다음과 같습니다.

```text
Executor
   │ page 필요
   ▼
Shared Buffers
   │
   ├─ hit  → memory page 사용
   │
   └─ miss → storage/OS를 통해 page 읽기
```

같은 hot page가 반복 조회되면 memory에서 재사용되어 physical I/O를 줄일 수 있습니다. PostgreSQL 자체의 shared buffer cache뿐 아니라 OS page cache도 전체 I/O 경로에 영향을 줄 수 있으므로 `shared_buffers = DB 전체 memory`처럼 단순하게 잡지 않습니다.

### UPDATE는 page를 dirty하게 만들 수 있다

memory의 page 내용이 storage에 있는 상태와 달라지면 dirty page가 됩니다. transaction commit 때 모든 dirty data page를 즉시 storage에 쓸 필요는 없습니다. durability는 WAL과 결합해 보장하고 data page는 background write/checkpoint 과정에서 나중에 기록될 수 있습니다.

```text
UPDATE
  │
  ├─ WAL record
  └─ shared buffer page 변경 → dirty
                              │
                              └─ 이후 disk write
```

### random page access가 비용을 만든다

index로 후보를 빠르게 찾더라도 table 여러 page를 흩어져 방문하면 buffer miss/I/O가 많이 날 수 있습니다. EXPLAIN BUFFERS에서 shared hit/read를 보는 이유가 query가 실제로 어떤 page를 건드렸는지 이해하기 위해서입니다.

Page 관점을 알면 index-only scan, VACUUM, checkpoint, cache hit 같은 개념이 모두 **row보다 아래의 storage I/O 단위**에서 연결됩니다.

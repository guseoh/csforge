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
  - url: "https://www.postgresql.org/docs/current/sql-explain.html"
    title: "PostgreSQL Documentation: EXPLAIN"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: BUFFERS의 shared hit/read/dirtied/written 의미와 PostgreSQL buffer 관측 경계 확인
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
PostgreSQL Shared Buffers
   │
   ├─ hit  → 이미 shared buffer에 있는 page 사용
   │
   └─ miss → data file block을 shared buffer로 읽어들임
                 │
                 └─ 이 아래에서는 OS page cache가 실제 device I/O를 피할 수도 있음
```

같은 hot page가 반복 조회되면 PostgreSQL shared buffer에서 재사용되어 더 아래 계층의 read를 줄일 수 있습니다. PostgreSQL 자체의 shared buffer cache뿐 아니라 OS page cache도 전체 I/O 경로에 영향을 주므로 `shared_buffers = DB가 쓰는 모든 cache`처럼 단순하게 생각하면 안 됩니다.

### `EXPLAIN (ANALYZE, BUFFERS)`의 `shared read`를 물리 디스크 read와 동일시하지 않는다

`BUFFERS`에서 `shared hit`는 필요한 block이 PostgreSQL cache에 이미 있어 data-file read를 피했다는 뜻입니다. 반면 `shared read`는 **PostgreSQL shared buffer에 없던 shared block을 data file에서 읽어들였다는 관측**입니다. 이 read가 실제 storage device까지 내려갔는지는 이 숫자만으로 확정할 수 없습니다. OS page cache가 해당 file block을 가지고 있었다면 PostgreSQL 관점에서는 `shared read`여도 물리 device access 없이 만족될 수 있습니다.

따라서 query I/O를 분석할 때는 `shared hit/read`만으로 “디스크를 N번 읽었다”고 단정하지 않고, 필요하면 `track_io_timing`, `pg_stat_io`, OS-level I/O 지표까지 계층에 맞게 함께 봅니다.

### UPDATE는 page를 dirty하게 만들 수 있다

memory의 page 내용이 data file에 기록된 상태와 달라지면 dirty page가 됩니다. transaction commit 때 모든 dirty data page를 즉시 storage에 쓸 필요는 없습니다. durability는 WAL과 결합해 보장하고 data page는 background write/checkpoint 과정에서 나중에 기록될 수 있습니다.

```text
UPDATE
  │
  ├─ WAL record
  └─ shared buffer page 변경 → dirty
                              │
                              └─ 이후 data-file write
```

### random page access가 비용을 만든다

index로 후보를 빠르게 찾더라도 table 여러 page를 흩어져 방문하면 PostgreSQL cache miss와 하위 계층 read가 많아질 수 있습니다. 그래서 page-level locality와 buffer usage를 실제 execution plan과 함께 봅니다.

Page 관점을 알면 index-only scan, VACUUM, checkpoint, cache hit 같은 개념이 모두 **row보다 아래의 storage I/O 단위**에서 연결됩니다.

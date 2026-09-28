---
kind: concept
contentKey: database.core.storage.pages-buffer
topicContentKey: database.core.storage
slug: pages-buffer
title: "페이지와 공유 버퍼에서 데이터가 움직이는 방식"
summary: "PostgreSQL이 테이블·인덱스를 페이지 단위로 저장·읽고 공유 버퍼(shared buffer)에서 페이지를 재사용하며 dirty 페이지가 나중에 저장소로 기록되는 흐름을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/storage-page-layout.html"
    title: "PostgreSQL Documentation: Database Page Layout"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: PostgreSQL 페이지 구조와 기본 페이지 크기 확인
  - url: "https://www.postgresql.org/docs/current/runtime-config-resource.html#RUNTIME-CONFIG-RESOURCE-MEMORY"
    title: "PostgreSQL Documentation: Memory"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: shared_buffers와 메모리 설정 확인
  - url: "https://www.postgresql.org/docs/current/sql-explain.html"
    title: "PostgreSQL Documentation: EXPLAIN"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: BUFFERS의 shared hit/read/dirtied/written 의미와 PostgreSQL 버퍼 관측 경계 확인
---
# 페이지와 공유 버퍼에서 데이터가 움직이는 방식

SQL에서는 행 단위로 데이터를 다루지만 저장 장치는 매번 “행 하나”라는 추상 단위로 읽고 쓰지 않습니다. PostgreSQL은 테이블과 인덱스를 **고정 크기 페이지(block)** 단위로 관리하며 기본 빌드에서는 보통 8KB 페이지를 사용합니다.

```text
relation file
┌──────── page 0 ────────┐
│ tuple A │ tuple B │ ...│
├──────── page 1 ────────┤
│ tuple C │ free space   │
└────────────────────────┘
```

### SELECT는 필요한 페이지를 메모리에서 찾는다

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

같은 자주 사용하는 페이지가 반복 조회되면 PostgreSQL 공유 버퍼에서 재사용되어 더 아래 계층의 읽기를 줄일 수 있습니다. PostgreSQL 자체의 공유 버퍼뿐 아니라 OS 페이지 캐시도 전체 I/O 경로에 영향을 주므로 `shared_buffers = DB가 쓰는 모든 캐시`처럼 단순하게 생각하면 안 됩니다.

### `EXPLAIN (ANALYZE, BUFFERS)`의 `shared read`를 물리 디스크 읽기와 동일시하지 않는다

`BUFFERS`에서 `shared hit`는 필요한 블록이 PostgreSQL 캐시에 이미 있어 데이터 파일 읽기를 피했다는 뜻입니다. 반면 `shared read`는 **PostgreSQL 공유 버퍼에 없던 공유 블록을 데이터 파일에서 읽어들였다는 관측**입니다. 이 읽기가 실제 저장 장치까지 내려갔는지는 이 숫자만으로 확정할 수 없습니다. OS 페이지 캐시가 해당 파일 블록을 가지고 있었다면 PostgreSQL 관점에서는 `shared read`여도 물리 장치 접근 없이 만족될 수 있습니다.

따라서 쿼리 I/O를 분석할 때는 `shared hit/read`만으로 “디스크를 N번 읽었다”고 단정하지 않고, 필요하면 `track_io_timing`, `pg_stat_io`, OS 수준 I/O 지표까지 계층에 맞게 함께 봅니다.

### UPDATE는 페이지를 dirty 상태로 만들 수 있다

메모리의 페이지 내용이 데이터 파일에 기록된 상태와 달라지면 dirty 페이지가 됩니다. 트랜잭션 커밋 때 모든 dirty 데이터 페이지를 즉시 저장소에 쓸 필요는 없습니다. 내구성은 WAL과 결합해 보장하고 데이터 페이지는 백그라운드 쓰기나 체크포인트 과정에서 나중에 기록될 수 있습니다.

```text
UPDATE
  │
  ├─ WAL record
  └─ shared buffer page 변경 → dirty
                              │
                              └─ 이후 data-file write
```

### 흩어진 페이지 접근이 비용을 만든다

인덱스로 후보를 빠르게 찾더라도 테이블 여러 페이지를 흩어져 방문하면 PostgreSQL 캐시 미스와 하위 계층 읽기가 많아질 수 있습니다. 그래서 페이지 수준 지역성과 버퍼 사용량을 실제 실행 계획과 함께 봅니다.

페이지 관점을 알면 Index-only scan, VACUUM, 체크포인트, 캐시 적중 같은 개념이 모두 **행보다 아래의 저장소 I/O 단위**에서 연결됩니다.

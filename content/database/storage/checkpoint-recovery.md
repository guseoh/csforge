---
kind: concept
contentKey: database.core.storage.checkpoint-recovery
topicContentKey: database.core.storage
slug: checkpoint-recovery
title: "체크포인트와 장애 복구 범위"
summary: "체크포인트가 dirty 버퍼를 저장소로 기록해 복구 시작점을 전진시키는 이유와 너무 잦은 체크포인트의 I/O 집중, 너무 드문 체크포인트의 WAL·복구 시간 trade-off를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/wal-configuration.html"
    title: "PostgreSQL Documentation: WAL Configuration"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 체크포인트, checkpoint_timeout, max_wal_size와 복구 관련 설정 확인
---
# 체크포인트와 장애 복구 범위

WAL 덕분에 dirty 데이터 페이지를 커밋마다 즉시 저장소에 쓸 필요는 없지만 영원히 WAL만 쌓을 수는 없습니다. 체크포인트는 **그 체크포인트가 보장하는 redo point 이전 변경이 데이터 파일에 반영되도록 dirty 페이지를 기록하고, 장애 복구가 WAL을 다시 적용해야 하는 기준점을 앞으로 이동**시키는 과정입니다.

### 장애 복구는 체크포인트가 가리키는 redo point부터 필요한 WAL을 다시 적용한다

```text
Checkpoint record
      │
      └─ redo point
            │
            ├──── WAL record A
            ├──── WAL record B
            ├──── WAL record C
            │
            X crash

restart
  └─ redo point부터 필요한 WAL을 재적용해 consistent state 복구
```

체크포인트가 너무 오래 전이면 장애 뒤 더 많은 WAL을 재처리해야 하고 복구 시간이 길어질 수 있습니다.

### 체크포인트를 자주 하면 항상 좋은 것도 아니다

체크포인트 때 dirty 페이지 쓰기가 몰리면 저장소 I/O가 증가해 정상 쿼리의 지연 시간에 영향을 줄 수 있습니다. PostgreSQL은 체크포인트 쓰기를 시간에 걸쳐 분산하려고 하지만 설정과 작업 부하에 따라 부담이 커질 수 있습니다.

| checkpoint 경향 | 장점 | 비용 |
| --- | --- | --- |
| 너무 잦음 | 복구에서 다시 처리할 WAL 범위를 줄일 수 있음 | dirty-page write 증가, `full_page_writes` 사용 시 full-page WAL 증가 가능 |
| 너무 드묾 | checkpoint write 빈도 감소 | WAL 증가와 crash recovery 작업량 증가 가능 |

### `max_wal_size`는 WAL 사용량의 절대 상한이 아니다

`max_wal_size`는 체크포인트 일정에 영향을 주는 soft limit 성격의 설정입니다. replication slot, archive 실패, 오래 걸리는 백업 같은 다른 보존 이유가 있으면 실제 `pg_wal` 사용량이 이를 넘을 수 있습니다. 따라서 “이 값만 설정하면 WAL 디스크 사용량이 반드시 그 아래로 제한된다”고 이해하면 안 됩니다.

### 체크포인트 지표 이름은 PostgreSQL 버전을 확인한다

이 curriculum의 baseline은 PostgreSQL 16+이므로 특정 버전의 통계 컬럼 이름을 영구적인 계약처럼 쓰지 않습니다. PostgreSQL 16에서는 `pg_stat_bgwriter.checkpoints_timed`, `checkpoints_req`, `checkpoint_write_time` 같은 체크포인트 통계를 제공하지만, 최신 PostgreSQL에서는 checkpointer 통계가 별도 `pg_stat_checkpointer`로 분리되고 `num_timed`, `num_requested` 같은 이름을 사용합니다. 운영에서는 **현재 서버 버전의 모니터링 뷰와 컬럼을 확인한 뒤** 체크포인트 횟수·write/sync time·WAL 양을 함께 봅니다.

### 체크포인트가 백업과 같은 것은 아니다

체크포인트가 성공했다고 저장 매체 실패에서 데이터를 복구할 별도 백업이 생긴 것은 아닙니다. WAL/장애 복구는 **데이터베이스 프로세스나 호스트 장애 뒤 기존 저장소의 일관된 상태를 복구하는 메커니즘**이고, 저장소 자체 유실·사용자 실수·원하는 시점 복구에는 백업과 WAL archive/PITR 같은 별도 복구 설계가 필요합니다.

체크포인트는 단순 주기 작업이 아니라 **평상시 쓰기 I/O와 장애 후 복구 작업량 사이의 비용을 조절하는 운영 메커니즘**입니다.

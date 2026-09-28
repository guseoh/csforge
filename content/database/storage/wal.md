---
kind: concept
contentKey: database.core.storage.wal
topicContentKey: database.core.storage
slug: wal
title: "WAL과 선행 기록(write-ahead) 원리"
summary: "변경된 데이터 페이지를 먼저 영구 저장하는 대신 복구에 필요한 WAL 레코드를 선행 기록해 장애 뒤 재실행(REDO)할 수 있게 하는 write-ahead logging과 커밋 내구성의 관계를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/wal-intro.html"
    title: "PostgreSQL Documentation: WAL Introduction"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: WAL 레코드 선행 기록과 장애 복구 원리 확인
---
# WAL과 선행 기록(write-ahead) 원리

DB가 트랜잭션을 커밋할 때마다 변경된 모든 테이블 페이지를 저장소에 즉시 기록해야 한다면 임의 I/O가 많아지고 커밋 지연 시간이 커질 수 있습니다. PostgreSQL은 WAL(Write-Ahead Log)을 사용해 **데이터 페이지보다 복구에 필요한 로그 레코드를 먼저 안전하게 기록**합니다.

### write-ahead의 핵심 순서

```text
UPDATE row
   │
   ├─ memory page 변경 (dirty)
   │
   └─ WAL record 생성
          │
          ▼
      WAL을 먼저 durable하게 기록
          │
          ▼
      COMMIT 성공 가능
          │
          └─ data page는 이후 checkpoint/background write에서 기록 가능
```

장애가 데이터 페이지 쓰기 전에 발생해도 필요한 WAL 레코드가 내구성 경계를 통과했다면 재시작 복구에서 페이지 변경을 재실행할 수 있습니다. 이 물리적인 WAL 재실행과 트랜잭션의 커밋·중단 상태 및 MVCC 가시성 판정은 같은 개념이 아닙니다.

### WAL은 undo log와 같은 말이 아니다

PostgreSQL MVCC 롤백을 단순히 WAL을 거꾸로 적용해 모든 변경을 되돌리는 모델로 설명하면 부정확합니다. WAL의 핵심 목적은 장애 복구와 복제 등에 필요한 REDO 정보를 제공하는 것이며, 트랜잭션 중단 후의 가시성은 MVCC 튜플 상태와 함께 동작합니다.

### 커밋 성공과 내구성 설정의 관계

기본적인 synchronous commit 설정에서는 트랜잭션의 커밋 레코드가 로컬 WAL에 flush될 때까지 기다린 뒤 성공을 반환하는 것이 내구성의 핵심입니다. 하지만 `synchronous_commit` 같은 설정으로 일부 내구성과 지연 시간의 trade-off를 바꿀 수 있으므로 “PostgreSQL 커밋은 모든 환경에서 정확히 같은 저장소 flush 의미를 갖는다”고 일반화하면 안 됩니다.

### WAL이 많아지는 작업 부하도 비용이 있다

대량 UPDATE, 인덱스 변경, full-page image 등은 WAL 양을 늘릴 수 있습니다. 복제는 WAL 스트림을 사용하므로 WAL 생성량 증가는 네트워크 사용량과 리플리카 지연에도 연결될 수 있습니다.

WAL을 이해하는 핵심은 파일 이름이 아니라 **데이터 페이지 쓰기와 커밋 내구성을 분리하고, 먼저 기록한 순차 로그를 이용해 장애 뒤 필요한 물리 변경을 재구성한다**는 순서입니다.

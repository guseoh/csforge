---
kind: concept
contentKey: database.core.mvcc.visibility
topicContentKey: database.core.mvcc
slug: visibility
title: "스냅샷 가시성을 시간 흐름으로 추론하기"
summary: "스냅샷이 단순한 테이블 복사본이 아니라 어떤 트랜잭션의 변경이 현재 SQL 문에 보이는지 판단하는 기준이라는 점을 이해하고 READ COMMITTED와 REPEATABLE READ의 스냅샷 유지 범위 차이를 추론한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/mvcc.html"
    title: "PostgreSQL Documentation: Concurrency Control"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: MVCC 스냅샷과 격리 수준 전반 확인
  - url: "https://www.postgresql.org/docs/current/sql-set-transaction.html"
    title: "PostgreSQL Documentation: SET TRANSACTION"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: READ COMMITTED와 REPEATABLE READ의 스냅샷 기준 시점 확인
---
# 스냅샷 가시성을 시간 흐름으로 추론하기

스냅샷을 “그 순간 테이블을 통째로 복사한 것”이라고 이해할 필요는 없습니다. PostgreSQL에서 스냅샷은 현재 쿼리가 **어떤 트랜잭션의 결과를 보이는 것으로 판단할지** 정하는 기준입니다. 실제 행 버전은 테이블에 공존하고 가시성 규칙이 읽을 버전을 선택합니다.

### READ COMMITTED에서는 SQL 문마다 기준이 바뀔 수 있다

```text
T1                                     T2
──────────────────────────────────     ─────────────────────────
BEGIN
SELECT price → 10,000
  └─ statement snapshot S1
                                       UPDATE price=12,000
                                       COMMIT
SELECT price → 12,000
  └─ 새 statement snapshot S2
COMMIT
```

T1은 하나의 트랜잭션이지만 두 SQL 문이 서로 다른 스냅샷을 사용할 수 있으므로 두 번째 SELECT는 그 사이 완료된 커밋을 볼 수 있습니다.

### REPEATABLE READ에서는 첫 쿼리 시점의 스냅샷을 유지한다

PostgreSQL `REPEATABLE READ`에서 트랜잭션 스냅샷이 `BEGIN` 명령 자체와 동시에 고정된다고 생각하면 안 됩니다. 공식 계약상 **첫 쿼리 또는 데이터 변경 SQL 문이 실행될 때** 스냅샷 기준이 정해지고, 이후 트랜잭션의 SQL 문들이 그 기준을 유지합니다.

```text
T1                                     T2
──────────────────────────────────     ─────────────────────────
BEGIN ISOLATION LEVEL REPEATABLE READ
                                       UPDATE price=12,000
                                       COMMIT
SELECT price → 12,000
  └─ 여기서 transaction snapshot S1 확정
                                       UPDATE price=15,000
                                       COMMIT
SELECT price → 12,000  ← S1 기준
COMMIT
```

즉 `BEGIN`과 첫 SELECT 사이에 다른 트랜잭션이 커밋했다면 그 변경은 첫 스냅샷에 포함될 수 있습니다. 반면 첫 쿼리로 스냅샷이 정해진 뒤의 동시 커밋은 같은 REPEATABLE READ 트랜잭션의 후속 일반 SELECT에서 보이지 않습니다.

PostgreSQL REPEATABLE READ는 SQL 표준이 이 격리 수준에 최소한으로 요구하는 것보다 강하게 phantom read도 허용하지 않는 구현 특성이 있습니다. 다른 DBMS의 같은 이름 격리 수준과 세부 동작을 기계적으로 동일시하면 안 됩니다.

### PostgreSQL의 xmin·xmax와 커밋 상태를 함께 읽는다

PostgreSQL의 일반적인 heap tuple(행 버전)에는 이를 만든 트랜잭션의 ID인 `xmin`이 있고, 그 버전의 삭제·교체 등에 관계된 `xmax`도 있습니다. `UPDATE`는 기존 버전의 값을 그 자리에서 단순 덮어쓰기보다 **기존 버전을 더 이상 쓰지 않도록 표시하고 새 버전을 생성하는 방식**으로 이해하면 됩니다. 하지만 실제 읽기 가시성은 숫자 두 개만 비교하는 것이 아니라 **스냅샷에 기록된 진행 중 트랜잭션과 각 트랜잭션의 커밋/중단 상태**도 확인해야 합니다.

```text
행 id=1, price=10,000        old tuple: xmin=T10, xmax=없음
                                   │
                            T20 UPDATE price=12,000
                                   │
            old tuple: xmin=T10, xmax=T20
            new tuple: xmin=T20, xmax=없음

T20 미커밋   → T20 이전 버전을 볼 수 있던 다른 트랜잭션은 보통 old(10,000)
T20 COMMIT   → 이후 새 스냅샷 S2에서는 new(12,000)
S1이 T20 이전부터 유지된 REPEATABLE READ 스냅샷이라면 → old(10,000)
T20 ROLLBACK → new는 유효한 커밋 버전이 아니며 old가 계속 보임
```

위 표는 **다른 트랜잭션의 일반 SELECT**를 단순화한 것입니다. 변경한 T20 자신의 후속 읽기는 미커밋 상태라도 자신의 변경을 볼 수 있습니다. 또한 `xmax`는 삭제·갱신뿐 아니라 행 잠금 또는 다중 트랜잭션 잠금(MultiXact) 정보로도 사용되므로 **`xmax != 0`이면 반드시 삭제됐다고 판단하면 안 됩니다.** 실제 구현은 hint bit 등 다른 메타데이터와 상태도 사용합니다. 이 때문에 트랜잭션 ID의 단순 대소나 `xmin`/`xmax`의 값만으로 가시성을 계산하는 암기법은 위험합니다. [PostgreSQL heap page layout 문서](https://www.postgresql.org/docs/current/storage-page-layout.html)는 tuple header 위치와 생성/무효화 트랜잭션 필드를 설명합니다.

### 가시성과 최신성은 trade-off가 있다

오래 유지되는 스냅샷은 여러 쿼리가 같은 시점 기준으로 일관된 데이터를 보게 해주지만, 다른 트랜잭션의 최신 커밋을 즉시 반영하지 않습니다. 리포트처럼 일관된 스냅샷이 중요한 작업에는 유리하지만 “방금 다른 요청이 수정한 최신 상태”를 계속 봐야 하는 흐름에는 기대와 다를 수 있습니다.

### 스냅샷이 오래 살아 있으면 정리에도 영향을 준다

오래된 스냅샷이 아직 특정한 오래된 행 버전을 볼 수 있다면 VACUUM은 그 버전을 다른 모든 트랜잭션에 불필요하다고 단정할 수 없습니다. 따라서 오래 실행되는 트랜잭션은 단순히 연결 하나의 문제가 아니라 **dead tuple 회수와 테이블 팽창에도 영향을 줄 수 있습니다.**

스냅샷 가시성을 이해하는 가장 좋은 방법은 격리 수준 이름을 외우는 것이 아니라 시간 흐름에 **스냅샷이 실제로 확정되는 SQL 문, 다른 트랜잭션의 커밋 시점, 내가 읽은 버전**을 함께 표시하는 것입니다.

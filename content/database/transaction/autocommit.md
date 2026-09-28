---
kind: concept
contentKey: database.core.transaction.autocommit
topicContentKey: database.core.transaction
slug: autocommit
title: "자동 커밋(Autocommit)과 트랜잭션 경계"
summary: "명시적 BEGIN이 없어도 각 SQL 문이 트랜잭션 안에서 실행되는 PostgreSQL 동작을 이해하고, 여러 SQL 문을 하나의 원자적 경계로 묶어야 하는 경우를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/tutorial-transactions.html"
    title: "PostgreSQL Documentation: Transactions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: SQL 문별 암시적 트랜잭션과 트랜잭션 블록 확인
---
# 자동 커밋(Autocommit)과 트랜잭션 경계

`BEGIN`을 쓰지 않았으니 트랜잭션이 없다고 생각하면 안 됩니다. PostgreSQL은 **모든 SQL 문을 트랜잭션 안에서 실행**합니다. 명시적인 `BEGIN`이 없는 SQL 문은 서버 관점에서 암시적 트랜잭션으로 실행되고, 성공하면 문장 끝에서 커밋되는 것처럼 동작합니다. PostgreSQL 문서도 이 동작을 흔히 autocommit이라고 부릅니다.

다만 애플리케이션에서 보는 `autocommit` 설정은 JDBC 드라이버, 클라이언트 라이브러리, SQL 도구 같은 **클라이언트 계층의 트랜잭션 제어 정책**일 수 있습니다. 클라이언트가 여러 SQL 문 앞에 `BEGIN`을 자동으로 열거나 연결의 트랜잭션 모드를 제어할 수 있으므로, “PostgreSQL 서버의 암시적 SQL 문 트랜잭션”과 “JDBC/클라이언트의 autocommit 옵션”을 같은 설정 하나로 생각하지 않습니다.

```sql
UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;
```

두 SQL 문이 각각 별도 트랜잭션으로 커밋되면 첫 번째 UPDATE가 성공한 뒤 프로세스가 죽었을 때 돈이 빠져나가기만 한 상태가 남을 수 있습니다.

### 여러 SQL 문이 하나의 업무 상태 전이라면 경계를 묶는다

```sql
BEGIN;
UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

```text
statement 1 ─┐
             ├─ 하나의 transaction → COMMIT 또는 ROLLBACK
statement 2 ─┘
```

### 트랜잭션을 크게 잡을수록 좋은 것도 아니다

```text
BEGIN
  ├─ SELECT/UPDATE
  ├─ 외부 API 8초 대기
  ├─ 추가 UPDATE
  └─ COMMIT
```

이렇게 오래 열린 트랜잭션은 DB 연결을 오래 점유하고 잠금이나 오래된 스냅샷을 유지해 다른 작업과 충돌할 수 있습니다. DB 원자성이 필요한 쓰기 범위와 외부 I/O를 분리할 수 있는지 검토해야 합니다.

### 프레임워크 트랜잭션도 결국 DB 경계로 내려간다

Spring `@Transactional`을 사용하면 Java 코드에서 BEGIN/COMMIT을 직접 쓰지 않더라도 트랜잭션 관리자가 연결의 트랜잭션을 관리합니다. 그래서 프레임워크 애노테이션과 DB 트랜잭션을 별개 세계로 외우기보다 **애플리케이션 유스케이스 경계가 JDBC 연결과 DB COMMIT/ROLLBACK으로 어떻게 연결되는지** 이해해야 합니다.

자동 커밋의 핵심은 설정 이름이 아니라 **현재 SQL 문들이 실제로 같은 커밋/롤백 경계에 속하는지**를 클라이언트와 DB 양쪽에서 추적하는 것입니다.

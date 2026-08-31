---
kind: concept
contentKey: database.core.transaction.autocommit
topicContentKey: database.core.transaction
slug: autocommit
title: "Autocommit과 transaction 경계"
summary: "명시적 BEGIN이 없어도 각 statement가 transaction 안에서 실행되는 PostgreSQL 동작을 이해하고 여러 statement를 하나의 원자 경계로 묶어야 하는 경우를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/tutorial-transactions.html"
    title: "PostgreSQL Documentation: Transactions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: statement별 implicit transaction과 transaction block 확인
---
# Autocommit과 transaction 경계

`BEGIN`을 쓰지 않았으니 transaction이 없다고 생각하면 안 됩니다. PostgreSQL에서 각 SQL statement는 transaction 안에서 실행됩니다. 명시적 transaction block이 없으면 client/tool의 autocommit 동작에 따라 각 statement가 독립적으로 commit되는 형태가 일반적입니다.

```sql
UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;
```

두 statement가 각각 별도 commit되면 첫 번째 UPDATE가 성공한 뒤 프로세스가 죽었을 때 돈이 빠져나가기만 한 상태가 남을 수 있습니다.

### 여러 statement가 하나의 business transition이면 경계를 묶는다

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

### transaction을 크게 잡을수록 좋은 것도 아니다

```text
BEGIN
  ├─ SELECT/UPDATE
  ├─ 외부 API 8초 대기
  ├─ 추가 UPDATE
  └─ COMMIT
```

이렇게 오래 열린 transaction은 connection을 오래 점유하고 lock/old snapshot을 유지하며 다른 작업과 충돌할 수 있습니다. DB atomicity가 필요한 write 범위와 외부 I/O를 분리할 수 있는지 검토해야 합니다.

### framework transaction도 결국 DB 경계로 내려간다

Spring `@Transactional`을 사용하면 Java 코드에서 BEGIN/COMMIT을 직접 쓰지 않더라도 transaction manager가 connection transaction을 관리합니다. 그래서 framework annotation과 DB transaction을 별개 세계로 외우기보다 **application use-case 경계가 JDBC connection과 DB COMMIT/ROLLBACK으로 어떻게 연결되는지** 이해해야 합니다.

Autocommit의 핵심은 설정 이름이 아니라 **현재 statement들이 같은 atomic boundary에 속하는지**를 코드와 DB 양쪽에서 추적하는 것입니다.

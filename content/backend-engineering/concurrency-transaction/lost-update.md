---
kind: concept
contentKey: backend.core.concurrency-transaction.lost-update
topicContentKey: backend.core.concurrency-transaction
slug: lost-update
title: "Lost Update와 동시 수정"
summary: "두 요청이 같은 이전 상태를 읽고 각각 계산한 값을 저장하면서 한 변경이 사라지는 lost update를 재현하고, 변경 형태에 따라 atomic SQL·optimistic version·pessimistic lock을 선택한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
- url: https://www.postgresql.org/docs/current/transaction-iso.html
  title: "PostgreSQL Documentation: Transaction Isolation"
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: 동시 transaction과 READ COMMITTED의 concurrent UPDATE 동작 확인
---
# Lost Update와 동시 수정

동시성 문제를 "요청이 동시에 들어왔다"라고만 설명하면 어떤 보호 수단이 필요한지 판단하기 어렵습니다. Lost update는 **두 작업이 같은 이전 상태를 읽고 각자 계산한 결과를 저장하면서, 나중 write가 먼저 반영된 변경을 덮어쓰는 문제**입니다.

조회수의 초기값이 100이라고 해 보겠습니다.

```java
Post post = repository.findById(id).orElseThrow();
post.changeViewCount(post.getViewCount() + 1);
```

두 요청이 겹치면 다음 순서가 가능합니다.

```text
T1: READ  100
T2: READ  100
T1: 계산  101
T2: 계산  101
T1: WRITE 101
T2: WRITE 101

두 요청은 성공했지만 최종값은 102가 아니라 101
```

문제는 Java 연산 자체가 느려서가 아니라 **읽기와 계산과 쓰기가 하나의 원자적인 상태 전이가 아니었다는 것**입니다.

### 단순 증감이라면 DB가 현재 값을 기준으로 바꾸게 할 수 있다

```sql
UPDATE post
SET view_count = view_count + 1
WHERE id = :id;
```

이 방식은 애플리케이션이 먼저 100을 읽어 101이라는 절대값을 만들어 저장하는 대신, DB가 UPDATE 시점의 현재 row 값을 기준으로 증감합니다. 단순 counter나 quota처럼 작은 상태 전이는 이런 atomic SQL이 가장 직접적인 해결책일 수 있습니다.

### 객체 상태를 읽고 판단해야 한다면 충돌을 어떻게 처리할지 정한다

사용자가 주문 정보를 편집하는 것처럼 여러 값을 읽고 변경해야 한다면 version을 비교해 stale write를 감지하는 optimistic 방식이 잘 맞을 수 있습니다.

```text
T1 reads version 7
T2 reads version 7
T1 writes with expected version 7 → success, version 8
T2 writes with expected version 7 → conflict
```

반대로 충돌이 매우 잦고 작업을 다시 수행하는 비용이 크며, 읽은 상태를 사용하는 동안 다른 writer를 기다리게 해야 한다면 pessimistic lock을 검토할 수 있습니다.

### `@Transactional`만 붙였다고 모든 Lost Update가 사라지는 것은 아니다

각 요청이 각각 transaction 안에서 실행되더라도 isolation level과 실제 SQL 모양에 따라 두 요청이 같은 이전 값을 기반으로 작업할 수 있습니다. Transaction은 commit/rollback 경계를 제공하지만 **애플리케이션의 모든 read-modify-write를 자동으로 하나씩 직렬 실행해 주는 기능은 아닙니다.**

그래서 동시 수정 문제는 다음 순서로 보는 편이 좋습니다.

| 변경 형태 | 먼저 검토할 수단 |
| --- | --- |
| 단순 증가·감소·조건부 상태 변경 | atomic conditional SQL |
| 충돌이 드문 편집, stale write 감지 필요 | optimistic version |
| 충돌이 잦고 기다려서 순서를 보장해야 함 | pessimistic lock |
| 값 자체의 유일성 | DB UNIQUE constraint |

Backend Engineering에서 중요한 것은 "동시성 문제면 lock"이라는 처방이 아니라 **어떤 상태를 읽고 어떤 write가 서로 덮어쓸 수 있는지 먼저 재현한 뒤 가장 작은 보호 수단을 선택하는 것**입니다. Isolation level과 row lock의 DB 내부 동작은 Database 영역에서 더 깊게 다룹니다.

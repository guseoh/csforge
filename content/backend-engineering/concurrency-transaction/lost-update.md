---
kind: concept
contentKey: backend.core.concurrency-transaction.lost-update
topicContentKey: backend.core.concurrency-transaction
slug: lost-update
title: lost update
summary: 두 요청의 read-modify-write가 충돌해 늦은 write가 앞선 변경을 덮어쓰는 현상과 해결 전략을 비교한다.
level: 2
status: PUBLISHED
displayOrder: 10
references:
- url: https://www.postgresql.org/docs/current/transaction-iso.html
  title: 'PostgreSQL: Transaction Isolation'
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: 동시 transaction과 isolation 동작 확인
---
# lost update

Lost update는 두 요청이 같은 값을 읽고 각각 계산한 뒤 마지막 write가 앞선 변경을 덮어쓰는 현상입니다. 단순히 “동시성 때문에 값이 틀린다”가 아니라 **read-modify-write가 하나의 원자 operation이 아닐 때** 생깁니다.

### 조회수를 올리는 코드를 생각해 보기

```java
Post post = repository.findById(id).orElseThrow();
post.changeViewCount(post.getViewCount() + 1);
```

초기값이 100일 때:

```text
T1: READ  100
T2: READ  100
T1: WRITE 101
T2: WRITE 101   ← T1 증가가 사라짐
```

두 요청이 성공했는데 결과는 102가 아니라 101입니다.

### 해결 전략은 invariant에 따라 다르다

단순 증가라면 DB atomic update가 가장 직접적일 수 있습니다.

```sql
UPDATE post
SET view_count = view_count + 1
WHERE id = :id;
```

복잡한 객체 상태를 사용자가 수정하는 경우에는 version column을 이용한 optimistic locking이 더 적절할 수 있습니다.

### transaction만 붙이면 해결되는가

각 요청이 transaction 안에 있어도 기본 isolation에서 둘 다 같은 기존 값을 읽고 덮어쓸 수 있습니다. Transaction은 여러 statement의 경계를 제공하지만 모든 race를 자동으로 직렬화하지 않습니다.

### pessimistic lock의 선택

`SELECT ... FOR UPDATE`로 먼저 row lock을 잡으면 직렬화할 수 있지만 대기 시간이 늘고 lock ordering에 따라 deadlock 위험도 생깁니다.

| 전략               | 장점                    | 비용                          |
| ------------------ | ----------------------- | ----------------------------- |
| atomic SQL         | 단순 counter에 효율적   | 복잡한 rule 표현 어려움       |
| optimistic version | 충돌이 드문 수정에 좋음 | conflict 처리 필요            |
| pessimistic lock   | 충돌을 앞에서 직렬화    | wait/deadlock/throughput 비용 |

“동시성 문제 = lock”으로 바로 가지 않고 실제 변경 형태를 먼저 봅니다.

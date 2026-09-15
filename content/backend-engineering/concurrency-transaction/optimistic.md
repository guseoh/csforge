---
kind: concept
contentKey: backend.core.concurrency-transaction.optimistic
topicContentKey: backend.core.concurrency-transaction
slug: optimistic
title: "Optimistic Version과 충돌 처리"
summary: "읽을 때 본 version을 write 조건에 포함해 stale write를 감지하고, 충돌 감지 이후 재시도·거절·merge 같은 해결 정책은 use case가 별도로 결정한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
- url: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/version
  title: "Jakarta Persistence 3.2 API: Version"
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: entity version field를 사용해 optimistic lock failure를 감지하는 표준 계약 확인
---
# Optimistic Version과 충돌 처리

Optimistic concurrency control은 다른 요청을 미리 기다리게 하지 않습니다. 대신 **내가 읽은 상태가 write 시점에도 여전히 최신인지 확인하고, 달라졌다면 stale write를 실패시키는 방식**입니다.

주문을 읽었을 때 version이 7이었다고 해 보겠습니다.

```text
Order(id=42, status=PAID, version=7)
```

저장할 때 현재 DB row가 여전히 version 7인지 조건에 포함할 수 있습니다.

```sql
UPDATE orders
SET status = 'CANCELLED',
    version = 8
WHERE id = 42
  AND version = 7;
```

두 사용자가 같은 version을 읽었다면 먼저 성공한 write가 version을 8로 바꾸고, 뒤의 write는 `version = 7` 조건을 만족하지 못합니다.

```text
T1 reads v7
T2 reads v7
T1 update where v7 → success, v8
T2 update where v7 → 0 rows
```

### JPA의 `@Version`도 같은 문제를 해결한다

Jakarta Persistence의 `@Version`은 엔티티의 revision을 나타내는 field/property를 선언하고, 읽은 뒤 DB의 version이 달라졌다면 optimistic lock failure를 감지하는 표준 계약을 제공합니다.

```java
@Entity
class Order {
    @Id
    private Long id;

    @Version
    private long version;
}
```

직접 조건부 UPDATE를 작성하든 JPA의 version 기능을 사용하든 핵심은 같습니다. **읽은 상태를 아무 조건 없이 마지막 write로 덮어쓰지 않고, 예상했던 revision이 아직 유효한지 검증한다**는 것입니다.

### 충돌 감지와 충돌 해결은 다른 책임이다

Optimistic version은 stale write를 알아내지만 이후 무엇을 해야 하는지는 결정하지 않습니다.

```text
version conflict
   ├─ 최신 데이터를 다시 보여 주고 사용자가 재편집
   ├─ 안전한 operation이면 제한적으로 retry
   ├─ 두 변경을 merge할 수 있다면 병합 정책 적용
   └─ 현재 상태에서는 작업 불가라면 conflict 반환
```

사용자가 입력한 값을 자동으로 다시 적용한다고 business 의미가 항상 보존되는 것은 아닙니다. 예를 들어 재고 구매를 무조건 자동 retry하면 사용자가 보았던 가격·재고 상태와 다른 시점에 구매가 성공할 수 있습니다.

### `0 rows updated`만으로 원인을 과장하지 않는다

직접 조건부 UPDATE를 구현했다면 영향받은 row가 0이라는 것은 **전체 predicate를 만족한 row가 없었다**는 뜻입니다. version이 바뀌었을 수도 있지만 row가 삭제되었거나 다른 조건이 맞지 않았을 수도 있습니다.

애플리케이션이 `404 Not Found`와 `409 Conflict`를 구분해야 한다면 persistence 계약도 그 차이를 설명할 수 있게 설계해야 합니다. 단순 affected-row count를 모든 실패 의미로 과도하게 사용하지 않는 것이 중요합니다.

Optimistic 방식은 충돌이 드물고 기다림보다 명시적인 conflict 처리가 적합한 편집·관리 기능에 잘 맞습니다. 반대로 hot counter처럼 거의 모든 요청이 충돌한다면 atomic SQL이나 다른 상태 모델이 더 단순할 수 있습니다.

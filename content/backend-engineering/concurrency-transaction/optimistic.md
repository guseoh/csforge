---
kind: concept
contentKey: backend.core.concurrency-transaction.optimistic
topicContentKey: backend.core.concurrency-transaction
slug: optimistic
title: optimistic version
summary: write 시점에 읽었던 version이 아직 최신인지 비교해 stale write를 감지하고 충돌 해결은 use-case가 결정한다.
level: 2
status: PUBLISHED
displayOrder: 20
references: []
---
# optimistic version

Optimistic locking은 요청을 미리 막지 않고 **write 시점에 내가 읽은 version이 아직 최신인지 비교하여 충돌을 감지**합니다. 충돌이 드물다는 가정에서 lock wait 없이 동시 작업을 허용할 수 있습니다.

### compare-and-update

```text
읽을 때
Order(id=42, status=PAID, version=7)

수정할 때
UPDATE orders
SET status = 'CANCELLED',
    version = 8
WHERE id = 42
  AND version = 7;
```

영향받은 row가 0이면 다른 transaction이 version을 먼저 바꿨다는 뜻입니다.

### 충돌 감지와 충돌 해결은 다르다

```text
T1 reads v7
T2 reads v7
T1 updates → v8 success
T2 updates WHERE v7 → 0 rows → conflict
```

Optimistic locking은 누가 이긴다를 자동 결정하지 않습니다. 실패한 요청을 retry할지, 사용자에게 최신 데이터를 보여줄지, merge할지를 use-case가 선택해야 합니다.

### 무조건 자동 retry하면 위험하다

사용자가 입력한 상태를 다시 읽어 덮어쓰는 것이 business 의미를 보존하지 않을 수 있습니다. “재고 1개 구매” 충돌을 자동 retry하면 사용자가 예상하지 않은 시점에 구매가 성공할 수 있습니다.

### version field를 API에 노출할 수도 있다

HTTP에서는 ETag/If-Match처럼 representation version을 조건부 요청에 활용할 수 있습니다. 내부 JPA `@Version`과 API version token을 반드시 같은 값으로 해야 하는 것은 아니지만 둘 다 stale write를 막는 문제를 풉니다.

### 언제 잘 맞나

충돌은 드물고 read가 많으며, 기다리게 하기보다 conflict를 명시적으로 처리할 수 있는 편집/관리 기능에 잘 맞습니다. hot counter처럼 충돌이 항상 나는 데이터에는 atomic update나 다른 모델이 더 단순할 수 있습니다.

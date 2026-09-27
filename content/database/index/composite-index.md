---
kind: concept
contentKey: database.core.index.composite-index
topicContentKey: database.core.index
slug: composite-index
title: "복합 인덱스의 컬럼 순서"
summary: "복합 B-tree의 정렬 순서가 동등 비교·범위 조건과 ORDER BY에서 탐색 범위를 어떻게 결정하는지 이해하고, 단순한 '왼쪽부터' 암기보다 실제 쿼리 형태로 순서를 선택한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/16/indexes-multicolumn.html"
    title: "PostgreSQL 16 Documentation: Multicolumn Indexes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: PostgreSQL 16 다중 컬럼 B-tree의 선두 컬럼과 스캔 범위 규칙 확인
  - url: "https://www.postgresql.org/docs/18/indexes-multicolumn.html"
    title: "PostgreSQL 18 Documentation: Multicolumn Indexes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: PostgreSQL 18 B-tree skip scan 동작과 선두 컬럼의 고유 값 수에 따른 플래너 선택 확인
---
# 복합 인덱스의 컬럼 순서

목록 API가 다음 쿼리를 반복한다고 해 보겠습니다.

```sql
SELECT id, created_at
FROM orders
WHERE member_id = 42
  AND status = 'PAID'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

복합 B-tree는 선언한 컬럼 순서로 정렬 구조를 만듭니다.

```sql
CREATE INDEX idx_orders_member_status_created
ON orders(member_id, status, created_at DESC, id DESC);
```

개념적으로는 같은 `member_id` 범위 안에서 `status`, `created_at`, `id` 순으로 값이 이어집니다.

```text
member 42
  ├─ CANCELLED ...
  └─ PAID
      ├─ 2026-08-31 / id 900
      ├─ 2026-08-30 / id 850
      └─ ...
```

### 선두의 동등 비교 조건이 탐색 범위를 먼저 좁힌다

PostgreSQL 16의 다중 컬럼 B-tree에서는 선두 컬럼의 동등 비교 조건과 그 뒤의 첫 부등호·범위 조건이 실제 스캔 범위를 줄이는 데 중요합니다.

예를 들어 `(a, b, c)` 인덱스에 다음 조건이 있다고 해 보겠습니다.

```sql
WHERE a = ?
  AND b >= ?
```

`a = ?`로 큰 범위를 먼저 좁히고 `b >= ?`가 그 안의 시작 범위를 정합니다. 오른쪽 컬럼 조건도 인덱스 안에서 검사될 수 있지만, 앞쪽 조건과 같은 방식으로 항상 스캔 범위를 줄여 주는 것은 아닙니다.

### 첫 컬럼 조건이 없다고 인덱스가 문법적으로 사용 불가능한 것은 아니다

PostgreSQL 16에서는 `(a, b)` 인덱스에 `WHERE b = ?`만 있으면 앞쪽 `a`로 탐색 범위를 좁힐 수 없어 넓은 인덱스 구간을 확인해야 할 수 있고, 플래너는 Sequential Scan 같은 다른 계획이 더 싸다고 판단할 수 있습니다. 따라서 선두 컬럼 조건이 없다고 인덱스를 문법적으로 사용할 수 없는 것은 아니지만 비용상 선택되지 않는 경우가 많습니다.

PostgreSQL 18의 B-tree는 상황에 따라 **skip scan**으로 뒤쪽 컬럼 조건도 활용할 수 있습니다. 앞쪽 컬럼의 고유 값이 적을 때 가능한 각 값을 반복 탐색해 뒤쪽 조건의 범위를 좁힐 수 있으며, 유리한지는 플래너가 통계와 비용을 보고 결정합니다. 이는 선두 컬럼의 조건이 일반적으로 탐색 범위를 좁힌다는 원칙을 없애지 않으므로, 지원 버전을 밝히고 실제 실행 계획을 확인해야 합니다.

그래서 “복합 인덱스는 왼쪽 컬럼이 없으면 절대 못 쓴다”라고 외우기보다 **어느 조건이 탐색 시작·종료 범위를 실제로 좁히는가**를 보는 편이 정확합니다.

### 동등 비교와 범위, 정렬 요구를 함께 본다

```sql
WHERE member_id = ?
  AND created_at >= ?
ORDER BY created_at DESC, id DESC
```

이런 접근이 반복된다면 `(member_id, created_at DESC, id DESC)`는 자연스러운 후보가 될 수 있습니다. 반대로 `(created_at, member_id)`는 넓은 시간 범위를 먼저 읽은 뒤 회원 조건을 추가로 확인해야 할 수 있습니다.

컬럼 순서는 단순히 “선택도가 높은 컬럼부터” 하나로 결정되지 않습니다. 실제 `WHERE` 조합, 동등 비교와 범위 조건의 위치, `ORDER BY`, 페이지네이션 순서, 다른 쿼리에서의 재사용까지 함께 봐야 합니다.

복합 인덱스를 설계할 때는 대표 쿼리를 먼저 적고 **어떤 컬럼으로 탐색 범위를 좁히고 어떤 순서로 결과를 읽어야 하는지**를 설명한 뒤 `EXPLAIN`으로 실제 플래너 선택을 확인하는 것이 가장 안전합니다.

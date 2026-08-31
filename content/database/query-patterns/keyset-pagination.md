---
kind: concept
contentKey: database.core.query-patterns.keyset-pagination
topicContentKey: database.core.query-patterns
slug: keyset-pagination
title: "Keyset pagination과 cursor 경계"
summary: "마지막으로 본 sort key를 다음 query의 시작점으로 사용해 deep offset을 피하고 append-heavy 데이터에서 안정성을 높이는 원리와 composite cursor·역방향 이동 trade-off를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/functions-comparisons.html#ROW-WISE-COMPARISON"
    title: "PostgreSQL Documentation: Row Constructor Comparison"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: composite sort key 비교에 사용할 row comparison 의미 확인
---
# Keyset pagination과 cursor 경계

최신 주문 목록을 무한 스크롤로 내리는 화면이라면 “20페이지로 바로 이동”보다 **현재 본 마지막 row 다음부터 이어서 읽는 것**이 더 자연스러울 수 있습니다. Keyset pagination은 OFFSET 숫자 대신 마지막 sort key를 cursor로 사용합니다.

```sql
-- 첫 페이지
SELECT id, created_at
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

마지막 row가 `(created_at='2026-08-31 10:00', id=800)`이었다면 다음 query는:

```sql
SELECT id, created_at
FROM orders
WHERE (created_at, id) < (:lastCreatedAt, :lastId)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### cursor는 ordering contract를 그대로 담아야 한다

`created_at`이 unique하지 않다면 시각 하나만 cursor로 쓰면 같은 시각의 일부 row를 건너뛸 수 있습니다.

```text
10:00 / id 803
10:00 / id 802
10:00 / id 801  ← page 끝
10:00 / id 800
```

cursor가 `10:00` 하나뿐이면 다음 페이지에서 id 800의 위치를 정확히 표현할 수 없습니다. 그래서 `(created_at, id)`처럼 정렬 tie-breaker 전체를 cursor에 포함합니다.

### 앞쪽 insert의 영향을 덜 받는다

1페이지를 본 뒤 더 최신 row가 추가되어도 “마지막으로 본 key보다 뒤쪽”을 조건으로 읽으므로 offset 기준 위치가 밀리는 문제를 줄일 수 있습니다.

### random page jump는 어렵다

Keyset은 이전 위치를 알아야 다음 위치를 찾으므로 정확한 `page=5000` 이동이나 total page 표시에는 불편합니다. 역방향 navigation도 별도 cursor/order 설계가 필요합니다.

Keyset pagination은 단순 성능 trick이 아니라 **사용자 navigation 모델을 row ordering contract에 맞추는 API 설계**입니다.

---
kind: concept
contentKey: database.core.query-patterns.keyset-pagination
topicContentKey: database.core.query-patterns
slug: keyset-pagination
title: "Keyset 페이지네이션과 커서 경계"
summary: "마지막으로 본 정렬 키를 다음 쿼리의 시작점으로 사용해 큰 OFFSET을 피하고, 새 데이터가 주로 앞쪽에 추가되는 목록에서 안정성을 높이는 원리와 복합 커서·역방향 이동의 trade-off를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/functions-comparisons.html#ROW-WISE-COMPARISON"
    title: "PostgreSQL Documentation: Row Constructor Comparison"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 복합 정렬 키 비교에 사용할 행 비교(row comparison)의 의미 확인
---
# Keyset 페이지네이션과 커서 경계

최신 주문 목록을 무한 스크롤로 내리는 화면이라면 “20페이지로 바로 이동”보다 **현재 본 마지막 행 다음부터 이어서 읽는 것**이 더 자연스러울 수 있습니다. Keyset 페이지네이션은 OFFSET 숫자 대신 마지막 정렬 키를 커서로 사용합니다.

```sql
-- 첫 페이지
SELECT id, created_at
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

마지막 행이 `(created_at='2026-08-31 10:00', id=800)`이었다면 다음 쿼리는 다음처럼 만들 수 있습니다.

```sql
SELECT id, created_at
FROM orders
WHERE (created_at, id) < (:lastCreatedAt, :lastId)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

```text
정렬 순서 (DESC): 803 ─ 802 ─ 801 │ 800 ─ 799 ─ 798
                              ▲
                              └─ page 1의 마지막 cursor = (10:00, 800)

다음 page: (created_at, id) < (10:00, 800)인 row만 탐색
```

### 커서는 정렬 계약을 그대로 담아야 한다

`created_at`이 유일하지 않다면 시각 하나만 커서로 쓰면 같은 시각의 일부 행을 건너뛸 수 있습니다.

```text
10:00 / id 803
10:00 / id 802
10:00 / id 801  ← page 끝
10:00 / id 800
```

커서가 `10:00` 하나뿐이면 다음 페이지에서 id 800의 위치를 정확히 표현할 수 없습니다. 그래서 `(created_at, id)`처럼 정렬의 동률 해소 기준까지 커서에 포함합니다.

복합 비교에 쓰는 정렬 컬럼은 가능하면 `NOT NULL`로 둡니다. 비교 튜플에 NULL이 끼면 PostgreSQL의 행 비교 결과가 UNKNOWN이 될 수 있어 커서 경계에서 행을 건너뛸 수 있습니다. NULL 정렬이 필요하다면 `NULLS FIRST/LAST`와 일치하는 별도 조건으로 경계를 명시해야 합니다.

### 앞쪽 INSERT의 영향을 덜 받는다

1페이지를 본 뒤 더 최신 행이 추가되어도 “마지막으로 본 키보다 뒤쪽”을 조건으로 읽으므로 OFFSET 기준 위치가 밀리는 문제를 줄일 수 있습니다.

Keyset 방식은 여러 페이지를 하나의 스냅샷으로 고정하지 않습니다. 정렬 키가 페이지 탐색 중 바뀌거나 행이 삭제되면 후속 결과도 바뀔 수 있으므로, 정렬 키의 변경 가능성과 화면이 요구하는 일관성 범위를 함께 정합니다.

### 임의 페이지 이동은 어렵다

Keyset 방식은 이전 위치를 알아야 다음 위치를 찾으므로 정확한 `page=5000` 이동이나 전체 페이지 수 표시에는 불편합니다. 역방향 이동도 별도 커서·정렬 설계가 필요합니다.

Keyset 페이지네이션은 단순 성능 기법이 아니라 **사용자 탐색 모델을 행 정렬 계약에 맞추는 API 설계**입니다.

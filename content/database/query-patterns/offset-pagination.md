---
kind: concept
contentKey: database.core.query-patterns.offset-pagination
topicContentKey: database.core.query-patterns
slug: offset-pagination
title: "Offset pagination의 비용과 안정성"
summary: "LIMIT/OFFSET이 page-number UI에는 편리하지만 deep offset에서 앞 row를 건너뛰는 비용과 concurrent insert/delete에 따른 page drift가 생기는 이유를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/queries-limit.html"
    title: "PostgreSQL Documentation: LIMIT and OFFSET"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: LIMIT/OFFSET과 deterministic ORDER BY 필요성 확인
---
# Offset pagination의 비용과 안정성

페이지 번호 UI에서는 `LIMIT 20 OFFSET 1980`처럼 원하는 page로 바로 이동하는 방식이 자연스럽습니다. 하지만 offset은 “DB가 앞 1,980 row를 아예 존재하지 않는 것처럼 건너뛴다”는 마법이 아닙니다. 계획에 따라 **앞 row를 찾아낸 뒤 버려야 하는 작업**이 필요할 수 있습니다.

```sql
SELECT id, created_at
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 200000;
```

```text
정렬된 결과
[1 ... 200000]  → 읽고/찾고 버림
[200001 ... 200020] → 반환
```

데이터가 커질수록 deep page 비용이 증가할 수 있습니다.

### ORDER BY가 없으면 페이지 자체가 안정적이지 않다

PostgreSQL은 LIMIT/OFFSET을 사용할 때 결과 순서를 명시하지 않으면 어떤 row subset이 나올지 예측 가능한 계약이 아닙니다.

```sql
ORDER BY created_at DESC, id DESC
```

`created_at`만 같을 수 있다면 `id` 같은 tie-breaker를 추가해 total order에 가깝게 만드는 것이 좋습니다.

### concurrent 변경이 page drift를 만든다

사용자가 1페이지를 본 뒤 그 앞에 새 row가 10개 INSERT되면 2페이지 OFFSET 기준이 밀립니다. 이미 본 row가 다시 나오거나 일부 row를 건너뛸 수 있습니다.

```text
page 1 조회 후
새 row 10개 삽입
        ↓
OFFSET 20의 기준 위치 자체가 이동
```

### 그래도 offset이 좋은 경우가 있다

데이터 규모가 적당하고 deep navigation이 드물며 UI가 정확한 page 번호, total count, 임의 page jump를 요구한다면 offset이 단순하고 충분할 수 있습니다. 최적화 기술을 쓰기 전에 실제 데이터 크기와 UX를 봅니다.

Offset pagination은 나쁜 방식이 아니라 **page-number 편의와 deep scan/page drift 비용을 교환하는 방식**입니다.

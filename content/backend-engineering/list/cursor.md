---
kind: concept
contentKey: backend.core.list.cursor
topicContentKey: backend.core.list
slug: cursor
title: cursor/keyset
summary: Cursor pagination은 마지막으로 본 정렬 위치를 다음 조회 조건으로 사용해 deep skip과 삽입에 따른 page drift를 줄인다.
level: 2
status: PUBLISHED
displayOrder: 30
references:
- url: https://google.aip.dev/158
  title: 'AIP-158: Pagination'
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: page token의 continuation semantics와 opaque token 계약 확인
- url: https://www.postgresql.org/docs/current/queries-limit.html
  title: 'PostgreSQL Documentation: LIMIT and OFFSET'
  referenceType: OFFICIAL
  language: en
  displayOrder: 2
  relationNote: LIMIT/OFFSET의 deterministic ordering과 deep OFFSET 비용을 keyset 선택 기준과 비교
---
# cursor/keyset

Cursor pagination은 “offset보다 무조건 빠른 최신 방식”이 아닙니다. **정렬된 목록의 마지막 위치를 다음 요청의 시작 조건으로 전달해 deep skip과 page drift를 줄이는 방식**입니다.

### offset에서 삽입이 일어나면

```text
첫 요청
[10, 9, 8, 7, 6] [5, 4, 3, 2, 1]

새 11 삽입
[11, 10, 9, 8, 7] [6, 5, 4, 3, 2] ...

OFFSET 5 → 6부터 시작해서 6을 중복해서 볼 수 있음
```

### keyset은 마지막 key를 조건으로 사용한다

```sql
SELECT id, created_at, title
FROM posts
WHERE (created_at, id) < (:lastCreatedAt, :lastId)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

마지막으로 본 `(createdAt, id)`보다 뒤쪽만 읽으므로 앞에 새 행이 생겨도 경계가 덜 흔들립니다. 다만 이것도 여러 요청 전체를 동일 snapshot으로 고정하는 보장은 아닙니다. 정렬 key 자체가 수정되거나 row가 삭제되는 workload에서는 별도 consistency 의미를 정의해야 합니다.

### cursor는 client에게 opaque한 continuation token으로 다룬다

client가 `createdAt`과 `id` 같은 내부 정렬 key를 조합하는 계약에 의존하게 만들면 내부 sort 구조를 바꾸기 어렵습니다. server가 다음 탐색 위치를 나타내는 token을 발급하고 client는 그 token을 해석하지 않고 그대로 돌려주는 편이 API evolution에 유리합니다. AIP-158도 page token을 opaque하게 유지하라고 명시합니다.

단순히 `base64("createdAt=...&id=42")`처럼 내부 필드를 인코딩했다고 opaque contract가 되는 것은 아닙니다. stateless token에 내부 continuation state를 담을 수는 있지만 client가 구조에 의존하지 못하게 하고, 변조가 correctness나 authorization 문제를 만들 수 있다면 서명·검증 또는 server-side state 같은 보호를 threat model에 맞게 둡니다. Cursor 자체를 authorization token으로 사용하지도 않습니다.

### 제약도 있다

- 임의 페이지 번호 jump가 어렵습니다.
- 복잡한 사용자 지정 sort마다 cursor 조건을 별도로 설계해야 합니다.
- 정렬 key가 안정적 의미를 가져야 합니다.
- 이전 페이지 이동은 reverse query/extra token 설계가 필요합니다.

그래서 append-heavy history, feed, attempt log처럼 연속 탐색이 중요한 목록에 특히 잘 맞습니다.

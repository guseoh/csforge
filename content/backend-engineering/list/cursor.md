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
references: []
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

마지막으로 본 `(createdAt, id)`보다 뒤쪽만 읽으므로 앞에 새 행이 생겨도 경계가 덜 흔들립니다.

### cursor는 opaque하게 만드는 편이 낫다

client가 raw ID를 조합하게 하기보다 server가 정렬 key와 방향을 encoding한 token을 발급하면 내부 sort 변경을 숨길 수 있습니다.

```text
cursor = base64("createdAt=...&id=42&direction=next")
```

서명까지 필요한지는 threat model에 따라 판단하지만, client가 임의로 payload를 조작했을 때 안전한지도 봐야 합니다.

### 제약도 있다

- 임의 페이지 번호 jump가 어렵습니다.
- 복잡한 사용자 지정 sort마다 cursor 조건을 별도로 설계해야 합니다.
- 정렬 key가 안정적 의미를 가져야 합니다.
- 이전 페이지 이동은 reverse query/extra token 설계가 필요합니다.

그래서 append-heavy history, feed, attempt log처럼 연속 탐색이 중요한 목록에 특히 잘 맞습니다.

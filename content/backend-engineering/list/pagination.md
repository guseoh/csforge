---
kind: concept
contentKey: backend.core.list.pagination
topicContentKey: backend.core.list
slug: pagination
title: pagination
summary: 목록 API의 pagination은 한 요청이 읽고 정렬하고 직렬화할 데이터량에 상한을 두는 자원 보호 계약이다.
level: 2
status: PUBLISHED
displayOrder: 10
references:
- url: https://google.aip.dev/158
  title: 'AIP-158: Pagination'
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: bounded page size와 page token을 포함한 collection API pagination 계약 확인
- url: https://www.postgresql.org/docs/current/queries-limit.html
  title: 'PostgreSQL Documentation: LIMIT and OFFSET'
  referenceType: OFFICIAL
  language: en
  displayOrder: 2
  relationNote: LIMIT/OFFSET에서 unique ordering 필요성과 large OFFSET 비용 확인
---
# pagination

목록 API에 pagination을 넣는 이유는 UI가 페이지 번호를 좋아해서만이 아닙니다. **한 요청이 읽고 정렬하고 직렬화할 데이터량에 상한을 두기 위해서**입니다. 데이터가 늘어날수록 `findAll()` 같은 무제한 조회는 DB, JVM heap, network를 동시에 압박합니다.

### stable ordering이 먼저다

```sql
SELECT id, created_at, title
FROM posts
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 20;
```

`created_at`이 같은 행이 여러 개라면 상대 순서가 흔들릴 수 있으므로 unique tie-breaker를 추가합니다. PostgreSQL도 `LIMIT`으로 결과 일부를 읽을 때 예측 가능한 subset을 얻으려면 `ORDER BY`가 unique order를 만들도록 해야 한다고 명시합니다.

```text
Page 1: [105, 104, 103, ...]
          ▲
          └─ deterministic ordering이 다음 요청의 경계를 안정시킴
```

다만 deterministic ordering이 여러 요청을 하나의 snapshot으로 묶어 주는 것은 아닙니다. 페이지 사이에 insert/delete가 일어나면 offset 기반 pagination에서는 중복이나 누락이 생길 수 있으므로, 목록의 consistency 요구와 pagination 방식을 별도로 판단합니다.

### offset pagination의 비용

`OFFSET 100000`은 앞의 100,000행을 client로 보내지 않을 뿐 DB가 그 위치를 찾는 비용까지 없애는 것은 아닙니다. PostgreSQL처럼 skipped row도 server 내부에서 계산해야 하는 구현에서는 deep page의 비용이 커질 수 있습니다. 실제 비용은 DB engine과 query plan으로 확인해야 합니다.

### 페이지 번호가 가치 있을 때

관리자 목록이나 데이터 규모가 중간이고 사용자가 “37페이지로 이동”해야 한다면 offset이 실용적입니다. 모든 목록을 cursor로 바꾸는 것이 목표가 아닙니다.

### 응답 계약도 bounded해야 한다

```json
{
  "items": [],
  "page": 2,
  "size": 20,
  "hasNext": true
}
```

`size=1000000`을 그대로 허용하면 pagination의 자원 보호 의미가 사라집니다. 서버가 최대 page size를 제한해야 합니다. AIP-158 같은 API 설계 가이드도 client가 page size를 요청하더라도 service가 허용 가능한 maximum을 두는 계약을 사용합니다.

### count도 비용이다

`Page<T>`를 만들기 위해 매 요청마다 `COUNT(*)`가 필요한지 봅니다. 단순 다음 페이지 여부만 필요하다면 `size + 1` 조회로 `hasNext`를 계산하는 Slice 형태가 더 저렴할 수 있습니다. 이 선택은 framework 보장이 아니라 사용하는 query와 데이터 규모를 측정해 결정합니다.

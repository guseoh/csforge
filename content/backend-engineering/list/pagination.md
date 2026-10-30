---
kind: concept
contentKey: backend.core.list.pagination
topicContentKey: backend.core.list
slug: pagination
title: "페이지네이션과 목록 자원 상한"
summary: "목록 API의 페이지네이션을 UI 편의가 아니라 한 요청이 조회·정렬·직렬화하는 데이터량을 제한하는 자원 보호 계약으로 이해한다."
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
# 페이지네이션과 목록 자원 상한

목록 API에 페이지네이션을 넣는 이유는 화면에 페이지 번호를 보여 주기 위해서만이 아닙니다. 데이터가 계속 늘어나는 서비스에서 `findAll()`처럼 제한 없는 조회를 허용하면 한 요청이 DB 조회량, JVM 메모리, JSON 직렬화, 네트워크 전송량을 동시에 크게 만들 수 있습니다.

따라서 페이지네이션의 첫 번째 역할은 **한 요청이 처리할 데이터량에 상한을 두는 것**입니다.

### 페이지를 나누기 전에 안정적인 정렬 기준이 필요하다

```sql
SELECT id, created_at, title
FROM posts
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 20;
```

`created_at` 값이 같은 row가 여러 개라면 그것만으로는 상대 순서가 완전히 결정되지 않습니다. `id` 같은 unique tie-breaker를 함께 사용하면 동일한 데이터 상태에서 정렬 순서를 안정적으로 만들 수 있습니다.

```text
ORDER BY created_at DESC, id DESC
                          ▲
                          └─ 같은 created_at 안의 순서를 결정
```

다만 deterministic ordering이 여러 HTTP 요청을 하나의 DB snapshot으로 묶어 주는 것은 아닙니다. 첫 페이지와 두 번째 페이지 사이에 row가 삽입·삭제되면 offset 기반 페이지네이션에서는 중복이나 누락이 생길 수 있습니다. 정렬 안정성과 요청 간 snapshot 일관성은 다른 문제입니다.

### 큰 OFFSET은 앞부분을 공짜로 건너뛰는 것이 아니다

```sql
LIMIT 20 OFFSET 100000
```

클라이언트에는 20개만 반환하지만 PostgreSQL은 그 위치까지 도달하기 위해 앞선 row를 처리해야 할 수 있습니다. 그래서 데이터가 커질수록 deep page의 비용이 증가할 수 있고, 실제 비용은 query plan으로 확인해야 합니다.

그렇다고 offset pagination이 나쁜 방식이라는 뜻은 아닙니다. 관리자 화면처럼 임의의 페이지 번호로 이동해야 하고 데이터 규모와 조회 비용이 충분히 작다면 단순하고 실용적인 선택입니다.

### page size 자체도 서버 계약으로 제한한다

```json
{
  "items": [],
  "page": 2,
  "size": 20,
  "hasNext": true
}
```

클라이언트가 `size=1000000`을 보내는 것을 그대로 허용하면 페이지네이션의 자원 보호 의미가 사라집니다. 서버는 기본 크기와 최대 크기를 정하고 허용 범위를 벗어난 요청을 보정하거나 거절하는 정책을 가져야 합니다.

### 전체 건수가 정말 필요한지도 확인한다

페이지 번호와 총 페이지 수를 제공하려면 별도의 `COUNT(*)`가 필요할 수 있습니다. 하지만 UI가 "다음 항목이 더 있는가"만 필요하다면 `size + 1`개를 조회해 `hasNext`만 계산하는 방식이 더 적합할 수 있습니다.

```text
총 페이지 수가 제품 기능인가?
  ├─ yes → count 비용까지 포함해 설계
  └─ no  → 다음 페이지 존재 여부만 계산 가능
```

페이지네이션을 선택할 때는 framework의 `Page<T>`를 기본값처럼 쓰기보다 **목록이 요구하는 이동 방식, 데이터 규모, 정렬 안정성, count 비용, 한 요청의 최대 자원 사용량**을 함께 봐야 합니다.

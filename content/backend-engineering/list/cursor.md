---
kind: concept
contentKey: backend.core.list.cursor
topicContentKey: backend.core.list
slug: cursor
title: "Cursor·Keyset 페이지네이션"
summary: "마지막으로 본 정렬 위치를 다음 조회 조건으로 사용해 큰 OFFSET 비용과 삽입에 따른 page drift를 줄이는 cursor/keyset 방식의 조건과 제약을 이해한다."
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
# Cursor·Keyset 페이지네이션

Cursor pagination을 "offset보다 무조건 빠른 최신 방식"으로 선택하면 요구사항과 맞지 않을 수 있습니다. 이 방식의 핵심은 **마지막으로 본 정렬 위치를 다음 조회의 시작 조건으로 사용해 앞부분을 반복해서 건너뛰는 비용과 페이지 경계 흔들림을 줄이는 것**입니다.

### Offset은 앞쪽 삽입 때문에 다음 페이지 경계가 이동할 수 있다

```text
첫 요청
[10, 9, 8, 7, 6] [5, 4, 3, 2, 1]

새 11 삽입
[11, 10, 9, 8, 7] [6, 5, 4, 3, 2] ...

OFFSET 5
→ 두 번째 요청에서 6을 다시 볼 수 있음
```

Offset은 "현재 결과 집합에서 앞의 N개를 건너뛴다"는 의미이므로 요청 사이에 앞부분이 바뀌면 같은 숫자가 다른 경계를 가리킬 수 있습니다.

### Keyset은 마지막 정렬 키 이후를 조건으로 읽는다

```sql
SELECT id, created_at, title
FROM posts
WHERE (created_at, id) < (:lastCreatedAt, :lastId)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

첫 페이지의 마지막 row가 `(createdAt, id) = (T, 42)`였다면 다음 요청은 그 위치보다 뒤에 오는 row만 읽습니다. 앞쪽에 새로운 row가 추가돼도 이미 본 경계는 그대로 남기 때문에 offset보다 중복이 줄어듭니다.

다만 이 방식도 여러 요청을 하나의 snapshot으로 고정하지는 않습니다. 정렬 key가 수정되거나 row가 삭제되면 어떤 항목을 다시 보거나 건너뛸 수 있는지 제품 계약을 별도로 생각해야 합니다.

### Cursor token은 내부 정렬 구조를 감추는 편이 좋다

클라이언트에게 `lastCreatedAt`, `lastId` 조합을 직접 만들게 하면 내부 정렬 정책을 바꾸기 어려워집니다. 서버가 continuation state를 token으로 발급하고 클라이언트는 해석하지 않은 채 다음 요청에 돌려주는 형태가 API 진화에 유리합니다.

```text
server
  └─ 다음 위치 + 필요한 요청 문맥
          ↓ encode/sign/store
       cursor token
          ↓
client는 그대로 반환
```

단순히 내부 필드를 base64로 인코딩했다고 보안이 생기는 것은 아닙니다. token 변조가 결과 정확성이나 권한 문제를 만들 수 있다면 서명·검증 또는 server-side state 같은 보호를 threat model에 맞게 둡니다. Cursor는 인증·인가 token을 대신하지 않습니다.

### 어떤 목록에 잘 맞는가

Cursor/keyset은 보통 다음 조건에서 가치가 큽니다.

- 데이터가 크고 deep offset 조회가 실제 비용 문제가 된다.
- feed, 이력, attempt log처럼 앞에서부터 연속 탐색하는 사용이 많다.
- 안정적인 정렬 key와 tie-breaker를 정의할 수 있다.
- 임의의 "37페이지 이동"보다 다음/이전 흐름이 중요하다.

반대로 관리자 화면처럼 정확한 페이지 번호 이동이 핵심이고 데이터 규모가 작다면 offset이 더 단순할 수 있습니다.

페이지네이션 방식은 유행으로 선택하는 것이 아니라 **사용자가 어떻게 목록을 탐색하는지, 요청 사이 변경을 어떻게 받아들일지, DB가 다음 위치를 얼마나 효율적으로 찾을 수 있는지**를 함께 보고 선택합니다.

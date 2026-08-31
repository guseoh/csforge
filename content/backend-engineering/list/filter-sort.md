---
kind: concept
contentKey: backend.core.list.filter-sort
topicContentKey: backend.core.list
slug: filter-sort
title: filter와 sort
summary: filter와 sort는 client가 query shape에 영향을 주는 입력 경계이므로 허용 필드, 의미, 안정적 정렬을 계약으로 제한해야 한다.
level: 2
status: PUBLISHED
displayOrder: 20
references: []
---
# filter와 sort

목록 API의 filter와 sort는 단순 query parameter가 아니라 **클라이언트가 DB query shape에 영향을 주는 입력 경계**입니다. 허용 범위를 정의하지 않으면 성능과 보안, 결과 안정성이 모두 흔들릴 수 있습니다.

### 아무 field나 sort하게 하지 않는다

```http
GET /api/orders?sort=someInternalColumn,desc
```

client 문자열을 그대로 SQL identifier에 붙이면 injection 위험이 생길 수 있고, index가 전혀 없는 column 정렬로 큰 sort가 발생할 수도 있습니다. API에서 허용된 logical field를 whitelist로 매핑합니다.

```java
Map<String, SortField> allowed = Map.of(
        "createdAt", SortField.CREATED_AT,
        "amount", SortField.AMOUNT
);
```

### filter의 의미를 계약으로 만든다

`status=PAID,CANCELLED`, `createdFrom`, `createdTo`가 AND인지 OR인지 명확해야 합니다. 빈 문자열과 미지정 값의 의미도 정합니다.

### stable sort가 pagination과 결합된다

```text
filter 조건
   │
   ▼
후보 row 집합
   │
   ▼
허용 sort + tie-breaker
   │
   ▼
page/cursor 경계
```

filter가 바뀌면 cursor도 보통 재사용할 수 없습니다. Cursor에 sort/filter context를 포함하거나 API가 새 cursor를 발급하는 이유입니다.

### DB index는 실제 query 조합을 보고 결정한다

filter 가능한 column마다 index를 무조건 만드는 것이 아니라 자주 쓰는 조합과 selectivity, sort를 측정해 composite index를 설계합니다.

### API 의미와 persistence column을 분리한다

외부에는 `sort=recent`를 제공하고 내부에서는 `created_at DESC, id DESC`로 매핑할 수 있습니다. 이렇게 하면 DB column 이름이나 구현 전략을 바꿔도 API 의미를 유지하기 쉽습니다.

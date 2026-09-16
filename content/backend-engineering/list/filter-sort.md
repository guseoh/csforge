---
kind: concept
contentKey: backend.core.list.filter-sort
topicContentKey: backend.core.list
slug: filter-sort
title: "필터링과 정렬 계약"
summary: "필터와 정렬을 클라이언트가 DB query shape에 영향을 주는 입력 경계로 보고 허용 필드·연산자·안정적 정렬·복잡도 한계를 API 계약으로 제한한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
- url: https://google.aip.dev/132
  title: 'AIP-132: Standard methods: List'
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: List API의 filter/order_by와 pagination parameter 계약 확인
- url: https://google.aip.dev/160
  title: 'AIP-160: Filtering'
  referenceType: OFFICIAL
  language: en
  displayOrder: 2
  relationNote: filter syntax와 지원 field·validation·complexity 제한을 API 계약으로 정의하는 방식 확인
---
# 필터링과 정렬 계약

목록 API의 필터와 정렬은 단순한 query parameter가 아닙니다. 클라이언트가 어떤 조건과 순서로 데이터를 읽을지 요청하면서 **DB query shape에 직접 영향을 주는 입력 경계**입니다. 허용 범위를 정하지 않으면 내부 컬럼 노출, 예상하지 못한 정렬 비용, injection 위험, 불안정한 페이지 결과가 함께 생길 수 있습니다.

### 외부 문자열을 임의의 DB 컬럼으로 연결하지 않는다

```http
GET /api/orders?sort=someInternalColumn,desc
```

`sort` 값을 그대로 SQL identifier에 붙이는 방식은 안전하지 않습니다. 외부에는 제품 의미가 있는 정렬 키만 열고 내부에서는 명시적으로 실제 정렬식에 매핑하는 편이 좋습니다.

```java
Map<String, SortField> allowed = Map.of(
        "recent", SortField.CREATED_AT,
        "amount", SortField.AMOUNT
);
```

```text
API: sort=recent
        ↓
서버의 허용된 의미로 해석
        ↓
ORDER BY created_at DESC, id DESC
```

이렇게 하면 DB 컬럼명이 바뀌어도 외부 API 의미를 유지하기 쉽습니다.

### 필터는 지원 필드와 연산 의미까지 계약이다

다음 요청에서 쉼표가 OR인지 AND인지, 빈 문자열과 미지정이 같은지, 날짜 경계가 inclusive인지가 모두 명확해야 합니다.

```http
GET /api/orders?status=PAID,CANCELLED&createdFrom=2026-09-01
```

복잡한 범용 query language를 제공하는 것이 목적이 아니라면 서비스가 실제로 지원할 조합만 명시적으로 열 수 있습니다. 허용하지 않는 필드·연산자·과도한 조건 수는 validation 단계에서 거절해 query 복잡도를 통제합니다.

### 정렬의 마지막 tie-breaker가 페이지 경계를 안정시킨다

```text
필터 적용
   ↓
후보 row 집합
   ↓
허용된 정렬 + unique tie-breaker
   ↓
offset 또는 cursor 경계
```

`createdAt DESC`만 사용했는데 같은 시각의 row가 많으면 페이지 사이의 상대 순서가 흔들릴 수 있습니다. `id DESC` 같은 안정적인 보조 키를 두면 다음 페이지의 기준을 명확하게 만들 수 있습니다.

Cursor 기반 API에서는 이전 token이 어떤 필터·정렬 조건에서 발급되었는지도 중요합니다. 필터가 달라졌는데 이전 cursor를 그대로 적용하면 continuation 의미가 깨질 수 있으므로 token이 요청 문맥과 일치하는지 검증하거나 새 cursor를 발급합니다.

### 필터 가능한 모든 컬럼에 인덱스를 만드는 것도 답은 아니다

API가 허용하는 필터 수와 DB 인덱스 수는 1:1 관계가 아닙니다. 실제 사용 빈도, 데이터 분포, 정렬 조합, selectivity를 측정해 자주 반복되는 query path에 맞춰 인덱스를 설계해야 합니다.

필터링과 정렬을 설계할 때 중요한 질문은 **클라이언트에게 어떤 조회 능력을 계약으로 제공할 것인가, 그리고 그 입력이 내부 query 비용을 어디까지 키울 수 있게 허용할 것인가**입니다.

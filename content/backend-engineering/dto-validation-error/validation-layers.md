---
kind: concept
contentKey: backend.core.dto-validation-error.validation-layers
topicContentKey: backend.core.dto-validation-error
slug: validation-layers
title: validation layers
summary: Parsing, API request, Domain invariant, DB constraint는 서로 다른 실패를 서로 다른 경계에서 막는다.
level: 2
status: PUBLISHED
displayOrder: 20
references:
- url: https://www.postgresql.org/docs/current/ddl-constraints.html
  title: 'PostgreSQL: Constraints'
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: PK/FK/UNIQUE/CHECK 등 DB invariant 경계 확인
---
# validation layers

Validation은 한곳에만 두면 깔끔해 보이지만 실제로는 **서로 다른 실패를 서로 다른 경계가 소유**합니다. 같은 규칙을 중복한다는 이유만으로 모든 검증을 Controller나 Domain 한곳에 몰면 우회 경로가 생기거나 사용자 피드백이 늦어집니다.

### 네 종류의 검증을 분리한다

| 층위               | 예시                  | 실패 의미                          |
| ------------------ | --------------------- | ---------------------------------- |
| parsing/shape      | JSON 문법, 숫자 형식  | 요청 자체를 읽을 수 없음           |
| request validation | 제목 길이, 필수 field | API 입력 계약 위반                 |
| domain invariant   | 이미 배송된 주문 취소 | 유효한 상태 전이 아님              |
| DB constraint      | unique email, FK      | 동시성까지 포함한 저장 무결성 위반 |

`@NotBlank`가 있다고 해서 “배송 이후 취소 금지”를 표현하기 어렵고, service에서 `existsByEmail()`을 먼저 호출한다고 unique race가 사라지는 것도 아닙니다.

### check-then-insert race

```text
T1: SELECT email → 없음
T2: SELECT email → 없음
T1: INSERT       → 성공
T2: INSERT       → unique violation
```

Application의 사전 검사는 친절한 오류를 만들 수 있지만 최종 무결성은 DB unique constraint가 보호해야 합니다.

### Domain validation은 생성과 전이를 지킨다

```java
Order.place(items);      // 빈 items 거부
order.cancel(reason);    // 현재 상태에서 취소 가능성 검사
```

API를 거치지 않는 batch/import에서도 같은 규칙이 유지됩니다.

### 실패를 어디서 번역할 것인가

DB constraint exception을 그대로 SQL 메시지로 client에 노출하지 않습니다. Infrastructure/Application이 의미 있는 conflict로 번역하고 API가 안정적인 error contract로 반환합니다.

### 중복은 항상 나쁜가

같은 최대 길이를 API와 DB에 둘 수 있습니다. API는 빠른 피드백, DB는 최종 integrity라는 책임이 다릅니다. 두 값이 drift하지 않도록 source와 test를 관리하는 것이 더 중요합니다.

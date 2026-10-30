---
kind: concept
contentKey: backend.core.dto-validation-error.validation-layers
topicContentKey: backend.core.dto-validation-error
slug: validation-layers
title: "검증 계층과 책임"
summary: "파싱·API 입력·권한·도메인 불변식·DB 제약이 서로 다른 실패를 막는 이유를 구분하고, 사전 검증과 최종 무결성 보장을 같은 책임으로 보지 않는다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
- url: https://www.postgresql.org/docs/current/ddl-constraints.html
  title: "PostgreSQL Documentation: Constraints"
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK 등 DB 무결성 제약의 계약 확인
---
# 검증 계층과 책임

검증을 한곳에 모으면 코드가 단순해 보일 수 있지만 실제 백엔드에서는 **서로 다른 종류의 잘못된 상태를 서로 다른 경계가 막습니다.** 모든 검증을 Controller에 두면 API를 우회하는 쓰기 경로가 취약해지고, 모든 오류를 Domain에서만 검사하면 사용자가 훨씬 늦게 실패를 알게 될 수 있습니다.

### 먼저 무엇이 잘못된 것인지 구분한다

| 경계 | 대표 질문 | 실패 의미 |
| --- | --- | --- |
| 파싱·형식 | JSON을 읽을 수 있는가, 타입이 맞는가? | 요청 representation 자체가 잘못됨 |
| API 입력 | 필수 필드·길이·형식이 계약에 맞는가? | 외부 입력 계약 위반 |
| 권한 | 이 사용자가 이 동작을 수행할 수 있는가? | 호출 권한 부족 |
| Domain | 현재 상태에서 이 동작이 허용되는가? | 불변식·생명주기 위반 |
| DB | 저장 결과가 key/FK/UNIQUE/CHECK를 만족하는가? | 최종 저장 무결성 위반 |

`@NotBlank`만으로 "배송이 시작된 주문은 취소할 수 없다"를 표현하기 어렵고, 반대로 도메인 메서드만으로 중복 이메일의 동시 INSERT 경쟁을 완전히 막을 수도 없습니다.

### 사전 조회와 DB UNIQUE는 같은 역할이 아니다

```text
Request A                    Request B
SELECT email → 없음          SELECT email → 없음
        │                           │
        ├──────── INSERT            ├──────── INSERT
        │                           │
      성공                    UNIQUE constraint violation
```

애플리케이션의 사전 조회는 이미 사용 중인 이메일을 빠르게 알려 주는 UX에 도움이 됩니다. 하지만 확인과 INSERT 사이의 경쟁까지 원자적으로 닫지는 못합니다. 최종 중복 금지는 DB의 UNIQUE constraint가 담당하고, 애플리케이션은 그 위반도 정상적인 경쟁 결과로 번역할 수 있어야 합니다.

### 도메인 검증은 유효한 생성과 상태 전이를 지킨다

```java
Order order = Order.place(items); // 빈 주문 거부
order.cancel(reason);             // 현재 상태에서 취소 가능한지 검사
```

이 규칙이 API Request annotation에만 있다면 배치, import, 다른 application service가 같은 규칙을 우회할 수 있습니다. 도메인 불변식은 **어떤 진입점에서 호출하든 객체가 잘못된 상태가 되지 않게 하는 책임**을 가집니다.

### DB 오류를 그대로 API 오류로 노출하지 않는다

DB가 `unique violation`, `foreign key violation`을 반환했다고 해서 SQLSTATE나 내부 constraint 이름을 그대로 클라이언트에 보여 줄 필요는 없습니다. persistence/application 경계에서 제품 의미로 번역하고 API에서는 안정적인 HTTP 상태와 오류 코드로 제공할 수 있습니다.

```text
DB unique violation
       ↓
이메일 중복이라는 application 의미로 번역
       ↓
409 + EMAIL_ALREADY_USED
```

이 과정에서 원본 DB 오류는 로그·진단 정보로 보존할 수 있지만 외부 계약은 내부 구현 세부와 분리합니다.

### 같은 규칙이 여러 경계에 있어도 목적이 다를 수 있다

예를 들어 문자열 최대 길이를 API와 DB 양쪽에서 제한할 수 있습니다. API 검증은 빠르고 구체적인 피드백을 제공하고, DB 제한은 우회 쓰기 경로에서도 저장 가능한 데이터 범위를 지킵니다.

이런 중복은 반드시 제거해야 할 코드 냄새라기보다 **같은 사실을 서로 다른 실패 경계에서 보호하는 것**일 수 있습니다. 대신 길이 값처럼 동일해야 하는 기준이 서로 달라지지 않도록 source와 테스트를 관리해야 합니다.

검증 설계에서는 "어디 한곳에서 검사했는가"보다 **이 실패를 가장 잘 설명하고, 가장 확실하게 막을 수 있는 경계가 어디인가**를 묻는 것이 중요합니다.

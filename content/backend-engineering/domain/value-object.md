---
kind: concept
contentKey: backend.core.domain.value-object
topicContentKey: backend.core.domain
slug: value-object
title: Value object
summary: Value Object는 “작은 DTO”가 아닙니다. identity가 아니라 값의 의미와 유효성으로 동등성을 판단하는 객체입니다. 금액, 이메일, 기간, 좌표처럼 여러 곳에서 반복되는 규칙을 원시 타입으로 흩어놓지 않기 위해 사용합니다.
level: 1
status: PUBLISHED
displayOrder: 20
references: []
---
# Value object

Value Object는 “작은 DTO”가 아닙니다. **identity가 아니라 값의 의미와 유효성으로 동등성을 판단하는 객체**입니다. 금액, 이메일, 기간, 좌표처럼 여러 곳에서 반복되는 규칙을 원시 타입으로 흩어놓지 않기 위해 사용합니다.

### 원시 타입만 쓰면 규칙이 어디에 있는가

```java
void pay(BigDecimal amount, String currency) { ... }
```

`amount`가 음수인지, scale은 몇 자리인지, `currency`가 어떤 값인지 모든 호출자가 알아야 합니다. 이를 하나의 값으로 묶을 수 있습니다.

```java
Money price = Money.of(new BigDecimal("12000"), CurrencyUnit.KRW);
```

```text
입력 문자열/숫자
      │
      ▼
Value Object 생성 경계
      │  검증 + 정규화
      ▼
유효한 값만 Domain 안으로 이동
```

### 불변성이 중요한 이유

Value Object는 값이 같으면 서로 교체 가능해야 합니다. 생성 후 내부 값이 바뀌면 Map key나 equality에 예측하기 어려운 문제가 생깁니다. 그래서 보통 immutable하게 설계하고 변경은 새 객체 생성으로 표현합니다.

```java
Money discounted = price.multiply(new BigDecimal("0.9"));
```

### equality가 domain language가 된다

`EmailAddress`, `DateRange`, `Percentage`처럼 이름 있는 타입을 만들면 method signature가 규칙을 설명합니다. 단, 모든 `String`을 wrapper로 감싸면 객체 수와 변환 코드만 늘 수 있습니다. **반복되는 검증·계산·동등성 규칙이 실제로 있는 값**부터 도입하는 편이 낫습니다.

### DTO와 다른 점

DTO는 transport shape가 목적이라 field가 API 요구에 따라 바뀝니다. Value Object는 domain meaning이 목적입니다. JSON request에 `MoneyRequest`가 있고 Domain에 `Money`가 따로 있는 것도 자연스럽습니다.

| 구분      | Value Object   | DTO                        |
| --------- | -------------- | -------------------------- |
| 중심      | 의미와 규칙    | 전송 형태                  |
| equality  | 값 동등성 중요 | 보통 중요하지 않음         |
| mutable   | 보통 불변      | 필요에 따라                |
| 변경 이유 | domain rule    | API/serialization contract |

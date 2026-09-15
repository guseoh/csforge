---
kind: concept
contentKey: backend.core.domain.value-object
topicContentKey: backend.core.domain
slug: value-object
title: "값 객체(Value Object)"
summary: "식별자가 아니라 값의 조합과 규칙으로 의미와 동등성을 판단하고, 반복되는 검증·계산 규칙을 원시 타입 대신 하나의 불변 값으로 묶는 이유를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://learn.microsoft.com/ko-kr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/implement-value-objects"
    title: "Microsoft Learn: 값 객체 구현"
    referenceType: OFFICIAL
    language: ko
    displayOrder: 1
    relationNote: "식별자 없이 값 자체로 동등성을 판단하는 값 객체의 기본 성질을 확인한다."
---
# 값 객체(Value Object)

값 객체는 "작은 DTO"가 아닙니다. **어디에서 왔는지가 아니라 어떤 값을 가지고 있는지로 의미와 동등성을 판단하는 객체**입니다. 금액, 이메일 주소, 기간, 좌표처럼 값 자체에 검증과 계산 규칙이 붙는 경우 원시 타입 여러 개보다 하나의 의미 있는 타입으로 표현할 수 있습니다.

### 원시 타입만 사용하면 규칙이 호출자에게 흩어진다

```java
void pay(BigDecimal amount, String currency) { ... }
```

이 시그니처만으로는 `amount`가 음수여도 되는지, 소수 자릿수는 몇 자리인지, `currency`에 어떤 문자열이 허용되는지 알 수 없습니다. 여러 호출자가 같은 규칙을 각각 검사하기 시작하면 검증 방식도 쉽게 달라집니다.

이를 하나의 값으로 묶을 수 있습니다.

```java
Money price = Money.of(
        new BigDecimal("12000"),
        CurrencyUnit.KRW
);
```

```text
외부 입력
   │
   ▼
Money 생성 경계
   │ 검증 + 필요한 정규화
   ▼
유효한 Money만 도메인 안으로 이동
```

`Money`가 생성될 때 금액과 통화 규칙을 보장한다면 이후 코드는 두 원시 값을 따로 조합해 해석할 필요가 줄어듭니다.

### 값이 같으면 서로 바꿔 써도 같은 의미여야 한다

```text
Money(10_000, KRW)
Money(10_000, KRW)
```

두 값이 같은 규칙으로 만들어졌다면 어느 인스턴스인지보다 `10_000 KRW`라는 값이 중요합니다. 이것이 엔티티의 식별자 기반 동일성과 다른 점입니다.

값 객체는 보통 불변으로 만드는 편이 자연스럽습니다. 생성 후 내부 값이 바뀌면 값 동등성, `Map` key, 검증 결과가 시간에 따라 달라져 예측하기 어려워지기 때문입니다. 값이 달라져야 한다면 새 객체를 만드는 방식으로 표현할 수 있습니다.

```java
Money discounted = price.multiply(new BigDecimal("0.9"));
```

### 이름 있는 타입은 메서드 계약도 명확하게 만든다

`String email`, `String start`, `String end`처럼 범용 타입만 사용하면 호출자가 의미를 계속 기억해야 합니다. `EmailAddress`, `DateRange`, `Percentage` 같은 타입이 실제 규칙을 가지고 있다면 메서드 시그니처 자체가 더 많은 정보를 전달합니다.

그렇다고 모든 `String`이나 숫자를 값 객체로 감쌀 필요는 없습니다. **반복되는 검증·계산·동등성 규칙이 있고 이름 자체가 도메인 의미를 높여 주는 값**부터 도입하는 편이 낫습니다.

### DTO와 값 객체는 변경 이유가 다르다

| 구분 | 값 객체 | DTO |
| --- | --- | --- |
| 중심 | 도메인 의미와 규칙 | 외부 전송 형태 |
| 동등성 | 값 동등성이 중요 | 보통 핵심 책임이 아님 |
| 변경 | 보통 새 값 생성 | API 요구에 따라 변경 가능 |
| 변경 이유 | 비즈니스 규칙 | 요청/응답 계약, 직렬화 형식 |

예를 들어 API에는 `MoneyRequest`가 있고 도메인에는 별도의 `Money`가 있어도 자연스럽습니다. 둘은 모양이 비슷해 보여도 **하나는 전송 계약을, 다른 하나는 도메인 의미와 유효성을 소유**합니다.

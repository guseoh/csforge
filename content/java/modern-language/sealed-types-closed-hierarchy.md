---
kind: concept
contentKey: java.core.modern-language.sealed-types-closed-hierarchy
topicContentKey: java.core.modern-language
slug: sealed-types-closed-hierarchy
title: "Sealed Type과 닫힌 계층"
summary: "허용할 하위 타입을 제한해 닫힌 타입 계층을 만들고 누락 없는 처리를 설계한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: sealed class·permits와 직접 하위 타입의 제약 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: sealed interface와 허용 하위 타입 확인
---
# Sealed Type과 닫힌 계층

어떤 타입은 가능한 종류가 의도적으로 정해져 있습니다. 결제 결과가 `Success`, `Failure`, `Pending` 세 종류뿐이라면 아무 클래스나 새로운 결과 타입을 추가할 수 있게 열어 두는 것보다 **허용된 subtype을 코드에 명시하는 편이 모델의 의도를 더 정확하게 표현**합니다.

`sealed`는 상속을 완전히 금지하는 `final`과 달리, 상속은 허용하되 **어떤 직접 하위 타입이 가능한지 제한**합니다.

```java
sealed interface PaymentResult
        permits Success, Failure, Pending {
}

record Success(String paymentKey) implements PaymentResult { }
record Failure(String reason) implements PaymentResult { }
record Pending(String requestId) implements PaymentResult { }
```

코드를 읽는 사람도 `PaymentResult`의 직접적인 종류가 무엇인지 확인할 수 있습니다.

### 하위 타입은 다시 확장 정책을 정한다

sealed type의 직접 하위 타입은 자신이 다음 단계에서 어떻게 확장될지 명시합니다.

- `final`: 더 이상 하위 타입을 허용하지 않음
- `sealed`: 다음 단계의 허용 subtype을 다시 제한
- `non-sealed`: 그 지점부터 일반적인 확장을 다시 허용

즉 sealed hierarchy는 무조건 모든 단계를 닫는 기능이 아니라 **어디까지 닫고 어디서 다시 열지를 타입 구조에 표현하는 기능**입니다.

### 닫힌 계층은 exhaustive switch와 잘 맞는다

```java
String message = switch (result) {
    case Success success -> "성공: " + success.paymentKey();
    case Failure failure -> "실패: " + failure.reason();
    case Pending pending -> "처리 중: " + pending.requestId();
};
```

가능한 subtype 집합이 닫혀 있으면 컴파일러가 모든 경우를 처리했는지 확인하는 데 더 많은 정보를 사용할 수 있습니다. 이후 새로운 permitted subtype을 추가하면 기존 switch가 그 새 타입을 다루는지 다시 검토하게 만들 수 있습니다.

이 장점은 "default를 없애는 기술"보다 **새 variant가 생겼을 때 기존 처리 로직의 누락을 조기에 드러내는 것**에 가깝습니다.

### 열린 확장점과 닫힌 모델은 목적이 다르다

외부 플러그인이 계속 새로운 구현을 제공해야 하는 extension point라면 일반 interface가 더 자연스럽습니다. 반대로 애플리케이션 내부에서 가능한 상태나 결과 종류가 정해져 있고, 새 종류가 생기면 기존 처리 코드도 반드시 다시 봐야 한다면 sealed type이 잘 맞습니다.

```text
외부에서 구현이 계속 추가되어야 함
→ 열린 interface 후보

가능한 variant가 코드와 함께 통제되어야 함
→ sealed hierarchy 후보
```

### sealed가 객체의 상태나 행동을 자동으로 안전하게 만들지는 않는다

sealed가 보장하는 것은 **타입 계층의 확장 범위**입니다. 각 subtype의 내부 상태가 불변인지, 생성 값이 유효한지, 어떤 행동을 책임져야 하는지는 별도의 설계 문제입니다.

또 sealed hierarchy를 만들었다고 모든 동작을 pattern switch로 옮길 필요도 없습니다. subtype 자체가 책임져야 하는 행동이라면 다형성 메서드가 더 자연스러울 수 있고, 타입 계층 밖의 표현 변환처럼 여러 variant를 한 번에 해석해야 할 때 switch가 더 적합할 수 있습니다.

sealed type의 핵심은 간단합니다. **가능한 직접 subtype 집합을 언어 수준에서 제한해 닫힌 모델을 표현하고, 그 정보를 pattern matching과 exhaustive 처리에 활용할 수 있게 한다**는 점입니다.

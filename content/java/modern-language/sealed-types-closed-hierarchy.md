---
kind: concept
contentKey: java.core.modern-language.sealed-types-closed-hierarchy
topicContentKey: java.core.modern-language
slug: sealed-types-closed-hierarchy
title: "Sealed types and closed hierarchies"
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
# Sealed types and closed hierarchies

어떤 타입은 애초에 가능한 종류가 정해져 있습니다. 결제 처리 결과가 `Success`, `Failure`, `Pending` 세 종류뿐이라면, 프로젝트의 아무 클래스나 새로운 결과 타입을 구현할 수 있게 열어 두는 것보다 **허용된 종류를 코드에 명시하는 편이 모델의 의도를 더 잘 보여 줍니다.**

`sealed`는 이런 닫힌 타입 계층을 Java 언어 수준에서 표현합니다. 단순히 상속을 막는 `final`과 달리, "상속은 허용하되 어떤 직접 하위 타입이 가능한지는 제한한다"는 것이 핵심입니다.

### 허용된 하위 타입을 명시한다

```java
sealed interface PaymentResult
        permits Success, Failure, Pending {
}

record Success(String paymentKey) implements PaymentResult { }
record Failure(String reason) implements PaymentResult { }
record Pending(String requestId) implements PaymentResult { }
```

`PaymentResult`를 직접 구현할 수 있는 타입이 정해져 있으므로 코드를 읽는 사람도 가능한 결과의 범위를 알 수 있습니다.

직접 하위 타입은 다시 자신의 확장 정책을 정해야 합니다. 대표적으로 다음 세 방향이 있습니다.

- `final`: 더 이상 하위 타입을 만들 수 없음
- `sealed`: 다음 단계의 허용 타입을 다시 제한함
- `non-sealed`: 그 지점부터 일반적인 확장을 다시 허용함

즉 sealed hierarchy는 모든 단계가 무조건 닫힌 구조가 아니라 **어디까지 닫고 어디서 다시 열지를 명시적으로 결정하는 구조**입니다.

### 닫힌 계층이 switch와 잘 맞는 이유

가능한 타입이 정해져 있으면 분기할 때 누락 여부를 컴파일러가 더 잘 검사할 수 있습니다.

```java
String message = switch (result) {
    case Success success -> "성공: " + success.paymentKey();
    case Failure failure -> "실패: " + failure.reason();
    case Pending pending -> "처리 중: " + pending.requestId();
};
```

여기서 중요한 것은 `default`를 지우는 문법 기법 자체가 아닙니다. 새로운 permitted subtype이 추가되었을 때 **기존 분기 코드가 그 타입을 처리하지 않았다는 사실을 컴파일 시점에 발견할 가능성이 높아진다**는 점입니다.

이 특성은 상태나 결과 종류를 빠뜨리지 않고 다루어야 하는 백엔드 코드에서 특히 유용합니다.

### 열린 interface와 sealed interface는 목적이 다르다

일반 interface는 새로운 구현을 자유롭게 추가할 수 있다는 장점이 있습니다. 예를 들어 외부 플러그인이 계속 새로운 구현을 제공해야 하는 extension point라면 열려 있는 구조가 자연스럽습니다.

반대로 애플리케이션 내부의 명확한 상태 집합처럼 "새 종류가 생기면 기존 처리 코드도 반드시 다시 검토해야 한다"는 모델에는 sealed가 잘 맞습니다.

| 요구 | 일반 interface | sealed interface |
|---|---|---|
| 외부 구현을 자유롭게 추가 | 적합 | 제약이 큼 |
| 가능한 구현 집합을 통제 | 직접 규칙 필요 | 언어 수준으로 표현 |
| 모든 subtype 처리 여부 확인 | 구현에 따라 다름 | pattern switch와 결합 시 유리 |
| plugin 확장 지점 | 유리 | 보통 부적합 |

### `sealed`가 객체의 상태까지 안전하게 만드는 것은 아니다

타입 계층을 닫는 것과 각 객체가 올바른 상태를 가지는 것은 다른 문제입니다.

```java
final class Failure implements PaymentResult {
    private final List<String> reasons;
    // ...
}
```

`PaymentResult`가 sealed라고 해서 `reasons`가 자동으로 불변이 되거나 비즈니스 검증이 생기는 것은 아닙니다. sealed가 보장하는 것은 **직접 하위 타입을 누가 만들 수 있는가에 대한 타입 계층의 제약**입니다.

### 다형성과 pattern matching 중 무엇을 쓸지 생각한다

sealed type을 만들었다고 모든 동작을 `switch`로 작성해야 하는 것도 아닙니다. 동작이 각 subtype 자체의 책임이라면 다형성 메서드가 더 자연스러울 수 있습니다.

```java
sealed interface PaymentResult permits Success, Failure {
    String message();
}
```

반면 "외부 표현 형식으로 변환한다"처럼 타입 계층 밖의 관심사에서 여러 subtype을 한 번에 처리해야 한다면 exhaustive switch가 유용할 수 있습니다.

즉 sealed는 객체지향 다형성을 대체하는 기능이 아니라 **닫힌 계층이라는 사실을 표현하고 그 정보를 다른 언어 기능이 활용할 수 있게 하는 도구**입니다.

### 문제를 풀 때 확인할 것

1. 기준 타입이 `sealed`인지 확인한다.
2. 직접 허용된 subtype이 무엇인지 본다.
3. 각 subtype이 `final`, `sealed`, `non-sealed` 중 어떻게 확장 정책을 이어 가는지 확인한다.
4. switch가 모든 가능한 subtype을 처리하는지 본다.
5. 넓은 pattern이 앞에 있어 뒤의 구체적인 pattern을 가리는지 함께 확인한다.

### 면접에서 설명한다면

sealed type은 상속이나 구현을 완전히 금지하는 것이 아니라, 허용할 직접 하위 타입을 제한하는 기능이라고 설명하면 됩니다. 가능한 subtype 집합을 코드에 명시할 수 있고 pattern matching switch와 결합하면 누락된 subtype 처리를 컴파일러가 확인하는 데 도움이 됩니다. 다만 외부 확장이 중요한 API에는 오히려 제약이 될 수 있으므로 닫힌 도메인 모델에 적합한지 판단해야 합니다.

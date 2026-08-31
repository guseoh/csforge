---
kind: concept
contentKey: java.core.api-design.static-factory-method
topicContentKey: java.core.api-design
slug: static-factory-method
title: "정적 팩터리 메서드"
summary: "생성자 대신 이름 있는 정적 생성 메서드를 사용할 때 얻는 표현력과 인스턴스 제어 장점을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "JLS 8 Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 클래스 메서드와 생성자의 언어 규칙 확인
---
# 정적 팩터리 메서드

객체를 만드는 가장 기본적인 방법은 생성자를 호출하는 것입니다. 하지만 생성자 이름은 항상 클래스 이름이기 때문에 **왜 이 객체를 만드는지, 어떤 생성 규칙을 사용하는지**를 호출 코드에 표현하기 어려운 경우가 있습니다. 이런 상황에서 클래스가 `static` 메서드로 생성 진입점을 제공할 수 있습니다. 이를 흔히 **정적 팩터리 메서드(static factory method)** 라고 부릅니다.

### 이름으로 생성 의도를 드러낼 수 있다

```java
class Money {
    private final long amount;

    private Money(long amount) {
        this.amount = amount;
    }

    static Money won(long amount) {
        return new Money(amount);
    }
}
```

호출 코드를 비교해 보면 차이가 보입니다.

```java
new Money(10_000);  // 숫자의 의미를 생성자 이름만으로 알기 어려움
Money.won(10_000);  // 원 단위 Money라는 의도가 보임
```

정적 팩터리는 `of`, `from`, `valueOf`, `parse`처럼 의미 있는 이름을 붙일 수 있어서 서로 다른 생성 방식이 여러 개일 때 특히 유용합니다.

### 반드시 새 객체를 만들 필요도 없다

생성자는 호출할 때 객체 생성을 수행하지만 정적 메서드는 일반 메서드이므로 **기존 객체를 반환하거나 다른 구현 타입을 반환하는 정책**을 가질 수 있습니다.

```java
static Boolean valueOf(boolean value) {
    return value ? Boolean.TRUE : Boolean.FALSE;
}
```

호출자는 객체 생성 세부보다 “이 값에 해당하는 객체를 얻는다”는 계약에 의존합니다.

이 특성은 캐시, singleton, 하위 타입 반환 같은 구현 선택을 숨길 수 있지만, 실제로 그런 요구가 없는데 무조건 정적 팩터리로 감쌀 필요는 없습니다.

### 유효성 검사를 한곳에 모을 수 있다

```java
static Percentage of(int value) {
    if (value < 0 || value > 100) {
        throw new IllegalArgumentException();
    }
    return new Percentage(value);
}
```

생성자가 private이고 공개 생성 경로가 `of()` 하나라면 유효성 규칙을 한 경계로 모으기 쉽습니다. 다만 정적 팩터리만이 invariant를 지킬 수 있는 유일한 방법은 아닙니다. 공개 생성자에서도 충분히 검증할 수 있습니다.

### 단점도 있다

정적 팩터리를 너무 많이 만들면 어떤 메서드가 실제 생성 진입점인지 찾기 어려워질 수 있고, 생성자를 private으로 막으면 일반적인 클래스 상속이 제한될 수 있습니다. 또한 프레임워크가 특정 생성자 형태를 요구하는 경우에는 별도 고려가 필요합니다.

### 언제 선택할까

다음 질문에 하나 이상 분명한 답이 있을 때 정적 팩터리를 검토할 가치가 있습니다.

- 서로 다른 생성 의미에 이름이 필요한가?
- 새 객체를 매번 만들지 않아도 되는가?
- 실제 구현 클래스를 호출자에게 숨기고 싶은가?
- 생성 규칙이나 유효성 검사를 한 진입점으로 모으고 싶은가?

단순히 `new`를 없애는 것이 목적은 아닙니다. **호출자가 객체 생성 의도를 더 잘 이해하게 만드는가**가 핵심입니다.

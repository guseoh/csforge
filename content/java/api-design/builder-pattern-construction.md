---
kind: concept
contentKey: java.core.api-design.builder-pattern-construction
topicContentKey: java.core.api-design
slug: builder-pattern-construction
title: "Builder로 복잡한 생성 인자 다루기"
summary: "선택 인자가 많거나 이름 있는 구성 단계가 필요할 때 Builder가 주는 장점과 필수값 누락 위험을 함께 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "JLS 8 Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 클래스와 생성 API의 기본 언어 규칙 확인
---
# Builder로 복잡한 생성 인자 다루기

생성자의 매개변수가 많아지면 호출 코드를 읽기 어려워질 수 있습니다.

```java
new SearchOption("java", 1, 50, true, false, null);
```

이 코드만 보고 `true`, `false`, `null`이 무엇을 뜻하는지 바로 알기 어렵습니다. 이런 경우 각 값의 의미를 이름으로 드러내면서 객체를 단계적으로 구성하는 **Builder 패턴**이 도움이 될 수 있습니다.

### 선택 인자가 많을 때 읽기 쉬워진다

```java
SearchOption option = SearchOption.builder()
        .keyword("java")
        .page(1)
        .size(50)
        .includeClosed(true)
        .build();
```

호출 코드에 인자의 의미가 드러나고, 선택 값은 필요한 것만 지정할 수 있습니다. 특히 같은 타입의 매개변수가 여러 개 이어지는 생성자보다 실수를 줄이기 쉽습니다.

### Builder도 결국 유효한 객체를 만들어야 한다

Builder를 쓰면 필드 설정 메서드를 마음대로 호출할 수 있으므로 필수값 누락을 주의해야 합니다.

```java
SearchOption option = SearchOption.builder()
        .page(1)
        .build(); // keyword나 size가 필수라면 어떻게 할 것인가?
```

`build()`에서 필수값을 검증하거나 Builder 생성 시 필수값을 받는 등 **객체의 불변 조건을 지키는 설계**가 필요합니다.

```java
static Builder builder(String keyword) {
    return new Builder(keyword);
}
```

Builder가 있다는 이유로 “아무 순서로 아무 값이나 넣어도 된다”가 되어서는 안 됩니다.

### 단순한 객체에는 오히려 과하다

```java
record Point(int x, int y) {}
```

필수값 두 개뿐이고 의미가 명확한 객체에 Builder를 붙이면 파일과 코드가 늘어나기만 할 수 있습니다. 생성자나 정적 팩터리가 더 단순하고 읽기 좋은 경우가 많습니다.

### setter와 Builder는 목적이 다르다

Builder의 메서드가 setter처럼 보이더라도 보통은 **객체가 완성되기 전 임시 구성 단계**에 값을 모으고 마지막 `build()`에서 완성 객체를 만듭니다. 완성 객체 자체에 공개 setter를 잔뜩 두는 것과는 다릅니다.

불변 객체를 만들고 싶다면 Builder는 가변이어도 최종 객체는 불변으로 만들 수 있습니다.

### 선택 기준

Builder가 특히 유용한 경우는 다음과 같습니다.

- 선택 인자가 많다.
- 같은 타입의 인자가 많아 순서를 실수하기 쉽다.
- 생성 옵션을 이름으로 읽고 싶다.
- 최종 객체는 불변으로 유지하고 싶다.

반면 필수 인자가 몇 개뿐이면 생성자나 이름 있는 정적 팩터리가 더 낫습니다. 패턴 이름보다 **호출 코드와 객체의 유효성을 함께 개선하는가**를 기준으로 선택해야 합니다.

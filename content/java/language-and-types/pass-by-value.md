---
kind: concept
contentKey: java.core.language-types.pass-by-value
topicContentKey: java.core.language-types
slug: pass-by-value
title: Java의 매개변수 전달은 항상 값 전달이다
summary: 원시 값과 참조 값이 메서드 호출에서 어떻게 복사되는지 이해한다
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 메서드 호출과 인자 평가 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 참조 값의 언어 의미 확인
---
# Java의 값 전달

Java는 메서드에 인자를 전달할 때 항상 인자의 값을 복사합니다. 원시 타입이면 숫자나 불리언 값이 복사되고, 참조 타입이면 객체를 가리키는 참조 값이 복사됩니다. 호출된 메서드의 매개변수 변수와 호출자의 변수는 서로 다른 변수입니다.

```java
static void rename(StringBuilder builder) {
    builder.append("!");       // 같은 객체를 변경한다.
}

static void replace(StringBuilder builder) {
    builder = new StringBuilder("new"); // 매개변수 변수만 바뀐다.
}
```

`rename`은 복사된 참조 값으로 원래 객체에 접근하므로 호출자도 변경을 관찰합니다. `replace`는 복사된 참조 변수에 새 참조를 대입할 뿐 호출자의 변수에는 영향을 주지 않습니다. 이것을 “객체는 참조로 전달된다”라고 표현하면 `replace` 같은 동작을 설명할 수 없습니다.

## API 설계에서의 의미

메서드가 호출자의 상태를 바꾸게 하려면 가변 객체를 변경하거나, 새 값을 반환해 호출자가 대입하게 해야 합니다. `int` 같은 원시 값 자체를 메서드 안에서 바꿔 호출자의 변수를 바꾸는 방법은 없습니다. 여러 값을 갱신해야 한다면 변경 가능한 전달 객체보다 명확한 반환 타입이 부작용을 줄이는 경우가 많습니다.

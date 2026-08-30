---
kind: concept
contentKey: java.core.language-types.string-equality-immutability
topicContentKey: java.core.language-types
slug: string-equality-immutability
title: String의 불변성, 동등성, 문자열 풀
summary: String의 값 비교와 객체 정체성, 불변 객체 공유를 구분한다
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html"
    title: String API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: String의 불변성과 값 기반 메서드 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html"
    title: Object API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: equals 계약과 참조 동일성 구분
---
# String은 왜 안전하게 공유할 수 있는가

`String`은 불변(immutable) 객체입니다. 한 번 만들어진 문자열의 문자 시퀀스는 바뀌지 않습니다. `concat`, `replace` 같은 연산은 기존 객체를 수정하지 않고 새 `String`을 반환합니다.

```java
String original = "java";
String upper = original.toUpperCase(Locale.ROOT);
// original은 여전히 "java"다.
```

문자열의 내용을 비교할 때는 `==`가 아니라 `equals`를 사용합니다. `==`는 두 참조 값이 같은 객체를 가리키는지 비교하고, `equals`는 문자열 내용의 동등성을 비교합니다. 리터럴이나 `intern()` 때문에 `==`가 우연히 true가 되는 것은 값 비교의 근거가 될 수 없습니다.

## 문자열 풀과 구현 세부

JVM은 문자열 리터럴을 공유하는 문자열 풀을 사용하며, `String.intern()`은 풀의 대표 참조를 요청합니다. 하지만 애플리케이션의 모든 문자열이 자동으로 같은 객체가 된다고 가정해서는 안 됩니다. 문자열 풀은 공유와 메모리 효율을 위한 구현·API 메커니즘이고, `equals`는 애플리케이션의 값 비교 계약입니다.

불변성은 캐시 키나 설정 값 공유에 유리합니다. 문자열을 반복적으로 조립해야 한다면 `StringBuilder` 같은 가변 조립 도구를 사용한 뒤 최종 `String`을 만드는 편이 목적에 맞습니다.

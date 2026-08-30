---
kind: concept
contentKey: java.core.language-types.stringbuilder-mutable-text
topicContentKey: java.core.language-types
slug: stringbuilder-mutable-text
title: "StringBuilder와 mutable text construction"
summary: "반복 문자열 조립에서 StringBuilder와 String 불변성의 trade-off를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StringBuilder.html"
    title: "Java SE 25 StringBuilder API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: mutable character sequence API와 thread-safety 경계 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: string concatenation 표현식 규칙 확인
---
# StringBuilder와 mutable text construction

## 쉬운 진입

문장을 한 글자씩 붙일 때 매번 새 종이에 앞 문장 전체를 다시 쓰면 번거롭다. `String`은 불변
값이라 이런 식의 반복 조립이 많은 코드에서는 중간 객체가 많이 만들어질 수 있다. `StringBuilder`
는 내부 버퍼를 바꾸며 조립한 뒤 마지막에 String으로 꺼내는 도구다.

## 정확한 메커니즘

```java
StringBuilder builder = new StringBuilder();
for (int i = 1; i <= 3; i++) {
    if (i > 1) builder.append(',');
    builder.append(i);
}
String result = builder.toString(); // "1,2,3"
```

`append`는 builder의 mutable character sequence를 변경하고 `toString`은 결과 String 값을
얻는다. `StringBuilder`는 일반적으로 단일 thread의 임시 조립에 쓰며, 여러 thread가 같은
버퍼를 공유해야 한다면 동기화나 다른 설계를 검토한다. 단순한 `"a" + value` 한 번은 컴파일러가
적절히 처리할 수 있어 무조건 builder로 바꾸는 규칙은 아니다.

## 실전·면접 연결

반복문·대량 로그·응답 텍스트처럼 조립 횟수와 크기가 커지는 경로에서 builder의 의도를 드러낸다.
동시성 경계에서는 builder를 thread 간 공유하지 않고 지역 변수로 유지하는 편이 안전하다.
String의 불변성과 builder의 가변 버퍼를 혼동하지 않는다.

## 흔한 오해

- StringBuilder 자체가 immutable String은 아니다.
- String concatenation이 항상 느리거나 항상 builder로 컴파일된다고 단정할 수 없다.
- StringBuilder를 공유한다고 자동으로 thread-safe해지지 않는다.

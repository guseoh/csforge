---
kind: concept
contentKey: java.core.api-design.builder-pattern-construction
topicContentKey: java.core.api-design
slug: builder-pattern-construction
title: "Builder pattern construction"
summary: "선택 인자가 많은 생성에서 읽기 쉬운 구성과 invariant 검증을 함께 설계한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class와 constructor 선언 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: method invocation와 object 생성 expression 확인
---
# Builder pattern construction

## 쉬운 진입

옵션이 열 개쯤 되는 `Report`를 만들 때 인자 순서만 보고 timeout과 retry 횟수를 구분하기
어렵다. 어떤 옵션을 선택했는지도 이름으로 읽고 싶다면 중간 구성 object인 builder가 도움이
된다.

## 정확한 메커니즘

builder는 필수 값과 선택 값을 단계적으로 모은 뒤 마지막 `build()`에서 본 object를 만든다.
Java 언어가 제공하는 특별한 생성 문법은 아니므로 일반 class와 method로 구현되며, `build()`가
필수 값·범위·상호 배타 조건을 검증해야 한다.

```java
Report report = Report.builder("daily")
        .timeoutSeconds(3)
        .retryCount(2)
        .includeDetails(true)
        .build();
```

builder의 mutable configuration과 완성된 immutable object를 구분하면 구성 중 값이 바뀌어도
완성 후 상태가 안정적이다. builder 자체가 여러 thread에서 공유되어도 안전하다는 뜻은 아니다.

## 실전·면접 연결

선택 인자가 적으면 named static factory나 constructor overload가 더 읽기 쉽다. builder는
생성 비용과 코드량을 늘리므로 선택 인자가 많거나 같은 타입 인자가 반복되어 실수하기 쉬운
경우에 사용한다. 필수 값까지 setter처럼 뒤로 미루면 `build()` 전후 invalid state가 길어질
수 있으니 필수 값은 builder 생성 시 받거나 build에서 반드시 검증한다.

## 흔한 오해

- builder를 쓰면 invariant가 자동으로 보호되지 않는다.
- builder method chaining은 immutable builder나 thread-safe builder를 뜻하지 않는다.
- `build()`를 여러 번 호출할 수 있는지는 구현 계약이며 모든 builder가 같은 object를 반환하지 않는다.

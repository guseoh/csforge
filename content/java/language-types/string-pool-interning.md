---
kind: concept
contentKey: java.core.language-types.string-pool-interning
topicContentKey: java.core.language-types
slug: string-pool-interning
title: "String pool과 interning"
summary: "문자열 literal 재사용과 intern의 계약 및 구현 경계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html"
    title: "Java Language Specification 3장: Lexical Structure"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: string literal과 interned string 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html"
    title: "Java SE 25 String API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: intern 메서드 계약 확인
---
# String pool과 interning

## 쉬운 진입

프로그램 곳곳에서 같은 문자열 literal을 사용한다면 매번 같은 내용의 객체를 새로 만들 필요가
없다. Java는 literal을 공유할 수 있는 문자열 pool을 제공한다. 하지만 모든 문자열 생성 경로가
자동으로 같은 객체가 된다고 생각하면 `==` 판단에서 오류가 난다.

## 정확한 메커니즘

문자열 literal은 interned string 인스턴스를 참조한다. `new String`은 별도 객체를 만들고,
`intern()`은 같은 내용의 canonical pool 문자열을 반환한다.

```java
String literal = "java";
String copied = new String("java");
String pooled = copied.intern();

System.out.println(literal == copied); // false: new로 만든 객체
System.out.println(literal == pooled); // true: 같은 interned 문자열
System.out.println(literal.equals(copied)); // true: 내용 비교
```

문자열 pool이 JVM 내부에서 어떻게 저장·관리되는지와 메모리 비용은 구현 및 실행 환경의
관심사다. 언어 계약이 보장하는 literal/intern 관계와 특정 HotSpot의 pool 구현을 구분한다.

## 실전·면접 연결

일반적인 문자열 비교에는 항상 `equals`를 사용한다. `intern()`은 무조건 메모리를 절약하는
마법이 아니며, 많은 외부 입력을 무분별하게 intern하면 pool 관리 비용과 수명 문제가 생길 수
있다. identity 비교가 필요한 특수한 canonicalization 경계에서만 그 계약을 명시한다.

## 흔한 오해

- `==`가 literal에서 우연히 맞는다고 모든 String에 적용할 수 없다.
- pool은 String을 mutable하게 만드는 기능이 아니다.
- string pool의 물리 위치와 GC 세부를 Java 언어 보장처럼 설명하지 않는다.

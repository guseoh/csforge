---
kind: concept
contentKey: java.core.enum-modeling.enum-ordinal-name-persistence
topicContentKey: java.core.enum-modeling
slug: enum-ordinal-name-persistence
title: "enum의 ordinal, name과 영속화"
summary: "enum 선언 순서와 이름의 의미를 구분하고 안전한 저장 키를 선택한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html#ordinal()"
    title: "Enum.ordinal API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: ordinal이 선언 순서라는 점 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html#name()"
    title: "Enum.name API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 선언된 enum 식별자와 name 계약 확인
---
# enum의 ordinal, name과 영속화

## 쉬운 진입

`LOW`, `MEDIUM`, `HIGH`를 데이터베이스에 `0`, `1`, `2`로 저장하면 처음에는 간단해 보인다.
하지만 중간에 `URGENT`를 추가하거나 선언 순서를 바꾸는 순간 기존 숫자가 다른 의미가 될 수
있다. 사람이 읽는 안정적인 코드와 선언 위치는 서로 다른 문제다.

## 정확한 메커니즘

`ordinal()`은 enum 선언에서 0부터 시작하는 위치이고, Java API도 이를 영속화에 사용하지
말라고 명시한다. `name()`은 선언 식별자지만 이름을 리네임하면 저장 데이터와의 호환성이
깨질 수 있다. DB에는 명시적인 문자열 코드나 별도 안정 키를 저장하고, 마이그레이션 정책을
함께 관리하는 편이 안전하다.

```java
enum Priority {
    LOW("low"), HIGH("high");
    private final String code;
    Priority(String code) { this.code = code; }
    String code() { return code; }
}
```

JPA의 enum 매핑에서도 ordinal 저장과 문자열 저장의 선택은 스키마 계약이다. 문자열을
사용하더라도 이름 변경을 무심코 배포하면 안 되며, `code`처럼 명시적인 외부 표현이 필요하면
변환기를 통해 그 계약을 드러낸다.

## 실전·면접 연결

API JSON, 이벤트, DB가 같은 enum을 공유하더라도 각각의 외부 호환성 요구는 다를 수 있다.
내부 enum 이름을 그대로 노출하는 대신 안정적인 wire code를 정의하면 리팩터링과 다국어
표현을 분리할 수 있다.

## 흔한 오해

- `ordinal()`이 enum의 영구 ID라는 생각은 틀리다.
- `EnumType.STRING`은 순서 변경에는 강하지만 이름 변경까지 자동으로 호환해 주지는 않는다.
- 이름을 바꿀 수 없다는 뜻이 아니라, 저장 코드와 Java 식별자를 의식적으로 분리해야 한다는 뜻이다.

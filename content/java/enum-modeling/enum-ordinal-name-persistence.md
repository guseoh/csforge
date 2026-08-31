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

`LOW`, `MEDIUM`, `HIGH`를 설정 파일에 `0`, `1`, `2`로 저장하면 처음에는 간단해 보인다.
하지만 중간에 `URGENT`를 추가하거나 선언 순서를 바꾸는 순간 기존 숫자가 다른 의미가 될 수
있다. 사람이 읽는 안정적인 코드와 선언 위치는 서로 다른 문제다.

## 정확한 메커니즘

`ordinal()`은 enum 선언에서 0부터 시작하는 위치다. API는 EnumSet/EnumMap 같은 enum 기반
자료 구조를 위한 용도로 설명하며 영구 식별자를 보장하지 않는다. `name()`은 선언 식별자이므로
순서 변경에는 영향을 받지 않지만 이름 변경은 저장 문자열과의 호환성을 깨뜨릴 수 있다.
외부 형식에는 명시적인 코드를 두고, 기존 코드를 읽는 변환 규칙까지 함께 관리할 수 있다.

```java
enum Priority {
    LOW("low"), HIGH("high");
    private final String code;
    Priority(String code) { this.code = code; }
    String code() { return code; }
    static Priority fromCode(String code) {
        for (Priority value : values()) {
            if (value.code.equals(code)) return value;
        }
        throw new IllegalArgumentException("Unknown priority code: " + code);
    }
}
```

이 예시의 parser는 모르는 코드와 null을 거부한다. `LOW`를 `NORMAL`로 바꾸더라도 code를
`low`로 유지하면 기존 설정을 읽을 수 있다. 코드 자체를 바꿔야 한다면 구버전 alias를 허용할지,
기존 파일을 변환할지 정한다. 각 상수의 code가 고유한지도 확인해야 한다.

## 실전·면접 연결

설정 파일과 전송 문자열이 같은 enum을 표현해도 각각의 외부 호환성 요구는 다를 수 있다.
내부 enum 이름을 그대로 노출하는 대신 안정적인 wire code를 정의하면 리팩터링과 다국어
표현을 분리할 수 있다.

## 흔한 오해

- `ordinal()`이 enum의 영구 ID라는 생각은 틀리다.
- `name()`을 사용해도 이름 변경에 대한 alias나 자동 변환이 생기지는 않는다.
- 이름을 바꿀 수 없다는 뜻이 아니라, 저장 코드와 Java 식별자를 의식적으로 분리해야 한다는 뜻이다.

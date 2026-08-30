---
kind: concept
contentKey: java.core.api-design.minimize-accessibility-api-surface
topicContentKey: java.core.api-design
slug: minimize-accessibility-api-surface
title: "Minimize accessibility and API surface"
summary: "필요한 공개 범위만 열어 장기 호환성 비용과 변경 결합을 줄인다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html"
    title: "Java Language Specification 6장: Names"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 접근 제어와 scope 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: class/member modifier와 상속 가능성 확인
---
# Minimize accessibility and API surface

## 쉬운 진입

오늘은 편해서 public field를 열었는데 내일 그 field의 단위와 변경 방식을 바꾸려 하면 이미
많은 호출자가 내부 representation에 의존한다. 공개 API는 편의 기능이면서 미래 변경에 대한
약속이 된다.

## 정확한 메커니즘

Java의 `private`, package-private(무 modifier), `protected`, `public`은 member와 type의
접근 범위를 제한한다. 기본 선택은 가장 좁은 범위로 두고, 외부 사용 목적이 있을 때만 넓힌다.

```java
public final class Celsius {
    private final double value;

    public Celsius(double value) {
        if (value < -273.15) throw new IllegalArgumentException();
        this.value = value;
    }

    public double value() {
        return value;
    }
}
```

private field와 의도 중심 method는 상태 변경 경로를 줄이고 representation 교체 여지를
남긴다. 접근 제어는 Java source/type 경계이며 암호화, OS 파일 권한, 네트워크 인증과는 다른
문제다.

## 실전·면접 연결

public method를 하나 추가하는 것은 쉬워도 제거·의미 변경은 호환성 비용이 크다. framework가
필요로 하는 reflection/accessibility 예외와 일반 application API를 구분한다. package-private은
같은 package 내부 협력에 유용하지만 package를 무조건 안정적인 module boundary로 보장하는 것은
아니다.

## 흔한 오해

- public이라고 나쁜 설계이고 private이면 무조건 좋은 설계인 것은 아니다.
- getter를 전부 열면 캡슐화가 완성되는 것이 아니다. 반환 object의 변경 가능성도 확인한다.
- 접근 제어가 호출자의 악의적인 OS·네트워크 접근을 막는 보안 장치라는 뜻은 아니다.

---
kind: concept
contentKey: java.core.modern-language.record-data-modeling
topicContentKey: java.core.modern-language
slug: record-data-modeling
title: "Record data modeling"
summary: "record의 generated member와 shallow immutability를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: record declaration·component·constructor 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html"
    title: "Java SE 25 API: Record"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: record의 의미와 generated accessor 확인
---
# Record data modeling

## 쉬운 진입

이름과 좌표처럼 “이 값들은 하나의 data record다”를 표현할 때 record는 반복적인 field,
constructor, accessor, `equals/hashCode/toString` 선언을 줄여 준다. 하지만 record가 내부
객체까지 얼려 주는 것은 아니다.

## 정확한 메커니즘

```java
record Point(int x, int y) { }
Point p = new Point(2, 3);
System.out.println(p.x()); // field 이름의 accessor
```

component field는 final이고 record component에 대한 accessor가 생성된다. canonical
constructor를 직접 선언해 null·범위 같은 invariant를 검증할 수 있다. `record Box(List<String>
items)`는 list reference의 재대입은 막지만 list 자체의 mutation은 막지 않으므로 필요한
경계에서 `List.copyOf`를 만든다.

## 실전·면접 연결

record는 identity와 lifecycle보다 값 전달·data modeling에 적합하다. 상속을 통한 mutable
entity hierarchy, 지연 로딩이 필요한 persistence 모델에 기계적으로 적용하지 않는다. compact
constructor의 검증과 canonical assignment의 시점을 명확히 하면 생성 가능한 상태가 선명해진다.

## 흔한 오해

- record는 모든 component를 deep immutable하게 만들지 않는다.
- accessor 이름은 `getX()`가 아니라 보통 `x()`다.
- record component가 final이어도 참조 대상 객체의 상태 변경까지 금지하지 않는다.

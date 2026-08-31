---
kind: concept
contentKey: java.core.functional.lambda-capture-effectively-final
topicContentKey: java.core.functional
slug: lambda-capture-effectively-final
title: "Lambda capture and effectively final"
summary: "captured local의 재대입 규칙과 참조된 mutable object의 변경을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lambda capture와 effectively final 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 참조 타입과 변수 의미 확인
---
# Lambda capture and effectively final

## 쉬운 진입

메서드가 끝난 뒤에도 실행될 수 있는 lambda가 stack local 변수를 그대로 빌려 쓰면 lifetime이
복잡해진다. Java는 capture하는 local 변수의 값이 final이거나 effectively final이어야 한다.
다만 그 변수가 가리키는 객체까지 불변이어야 한다는 뜻은 아니다.

## 정확한 메커니즘

```java
int limit = 3;
Predicate<Integer> small = value -> value < limit; // capture 가능
// limit = 4; // 이미 capture되어 있으면 컴파일 오류

List<String> names = new ArrayList<>();
Consumer<String> add = names::add; // names reference는 재대입하지 않음
add.accept("Java");               // 객체의 상태 mutation은 가능
```

effective final은 선언 후 값이 바뀌지 않아 final을 붙여도 되는 local 변수라는 의미다. lambda가
참조하는 값은 capture 시점의 local binding과 연결되며, 외부 객체 mutation의 thread-safety나
불변성까지 보장하지 않는다.

## 실전·면접 연결

변하는 누적값이 필요하면 명시적인 collector, loop, 동시성 도구를 선택한다. 단일 원소 배열이나
mutable holder로 규칙을 우회하면 공유 상태와 가시성 문제가 더 어려워질 수 있다.

## 흔한 오해

- effectively final은 객체가 immutable하다는 뜻이 아니다.
- `final List`도 list 원소 추가는 가능할 수 있다.
- lambda를 실행하는 thread가 자동으로 안전한 snapshot을 만든다는 보장은 없다.

---
kind: concept
contentKey: java.core.language-types.boxing-unboxing-wrapper
topicContentKey: java.core.language-types
slug: boxing-unboxing-wrapper
title: "Boxing, unboxing과 wrapper"
summary: "원시 값과 wrapper 객체의 자동 변환, null 위험과 equality를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html"
    title: "Java Language Specification 5장: Conversions and Contexts"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: boxing·unboxing과 widening 조합의 언어 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html"
    title: "Java SE 25 Integer API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Integer wrapper API와 값 변환 메서드 확인
---
# Boxing, unboxing과 wrapper

## 쉬운 진입

컬렉션처럼 객체만 받을 수 있는 곳에 `int`를 넣을 때 Java가 잠시 `Integer` 상자로 감싸 줄 수
있다. 반대로 계산하려고 꺼낼 때는 상자 안의 숫자를 다시 원시 값으로 바꾼다. 편리하지만 상자가
비어 있는 `null`이면 꺼내는 순간 실패한다.

## 정확한 메커니즘

`boxing`은 primitive value를 wrapper 객체로 바꾸고, `unboxing`은 wrapper를 primitive로
바꾼다. 이 변환은 메서드 호출·대입·산술식의 문맥에서 암묵적으로 일어날 수 있다.

```java
Integer boxed = 10;       // boxing
int value = boxed + 2;    // unboxing 후 산술

Integer missing = null;
int fail = missing;       // NullPointerException: null unboxing
```

`==`는 피연산자의 타입과 변환 문맥을 함께 봐야 한다. `Integer a`, `Integer b`처럼 두 wrapper
reference를 그대로 비교하면 객체 identity를 비교한다. 반면 `Integer a`와 primitive `int`를
비교하는 문맥에서는 wrapper가 unboxing되어 숫자 비교가 일어날 수 있다. 일부 wrapper 값의 객체
재사용이나 cache는 일반적인 값 equality의 기준으로 삼지 않는다. wrapper끼리 숫자 값의 동등성을
비교하려면 `equals`나 `Objects.equals`를 사용하고, null 가능성을 API에 반영한다.

## 실전·면접 연결

`List<Integer>`의 합계를 구하거나 nullable 입력을 다룰 때 unboxing 지점을 의식한다. hot path에서
불필요한 boxing은 allocation과 GC 부담을 만들 수 있지만, 성능을 추측해 원시 타입으로 바꾸기
전에 API 계약과 측정을 함께 본다. DB나 JSON의 nullable 숫자를 primitive 필드에 바로 매핑하는
경우에도 누락 의미를 먼저 결정한다.

## 흔한 오해

- `Integer`는 `int`와 같은 객체 identity를 갖는 값 타입이 아니다.
- wrapper cache가 있다는 사실은 모든 `==` 결과를 예측하는 근거가 아니다.
- wrapper와 primitive가 섞인 `==` 비교에서는 unboxing이 일어날 수 있으므로 항상 identity 비교라고 볼 수 없다.
- `null` wrapper는 0으로 자동 대체되지 않는다.

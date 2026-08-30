---
kind: concept
contentKey: java.core.language-types.numeric-conversion-overflow
topicContentKey: java.core.language-types
slug: numeric-conversion-overflow
title: "숫자 변환과 overflow"
summary: "widening·narrowing 변환과 숫자 승격이 실제 계산 결과를 바꾸는 이유를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html"
    title: "Java Language Specification 5장: Conversions and Contexts"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: primitive widening·narrowing과 boxing 변환 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: numeric promotion과 산술 표현식 평가 확인
---
# 숫자 변환과 overflow

## 쉬운 진입

작은 컵에 큰 양의 물을 옮기면 일부가 넘친다. Java의 숫자 타입도 표현할 수 있는 범위가
다르다. 큰 타입으로 넓히는 변환은 대체로 값을 보존하지만, 작은 타입으로 좁히거나 제한된
정수 범위를 넘으면 결과를 그대로 믿을 수 없다.

## 정확한 메커니즘

`widening primitive conversion`은 더 넓은 표현 범위의 타입으로 바꾸는 변환이고, `narrowing`
은 명시적 cast가 필요한 경우가 많다. 정수 산술은 피연산자를 `int` 이상으로 승격해 계산하는
규칙도 있으므로 `short`나 `byte`끼리의 계산 결과가 다시 그 타입으로 나오지 않는다.

```java
int total = 2_000_000_000 + 2_000_000_000; // int overflow, 음수 결과
long safe = 2_000_000_000L + 2_000_000_000L;
byte wrapped = (byte) 130;                  // narrowing 후 표현 범위에 맞춘 결과
```

cast는 “값이 안전하다”는 확인이 아니라 변환을 개발자가 허용한다는 표현이다. 부동소수점은
정수 overflow와 다른 precision 문제를 가지므로 금액 계산에 같은 직관을 적용하지 않는다.

## 실전·면접 연결

카운터·파일 크기·시간 밀리초처럼 범위가 커질 수 있는 값은 중간 계산부터 `long`을 사용한다.
곱셈 전에 넓은 타입으로 올려야 하며, 입력 범위가 계약이라면 변환 전에 검증한다. 데이터가
잘리는 narrowing을 “컴파일만 되면 안전”하다고 취급하지 않는다.

## 흔한 오해

- `long result = intA * intB`는 곱셈 후 대입하므로 곱셈 자체가 `int` overflow를 낼 수 있다.
- 모든 숫자 변환이 자동 widening인 것은 아니다.
- narrowing cast는 overflow를 예외로 알려 주는 검증이 아니다.

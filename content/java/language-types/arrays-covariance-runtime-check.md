---
kind: concept
contentKey: java.core.language-types.arrays-covariance-runtime-check
topicContentKey: java.core.language-types
slug: arrays-covariance-runtime-check
title: "Arrays, covariance와 runtime store check"
summary: "참조형 배열의 covariance가 왜 런타임 저장 검사를 만드는지 이해한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 배열 타입과 참조 타입의 관계 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ArrayStoreException.html"
    title: "Java SE 25 ArrayStoreException API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 배열 저장 시 런타임 타입 검사 실패 확인
---
# Arrays, covariance와 runtime store check

## 쉬운 진입

`String[]` 상자를 더 넓은 `Object[]` 라벨로 바라볼 수 있으면 편리하다. 하지만 그 상자 안에
실제로는 String만 들어갈 수 있다면, `Integer`를 넣는 순간 Java가 잘못된 저장을 막아야 한다.
이것이 배열 covariance와 `ArrayStoreException`이 함께 나타나는 이유다.

## 정확한 메커니즘

참조형 배열은 공변적(covariant)이어서 `String[]`을 `Object[]` 변수에 대입할 수 있다. 컴파일러는
변수의 정적 타입 `Object[]`를 보고 대입문을 허용하지만, 배열 객체는 자신의 실제 컴포넌트 타입을
기억하고 저장 시 검사한다.

```java
String[] names = new String[1];
Object[] values = names;          // 배열 covariance로 허용
values[0] = Integer.valueOf(1);    // ArrayStoreException
```

```text
Object[] values ───────┐
                       ├── 실제 배열 객체: String[]
values[0] = Integer ───┘
             런타임 store check → 실패
```

배열은 생성 후 길이가 고정되고 원시형 배열(`int[]`)과 참조형 배열은 다르게 동작한다. 제네릭
컬렉션은 이런 배열 covariance를 그대로 따르지 않고 불변성(invariance)을 기본으로 하므로,
`List<String>`을 `List<Object>`로 취급할 수 없다.

## 실전·면접 연결

배열을 넓은 타입 API로 전달할 때는 실제 배열 원소 타입까지 고려한다. 여러 타입을 안전하게
담아야 하는 API라면 명시적인 복사나 적절한 컬렉션 경계를 사용한다. `Object[]`라는 선언 타입만
보고 모든 객체를 저장할 수 있다고 판단하지 않는 것이 핵심이다.

## 흔한 오해

- covariance는 배열 원소 타입을 런타임에 바꾸는 기능이 아니다.
- 컴파일 성공이 저장 성공을 보장하지 않는다.
- 모든 배열이 공변적인 것은 아니며 원시 배열과 참조 배열을 같은 규칙으로 설명할 수 없다.

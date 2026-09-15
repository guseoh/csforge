---
kind: concept
contentKey: java.core.language-types.arrays-covariance-runtime-check
topicContentKey: java.core.language-types
slug: arrays-covariance-runtime-check
title: "Arrays, covariance와 runtime store check"
summary: "참조형 배열을 더 넓은 배열 타입으로 다룰 수 있을 때 왜 런타임 저장 검사가 필요한지 코드 흐름으로 이해한다"
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
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html"
    title: "Java Language Specification 10장: Arrays"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 배열의 런타임 컴포넌트 타입과 저장 검사 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ArrayStoreException.html"
    title: "Java SE 25 ArrayStoreException API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: 배열에 잘못된 타입을 저장할 때 발생하는 예외 확인
---
# Arrays, covariance와 runtime store check

Java의 참조형 배열은 `String[]`을 `Object[]`로 다룰 수 있습니다. 문제는 **변수의 선언 타입이 `Object[]`라고 해서 실제 배열 객체까지 `Object[]`로 바뀌는 것은 아니라는 점**입니다. 실제 객체가 `String[]`이라면 그 배열은 여전히 `String`만 저장할 수 있습니다.

![Object[] 변수와 실제 String[] 배열의 런타임 저장 검사](/learning/java/array-covariance.svg)

### 배열의 공변성

`String`은 `Object`의 하위 타입이고, Java의 참조형 배열에서는 이 하위 타입 관계가 배열 타입에도 이어집니다.

```java
String[] names = {"kim", "lee"};
Object[] values = names;
```

이처럼 `String[]`을 `Object[]`로 취급할 수 있는 성질을 **공변성(covariance)** 이라고 합니다. 읽기만 보면 자연스럽습니다. `String[]`에서 꺼낸 모든 `String`은 `Object`이므로 다음 코드는 안전합니다.

```java
Object value = values[0];
```

문제는 넓어진 타입을 통해 값을 저장할 때 생깁니다.

### 왜 저장할 때 런타임 검사가 필요한가

```java
String[] names = new String[1];
Object[] values = names;

values[0] = Integer.valueOf(1);
```

`values`의 선언 타입은 `Object[]`입니다. 컴파일러는 `Integer`가 `Object`의 하위 타입이므로 이 저장 문장을 타입 규칙상 허용할 수 있습니다.

하지만 `values`가 가리키는 실제 배열 객체는 `new String[1]`로 만들어졌습니다. Java 배열 객체는 런타임에도 자신의 원소 타입을 유지하므로, 값을 저장할 때 실제 배열에 들어갈 수 있는 타입인지 검사합니다. `String[]`에 `Integer`를 넣으려 하면 `ArrayStoreException`이 발생합니다.

```text
Object[] values
      │
      │ 가리키는 실제 객체
      ▼
  String[]
      │
      ├─ String 저장   → 허용
      │
      └─ Integer 저장  → 런타임 검사 실패
                         → ArrayStoreException
```

즉 오류가 실행 중에 발견되는 이유는 **배열을 더 넓은 타입으로 바라보는 것은 허용하면서도 실제 배열 객체의 원소 타입은 지켜야 하기 때문**입니다.

| 상황 | 컴파일 시점 | 실행 시점 |
| --- | --- | --- |
| `String[]` → `Object[]` 대입 | 허용 | 정상 |
| `Object[]`를 통해 원소 읽기 | `Object`로 읽을 수 있음 | 실제 저장된 객체 반환 |
| 실제 `String[]`에 `String` 저장 | 허용 | 정상 |
| `Object[]` 참조를 통해 실제 `String[]`에 `Integer` 저장 | 선언 타입 기준으로 허용될 수 있음 | `ArrayStoreException` |

### 제네릭 컬렉션은 같은 문제를 더 일찍 막는다

```java
List<String> names = new ArrayList<>();
// List<Object> values = names; // 컴파일 오류
```

`List<String>`은 `List<Object>`의 하위 타입이 아닙니다. 제네릭 타입은 기본적으로 **불공변(invariant)** 이므로, 배열에서 저장 시점까지 남을 수 있는 일부 타입 오류를 컴파일 단계에서 막습니다.

이 차이를 “배열은 나쁘고 `List`는 좋다”로 단순화할 필요는 없습니다. 배열은 길이가 고정되어 있고 원시 타입 배열을 직접 표현할 수 있으며, 제네릭은 타입 소거와 와일드카드 같은 별도의 규칙을 가집니다. 여기서 잡아야 할 경계는 **참조형 배열의 공변성이 런타임 저장 검사를 필요하게 만들 수 있다**는 점입니다.

### API를 읽을 때는 선언 타입과 실제 배열 타입을 함께 본다

다음 메서드는 `Object[]`를 받지만 실제로 어떤 배열이 전달될지는 호출자가 결정합니다.

```java
static void putFirst(Object[] values, Object value) {
    values[0] = value;
}

String[] names = new String[1];
putFirst(names, 10); // 컴파일되지만 실행 중 실패
```

배열 타입 문제가 나오면 세 가지를 순서대로 확인하면 됩니다.

1. 변수의 컴파일 시점 타입은 무엇인가?
2. 그 변수가 실제로 가리키는 배열 객체는 어떤 타입으로 생성되었는가?
3. 저장하려는 값은 실제 배열의 원소 타입에 들어갈 수 있는가?

`Object[] values = new String[2]`라면 선언 타입은 `Object[]`이지만 실제 배열은 `String[]`입니다. 따라서 `Integer` 저장은 실행 중 실패합니다. 이 **선언 타입과 실제 배열 타입의 차이**가 배열 공변성을 이해하는 핵심입니다.

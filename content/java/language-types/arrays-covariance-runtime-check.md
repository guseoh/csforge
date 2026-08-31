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

Java 배열에서 헷갈리기 쉬운 지점은 **변수가 `Object[]`라고 해서 실제 배열도 `Object[]`인 것은 아니라는 점**입니다. `String[]` 배열을 `Object[]` 변수에 담을 수 있기 때문에 코드는 컴파일되지만, 실제 배열 객체는 여전히 `String`만 저장할 수 있는 배열입니다.

이 성질을 이해하면 `ArrayStoreException`이 왜 컴파일 오류가 아니라 실행 중에 발생하는지 설명할 수 있습니다. 배열 공변성 자체를 외우기보다 **컴파일러가 보는 타입과 실제 배열 객체가 가진 타입을 구분해서 추적하는 것**이 핵심입니다.

### `String[]`을 왜 `Object[]`로 받을 수 있을까

`String`은 `Object`의 하위 타입입니다. Java의 참조형 배열에서는 이 관계가 배열에도 이어집니다.

```java
String[] names = {"kim", "lee"};
Object[] values = names;
```

위 코드는 허용됩니다. `String[]`을 `Object[]`로 다룰 수 있는 이런 관계를 **공변성(covariance)** 이라고 합니다.

이 기능은 배열을 사용하는 오래된 API를 더 넓은 타입으로 작성할 수 있게 해 줍니다. 예를 들어 `Object[]`를 받는 메서드에 `String[]`를 전달할 수 있습니다. 하지만 여기에는 문제가 하나 생깁니다. `Object[]`라는 변수만 보면 `Integer`, `Member`, `String` 등 모든 `Object`를 저장할 수 있을 것처럼 보이기 때문입니다.

### 컴파일러가 허용한 저장이 실행 중 실패하는 이유

다음 코드를 순서대로 보겠습니다.

```java
String[] names = new String[1];
Object[] values = names;

values[0] = Integer.valueOf(1);
```

`values`의 **선언 타입**은 `Object[]`입니다. 그래서 컴파일러는 `Integer`가 `Object`이므로 `values[0] = ...` 문장을 타입 규칙상 허용할 수 있습니다.

하지만 `values`가 가리키는 실제 배열 객체는 처음에 `new String[1]`로 만들어졌습니다. Java 배열 객체는 자신이 어떤 원소 타입의 배열로 만들어졌는지 알고 있습니다. 따라서 값을 저장하는 순간 JVM은 저장하려는 값이 실제 배열의 원소 타입에 들어갈 수 있는지 확인합니다.

```text
변수의 선언 타입
Object[] values
       │
       │ 같은 배열을 가리킴
       ▼
실제 배열 객체
String[]
       │
       └─ Integer 저장 시도
              │
              ▼
      실제 원소 타입 확인
              │
              ▼
      String에 Integer를 저장할 수 없음
              │
              ▼
      ArrayStoreException
```

즉 오류가 늦게 발견되는 이유는 **배열을 더 넓은 타입으로 바라보는 것은 허용했지만, 실제 배열의 타입 안전성은 저장 시점에도 지켜야 하기 때문**입니다.

### 읽을 때와 쓸 때를 나눠 보면 더 쉽다

`String[]`을 `Object[]`로 바라보는 것 자체는 읽기에서는 큰 문제가 없습니다. `String`은 항상 `Object`이므로 배열에서 꺼낸 `String` 값을 `Object`로 받는 것은 안전합니다.

```java
String[] names = {"kim"};
Object[] values = names;

Object value = values[0]; // String은 Object이므로 안전
```

문제는 쓰기입니다. `Object[]`라는 넓은 타입을 통해 값을 넣으려 하면 컴파일러는 실제 배열이 `String[]`인지 알 수 없는 경우가 있습니다. 그래서 Java는 실행 중 실제 배열 타입을 검사합니다.

| 상황                             | 컴파일 시점                     | 실행 시점             |
| -------------------------------- | ------------------------------- | --------------------- |
| `String[]` → `Object[]` 대입     | 허용                            | 정상                  |
| `Object[]`에서 값 읽기           | `Object`로 읽을 수 있음         | 실제 저장된 객체 반환 |
| 실제 `String[]`에 `String` 저장  | 허용                            | 정상                  |
| 실제 `String[]`에 `Integer` 저장 | 선언 타입만 보면 허용될 수 있음 | `ArrayStoreException` |

문제를 풀 때는 단순히 왼쪽 변수 타입만 보지 말고 **그 변수가 실제로 어떤 배열 객체를 가리키는지**까지 따라가야 합니다.

### 제네릭 컬렉션은 왜 같은 문제를 다르게 막을까

배열과 `List`를 비교하면 공변성이 만드는 비용이 더 잘 보입니다.

```java
List<String> names = new ArrayList<>();
// List<Object> values = names; // 컴파일 오류
```

`List<String>`은 `List<Object>`의 하위 타입이 아닙니다. 기본적으로 이런 관계를 허용하지 않는 것을 **불공변(invariance)** 이라고 합니다. 따라서 배열에서 실행 중 발견되는 일부 타입 오류를 제네릭 컬렉션에서는 컴파일 단계에서 미리 막을 수 있습니다.

다만 이것을 “배열은 나쁘고 List는 좋다”로 외우면 안 됩니다. 배열은 길이가 고정되어 있고 원시 타입 배열을 직접 표현할 수 있으며, 제네릭은 타입 소거 등 별도의 규칙을 가집니다. 여기서 중요한 차이는 **참조형 배열은 공변성을 허용하기 때문에 저장 시 런타임 검사가 필요할 수 있다**는 점입니다.

### 실제 코드에서 어떤 점을 조심해야 할까

메서드가 `Object[]`처럼 넓은 배열 타입을 받는다면 호출자가 실제로 어떤 배열을 넘겼는지 고려해야 합니다. 메서드 내부에서 새로운 값을 저장한다면 특히 그렇습니다.

```java
static void putFirst(Object[] values, Object value) {
    values[0] = value;
}

String[] names = new String[1];
putFirst(names, 10); // 컴파일은 되지만 실행 중 실패
```

API가 여러 타입을 자유롭게 추가하고 수정해야 하는 컬렉션을 표현한다면 제네릭 컬렉션이 더 자연스러운 경우가 많습니다. 반대로 배열을 사용해야 한다면, 넓은 배열 타입으로 전달한 뒤 쓰기까지 허용하는 API인지 확인해야 합니다.

### 문제를 풀 때 확인할 세 가지

배열 타입 문제가 나오면 다음 순서로 추적하면 대부분 정리됩니다.

1. 변수의 컴파일 시점 타입은 무엇인가?
2. 그 변수가 실제로 가리키는 배열 객체는 어떤 타입으로 생성되었는가?
3. 저장하려는 값은 그 실제 배열의 원소 타입에 들어갈 수 있는가?

예를 들어 `Object[] values = new String[2]`라면 1번의 답은 `Object[]`, 2번의 답은 `String[]`입니다. 따라서 3번에서 `Integer`를 넣으려 하면 실행 중 실패합니다.

### 면접에서 설명한다면

“Java 배열이 공변적인데 어떻게 타입 안전성을 지키나요?”라는 질문에는 다음 흐름으로 설명하면 충분합니다.

참조형 배열은 `String[]`을 `Object[]`로 취급할 수 있도록 공변성을 허용합니다. 그래서 컴파일러가 `Object[]`를 통해 어떤 값을 저장하는 코드를 허용할 수 있습니다. 하지만 실제 배열 객체는 자신이 `String[]`이라는 원소 타입을 유지하므로, 저장할 때 실제 타입을 검사합니다. 맞지 않는 값을 넣으면 `ArrayStoreException`이 발생합니다. 제네릭 컬렉션은 기본적으로 이런 공변 관계를 허용하지 않아 많은 오류를 컴파일 시점에 막는다는 차이가 있습니다.

이 정도까지 설명할 수 있다면 공변성이라는 용어뿐 아니라 **왜 런타임 검사가 필요한지**까지 이해한 것입니다.

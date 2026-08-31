---
kind: concept
contentKey: java.core.language-types.string-immutability-equality
topicContentKey: java.core.language-types
slug: string-immutability-equality
title: "String의 불변성과 문자열 비교"
summary: "String이 불변 객체라는 뜻과 ==의 객체 동일성 비교, equals의 문자열 내용 비교를 구분한다"
level: 1
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html"
    title: "Java SE 25 API: String"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: String의 불변성 및 equals 계약 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.21.3"
    title: "JLS 15.21.3 Reference Equality Operators"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 참조 타입의 == 비교 의미 확인
---
# String의 불변성과 문자열 비교

`String`은 백엔드 코드에서 가장 자주 만나는 타입 중 하나입니다. 문자열 요청 값, 식별자, 로그 메시지, 경로 등 거의 모든 곳에서 사용됩니다. 그래서 **문자열 내용이 같은지 비교하는 것과 같은 String 객체인지 비교하는 것**을 확실히 구분해야 합니다.

### String이 불변이라는 뜻

`String` 객체는 한번 만들어진 뒤 그 문자열 내용을 바꾸는 API를 제공하지 않습니다.

```java
String name = "kim";
name.toUpperCase();

System.out.println(name); // kim
```

`toUpperCase()`가 기존 `String` 객체를 `"KIM"`으로 바꾼 것이 아닙니다. 결과 문자열이 필요하면 반환값을 받아야 합니다.

```java
name = name.toUpperCase();
System.out.println(name); // KIM
```

여기서 일어난 것은 기존 문자열 객체의 변경이 아니라 **`name` 변수에 다른 String 참조를 다시 넣은 것**입니다.

String의 불변성 덕분에 하나의 문자열 객체가 여러 곳에서 공유되더라도 누군가가 그 객체의 내용을 몰래 바꾸는 문제를 걱정하지 않아도 됩니다. 문자열 리터럴 재사용이나 해시 기반 자료구조에서도 이런 특성이 유용합니다.

### `==`와 `equals`는 질문 자체가 다르다

```java
String a = new String("java");
String b = new String("java");

System.out.println(a == b);      // false
System.out.println(a.equals(b)); // true
```

`a == b`는 두 참조 값이 같은 객체를 가리키는지 확인합니다. `String.equals`는 두 문자열의 내용이 같은지 비교합니다.

| 비교          | 묻는 내용            | 문자열 값 비교에 적합한가 |
| ------------- | -------------------- | ------------------------- |
| `a == b`      | 같은 객체인가        | 보통 아니오               |
| `a.equals(b)` | 문자열 내용이 같은가 | 예                        |

문자열 리터럴에서는 우연히 `==`가 `true`인 코드를 볼 수 있습니다.

```java
String a = "java";
String b = "java";
System.out.println(a == b); // true가 될 수 있는 대표적인 리터럴 재사용 사례
```

하지만 이것을 문자열 내용 비교 방법으로 사용하면 안 됩니다. 리터럴 재사용 여부와 상관없이 **논리적인 문자열 내용 비교의 의도는 `equals`로 표현**해야 합니다.

### null 가능성이 있으면 호출 방향도 중요하다

```java
String input = null;
// input.equals("ADMIN"); // NullPointerException

boolean admin = "ADMIN".equals(input); // false
```

상수 문자열이 기준이라면 상수 쪽에서 `equals`를 호출해 `null`을 안전하게 처리하는 방법이 있습니다. 또는 `Objects.equals(a, b)`를 사용하면 두 값의 `null` 여부를 포함해 비교할 수 있습니다.

### 백엔드 코드에서 흔한 실수

요청 파라미터나 DB에서 읽은 문자열을 `==`로 비교하면 테스트 환경에서는 우연히 동작하는 것처럼 보이다가 다른 생성 경로에서 실패할 수 있습니다.

```java
if (request.status() == "READY") { // 문자열 내용 비교 의도로는 잘못된 코드
    // ...
}
```

이런 값이 정해진 유한 집합이라면 문자열 비교를 반복하기보다 `enum` 같은 타입으로 모델링하는 편이 더 안전할 수도 있습니다. 그 판단은 enum 모델링 주제에서 다룹니다.

### 문제를 풀 때 확인할 것

문자열 코드에서는 먼저 “지금 같은 객체인지 묻는가, 같은 문자열 내용인지 묻는가?”를 확인합니다. 대부분의 비즈니스 로직은 내용 비교이므로 `equals`가 맞습니다. 그리고 메서드가 새 문자열을 반환하는지, 기존 문자열을 바꾸는지 구분하면 불변성 관련 문제도 쉽게 풀 수 있습니다.

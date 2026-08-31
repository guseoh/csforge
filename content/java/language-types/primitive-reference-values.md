---
kind: concept
contentKey: java.core.language-types.primitive-reference-values
topicContentKey: java.core.language-types
slug: primitive-reference-values
title: "원시 값과 참조 값"
summary: "Java 변수에 저장되는 원시 값과 참조 값을 구분하고 참조를 물리 메모리 주소와 동일시하지 않는다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 원시 타입과 참조 타입의 언어 규칙 확인
---
# 원시 값과 참조 값

Java 코드를 읽을 때 가장 먼저 구분해야 하는 것은 **변수에 어떤 종류의 값이 들어 있는가**입니다. `int`, `long`, `boolean` 같은 원시 타입 변수에는 그 타입의 값이 들어 있고, 클래스·배열·인터페이스 타입 변수에는 객체를 가리키는 **참조 값(reference value)** 이 들어 있습니다.

여기서 참조 값을 곧바로 “객체의 실제 메모리 주소”라고 외우면 이후 GC나 JVM을 공부할 때 혼란이 생깁니다. Java 언어가 보장하는 것은 참조를 통해 객체에 접근할 수 있다는 사실이지, 그 값이 운영체제나 하드웨어의 주소와 같은 형태라는 것은 아닙니다.

### 값을 복사하면 무엇이 달라질까

원시 타입은 값을 복사하면 두 변수가 서로 독립적인 값을 갖습니다.

```java
int a = 10;
int b = a;
b = 20;

System.out.println(a); // 10
System.out.println(b); // 20
```

`b = a`에서 `10`이라는 값이 복사됩니다. 이후 `b`에 다른 값을 넣어도 `a`는 바뀌지 않습니다.

참조 타입도 **값이 복사된다는 점은 같습니다.** 다만 복사되는 값이 객체 자체가 아니라 객체를 가리키는 참조 값입니다.

```java
class Member {
    String name;
}

Member first = new Member();
first.name = "kim";

Member second = first;
second.name = "lee";

System.out.println(first.name); // lee
```

`second = first`가 객체를 하나 더 만든 것은 아닙니다. 두 변수에 같은 객체를 가리키는 참조 값이 들어 있기 때문에 `second`를 통해 객체의 `name`을 바꾸면 `first`로 읽어도 변경된 값이 보입니다.

```text
first  ──┐
         ├──> Member 객체 { name = "lee" }
second ──┘
```

이 그림에서 중요한 것은 `first`와 `second`가 같은 변수라는 뜻이 아니라는 점입니다. **변수는 두 개지만, 두 변수의 참조 값이 같은 객체를 가리키고 있는 상태**입니다.

### `null`도 참조 값이다

참조 타입 변수에는 객체를 가리키는 값뿐 아니라 `null`도 들어갈 수 있습니다. `null`은 “현재 어떤 객체도 가리키지 않는다”는 특별한 참조 값입니다.

```java
Member member = null;
```

이 상태에서 `member.name`처럼 객체의 멤버에 접근하려 하면 가리키는 객체가 없기 때문에 `NullPointerException`이 발생합니다.

원시 타입 변수에는 `null`을 넣을 수 없습니다. `int age = null` 같은 코드는 컴파일되지 않습니다. `Integer`처럼 원시 타입을 객체로 감싼 래퍼 타입은 참조 타입이므로 `null`이 가능합니다.

### 변수와 객체를 같은 것으로 생각하지 말자

다음 두 문장을 구분해야 합니다.

- `Member member`는 `Member` 객체를 가리킬 수 있는 **변수**입니다.
- `new Member()`는 실제로 생성된 **객체**입니다.

변수의 수와 객체의 수는 같을 필요가 없습니다. 하나의 객체를 여러 변수가 가리킬 수도 있고, 변수가 `null`이라 아무 객체도 가리키지 않을 수도 있습니다.

이 구분은 메서드 인자 전달, `==`와 `equals`, 불변 객체, 컬렉션, 동시성까지 계속 사용됩니다.

### 문제를 풀 때는 두 질문으로 나눈다

참조형 코드가 헷갈리면 매 줄마다 다음을 확인합니다.

1. 지금 변수에 새 참조 값이 들어간 것인가?
2. 아니면 그 참조가 가리키는 객체의 상태가 바뀐 것인가?

```java
second = new Member(); // second 변수의 참조 값이 바뀜
second.name = "park"; // second가 가리키는 객체의 상태가 바뀜
```

둘은 전혀 다른 동작입니다. 이 차이를 이해하면 Java가 “객체를 전달한다”, “참조를 전달한다”는 식의 애매한 표현보다 실제 코드 상태를 정확하게 추적할 수 있습니다.

### 면접에서 설명한다면

Java의 원시 타입 변수는 원시 값을 저장하고, 참조 타입 변수는 객체나 배열을 가리키는 참조 값을 저장한다고 설명하면 됩니다. 참조 변수를 다른 변수에 대입하면 객체가 복제되는 것이 아니라 참조 값이 복사되므로 두 변수가 같은 객체를 가리킬 수 있습니다. 다만 Java 언어 수준에서 참조를 실제 물리 메모리 주소라고 단정해서는 안 됩니다.

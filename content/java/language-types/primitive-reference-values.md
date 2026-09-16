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
  - url: "https://d2.naver.com/helloworld/329631"
    title: "네이버 D2: Java Reference와 GC"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 2
    relationNote: 참조가 GC reachability와 어떻게 연결되는지 더 깊게 볼 때 참고
---
# 원시 값과 참조 값

Java에서 변수를 이해할 때 가장 먼저 구분할 것은 **변수 자체와 객체는 같은 것이 아니라는 점**입니다. `int`, `long`, `boolean` 같은 원시 타입 변수에는 해당 타입의 원시 값이 들어갑니다. 클래스·인터페이스·배열 타입 변수에는 객체나 배열에 접근하기 위한 **참조 값(reference value)** 이 들어갑니다.

![원시 값과 참조 값의 복사 비교](/learning/java/values-and-references.svg)

| 코드 | 변수에 들어 있는 것 | 대입할 때 복사되는 것 |
| --- | --- | --- |
| `int count = 10` | 정수 값 `10` | `10` |
| `boolean active = true` | 논리 값 `true` | `true` |
| `Member member = ...` | `Member` 객체를 가리키는 참조 값 | 그 참조 값 |
| `Member member = null` | 어떤 객체도 가리키지 않는 특별한 참조 값 | `null` |

이 차이는 이후 메서드 인자 전달, `==`와 `equals`, 불변 객체, 컬렉션 공유를 이해하는 바탕이 됩니다.

### 원시 타입은 값 자체가 복사된다

```java
int a = 10;
int b = a;
b = 20;

System.out.println(a); // 10
System.out.println(b); // 20
```

`b = a`에서 `a`가 가진 `10`이 `b`에 복사됩니다. 이후 `b`에 `20`을 넣어도 `a`는 바뀌지 않습니다. 두 변수는 처음부터 서로 다른 변수이고, 대입 직후에 값만 같았던 것입니다.

### 참조 타입도 변수에 들어 있는 값이 복사된다

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

`second = first`는 `Member` 객체를 하나 더 만들지 않습니다. `first`가 가진 **참조 값**을 `second`에 복사합니다. 따라서 변수는 둘이지만 두 변수가 같은 객체를 가리킬 수 있습니다.

```text
1) first = new Member()

first ───────▶ Member { name = null }

2) first.name = "kim"

first ───────▶ Member { name = "kim" }

3) second = first

first  ──┐
         ├────▶ Member { name = "kim" }
second ──┘

4) second.name = "lee"

first  ──┐
         ├────▶ Member { name = "lee" }
second ──┘
```

마지막 줄에서 바뀐 것은 `first`나 `second` 변수의 참조 값이 아닙니다. 두 변수가 함께 가리키는 **객체의 상태**가 바뀌었습니다.

### 참조 값의 재대입과 객체 상태 변경은 다르다

```java
second = new Member(); // second가 가진 참조 값을 교체
second.name = "park";  // second가 가리키는 객체의 상태를 변경
```

첫 번째 줄은 `second`라는 변수에 다른 참조 값을 넣습니다. 이때 `first`가 가진 참조 값은 바뀌지 않습니다. 두 번째 줄은 `second`가 현재 가리키는 객체 내부의 `name`을 변경합니다.

참조형 코드가 헷갈릴 때는 다음 두 질문을 분리하면 됩니다.

- 변수 안의 **참조 값 자체가 바뀌었는가?**
- 아니면 참조가 가리키는 **객체의 상태가 바뀌었는가?**

### `null`은 빈 객체가 아니다

```java
Member member = null;
```

`null`은 참조 타입이 가질 수 있는 특별한 값으로, 현재 어떤 객체도 가리키지 않음을 나타냅니다. 객체가 존재하는데 내용만 비어 있다는 뜻이 아닙니다. 따라서 다음 접근은 대상 객체가 없어 실패합니다.

```java
member.name = "kim"; // NullPointerException
```

원시 타입에는 `null`을 넣을 수 없습니다.

```java
// int age = null; // 컴파일 오류
Integer age = null; // Integer는 참조 타입이므로 가능
```

이 차이는 이후 박싱·언박싱에서 `null`인 래퍼 객체를 원시 값으로 꺼낼 때 `NullPointerException`이 발생하는 이유와도 연결됩니다.

### 참조 값은 Java가 보장하는 물리 메모리 주소가 아니다

학습할 때 참조를 화살표로 그리면 객체 관계를 이해하기 쉽습니다. 그러나 이 그림을 “변수에 RAM 주소 숫자가 그대로 저장된다”는 뜻으로 해석하면 안 됩니다.

Java 언어 명세가 보장하는 것은 참조 값을 통해 객체에 접근하고 객체 동일성을 다룰 수 있다는 **언어 수준의 의미**입니다. 객체가 JVM 내부에서 어떻게 표현되는지, GC 과정에서 이동하는지, 압축 객체 포인터를 사용하는지는 JVM 구현 계층의 문제입니다.

따라서 이 Concept에서 기억할 핵심은 간단합니다. **원시 타입이든 참조 타입이든 변수에는 값이 들어 있고, 대입은 그 값을 복사합니다. 참조 타입에서는 복사된 참조 값들이 같은 객체를 가리킬 수 있습니다.**

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
    title: "Java Reference와 GC"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 2
    relationNote: 참조가 GC reachability와 어떻게 연결되는지 더 깊게 볼 때 참고
---
# 원시 값과 참조 값

> **이 노트에서 잡을 것** — 변수와 객체를 같은 것으로 보지 않고, 대입이 일어날 때 **어떤 값이 복사되는지**를 코드와 그림으로 추적할 수 있어야 합니다. 참조 값은 객체에 접근하게 해 주는 값이지만 Java 언어가 보장하는 물리 메모리 주소는 아닙니다.

## 먼저 한 장으로 보기

![원시 값과 참조 값의 복사 비교](/learning/java/values-and-references.svg)

Java 변수는 타입에 따라 서로 다른 종류의 값을 가집니다. `int`, `long`, `boolean` 같은 원시 타입 변수에는 해당 타입의 **원시 값**이 들어갑니다. 클래스·인터페이스·배열 타입 변수에는 객체 또는 배열에 접근하기 위한 **참조 값(reference value)** 이 들어갑니다.

핵심은 참조 타입 변수 안에 객체 자체가 들어 있는 것이 아니라는 점입니다. 이 구분을 놓치면 메서드 인자 전달, `==`와 `equals`, 불변 객체, 컬렉션 공유, 동시성까지 연쇄적으로 헷갈립니다.

| 코드 | 변수에 들어 있는 것 | 대입할 때 복사되는 것 |
| --- | --- | --- |
| `int count = 10` | 정수 값 `10` | `10` |
| `boolean active = true` | 논리 값 `true` | `true` |
| `Member member = ...` | `Member` 객체를 가리키는 참조 값 | 그 참조 값 |
| `Member member = null` | 어떤 객체도 가리키지 않는 특별한 참조 값 | `null` |

## 원시 값은 값 자체가 복사된다

```java
int a = 10;
int b = a;
b = 20;

System.out.println(a); // 10
System.out.println(b); // 20
```

`b = a`에서 `a`가 가진 `10`이 `b`에 복사됩니다. 이후 `b`에 `20`을 다시 넣어도 `a`와는 관계가 없습니다.

변수는 처음부터 둘이었고, 복사 직후에 값만 같았던 것입니다.

## 참조 타입도 값이 복사된다

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

여기서 `second = first`는 `Member` 객체를 복제하지 않습니다. `first` 안의 **참조 값**을 `second`에 복사합니다.

그래서 변수는 두 개지만 두 참조 값이 같은 객체를 가리킵니다.

상태를 줄마다 추적하면 다음과 같습니다.

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

4번에서 바뀐 것은 `first`라는 변수가 아닙니다. 두 변수가 함께 바라보는 **객체의 상태**가 바뀌었습니다.

## 가장 많이 헷갈리는 두 동작

다음 두 줄은 생김새는 비슷하지만 완전히 다른 상태 변화를 만듭니다.

```java
second = new Member(); // 변수 second가 가진 참조 값을 교체
second.name = "park";  // second가 가리키는 객체의 상태를 변경
```

첫 번째 줄 이후에는 `first`와 `second`가 서로 다른 객체를 가리킬 수 있습니다. 두 번째 줄은 `second`가 현재 가리키는 객체 안의 `name`을 바꿉니다.

참조형 코드가 헷갈릴 때는 항상 이 질문을 먼저 던지면 됩니다.

1. **변수 안의 참조 값이 바뀌었는가?**
2. **아니면 참조가 가리키는 객체의 상태가 바뀌었는가?**

## `null`은 “빈 객체”가 아니다

```java
Member member = null;
```

`null`은 참조 타입이 가질 수 있는 특별한 값으로, 현재 어떤 객체도 가리키지 않는 상태를 표현합니다. 따라서 다음 접근은 대상 객체가 없어 실패합니다.

```java
member.name = "kim"; // NullPointerException
```

원시 타입에는 `null`을 넣을 수 없습니다.

```java
// int age = null; // 컴파일 오류
Integer age = null; // Integer는 참조 타입이므로 가능
```

이 차이는 이후 boxing/unboxing에서 `NullPointerException`이 생기는 이유와 직접 연결됩니다.

## 참조 값 ≠ 물리 메모리 주소

학습 초기에 참조를 화살표로 그리는 것은 매우 유용합니다. 다만 이 그림을 “변수에 RAM 주소 숫자가 그대로 저장된다”는 뜻으로 해석하면 안 됩니다.

Java 언어 명세가 보장하는 것은 참조 값을 통해 객체에 접근하고 동일성을 비교할 수 있다는 **언어 수준의 의미**입니다.

객체가 JVM 내부에서 어떤 형태로 표현되고 GC 중 이동할 수 있는지, 압축 객체 포인터를 사용하는지 같은 내용은 JVM 구현 계층의 문제입니다. 이 구현 세부까지 궁금하다면 아래 `함께 볼 자료`의 JVM/GC 자료로 확장하면 됩니다.

## 코드 읽기 연습

다음 코드가 끝난 뒤 객체가 몇 개인지 먼저 생각해 보세요.

```java
Member a = new Member();
Member b = a;
Member c = new Member();
b = c;
```

최종 상태는 다음과 같습니다.

```text
a ─────────▶ Member 객체 #1

b ──┐
    ├──────▶ Member 객체 #2
c ──┘
```

변수는 세 개, 생성된 객체는 두 개입니다. `b = c`는 객체를 생성하지 않고 `b`의 참조 값만 교체합니다.

## 연결해서 기억하기

- **pass-by-value**: 메서드 인자로 객체가 넘어가는 것이 아니라 이 참조 값이 복사됩니다.
- **`==`와 `equals`**: 참조 타입의 `==`는 같은 객체를 가리키는지를 묻습니다.
- **불변 객체와 방어적 복사**: 같은 가변 객체를 여러 참조가 공유할 수 있기 때문에 소유권 경계가 중요합니다.
- **GC**: 참조를 물리 주소로 단정하지 않아야 JVM의 객체 이동과 reachability를 자연스럽게 이해할 수 있습니다.

## 스스로 확인하기

다음 세 문장을 자신의 말로 설명할 수 있으면 이 Concept의 목표를 달성한 것입니다.

- `Member b = a`가 `Member` 객체를 하나 더 만드는 것이 아닌 이유
- `b = new Member()`와 `b.name = "kim"`이 만드는 상태 변화의 차이
- Java의 참조 값을 물리 메모리 주소라고 단정하면 안 되는 이유

### 면접에서 이렇게 나옵니다

#### Q. 원시 타입과 참조 타입의 대입은 무엇이 다릅니까?

둘 다 **변수가 가지고 있는 값을 복사한다**는 점은 같습니다. 원시 타입에서는 숫자·논리값 같은 원시 값이 복사되고, 참조 타입에서는 객체 자체가 아니라 **객체를 가리키는 참조 값**이 복사됩니다.

그래서 `Member b = a` 뒤에는 변수가 두 개여도 같은 객체를 바라볼 수 있습니다. 이후 `b = new Member()`처럼 변수를 재대입하는 것과 `b.name = "kim"`처럼 공유 객체의 상태를 바꾸는 것을 구분해서 설명하는 것이 핵심입니다.

#### Q. Java의 참조 값은 메모리 주소라고 보면 되나요?

학습 그림에서는 주소처럼 화살표로 표현할 수 있지만, **Java 언어 계약이 참조 값을 물리 메모리 주소라고 보장하지는 않습니다.** 언어 수준에서는 참조를 통해 객체에 접근하고 객체 동일성을 다룰 수 있다는 의미가 중요합니다.

실제 참조 표현, 객체 배치, 압축 포인터 같은 내용은 JVM 구현 영역입니다. 언어 계약과 HotSpot 같은 특정 JVM의 구현 세부를 섞지 않는 것이 좋은 답변입니다.

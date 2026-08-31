---
kind: concept
contentKey: java.core.language-types.pass-by-value
topicContentKey: java.core.language-types
slug: pass-by-value
title: "Java는 항상 값을 전달한다"
summary: "원시 값과 참조 값 모두 값이 복사되어 매개변수에 전달된다는 사실을 변수 재대입과 객체 상태 변경으로 구분한다"
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.4.5"
    title: "JLS 15.12.4.5 Create Frame, Synchronize, Transfer Control"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 메서드 호출 시 인자 값이 매개변수에 할당되는 규칙 확인
---
# Java는 항상 값을 전달한다

Java의 인자 전달을 설명할 때 “원시 타입은 값 전달, 객체는 참조 전달”이라고 말하면 오해가 생깁니다. Java는 **항상 값을 전달(pass-by-value)** 합니다. 참조 타입에서는 그 값이 객체 자체가 아니라 **객체를 가리키는 참조 값**이라는 점이 다를 뿐입니다.

이 차이를 가장 쉽게 확인하는 방법은 메서드 안에서 매개변수를 다른 값으로 다시 대입해 보는 것입니다.

### 원시 타입은 값이 복사된다

```java
int number = 10;
change(number);
System.out.println(number); // 10

static void change(int value) {
    value = 20;
}
```

`change(number)`를 호출하면 `number`의 값 `10`이 `value`라는 새로운 매개변수 변수에 복사됩니다. 메서드 안에서 `value = 20`을 실행해도 호출한 쪽의 `number` 변수에는 영향을 주지 않습니다.

### 참조 타입도 같은 규칙이다

```java
class Member {
    String name;
}

Member member = new Member();
member.name = "kim";

rename(member);
System.out.println(member.name); // lee

static void rename(Member value) {
    value.name = "lee";
}
```

결과만 보면 메서드가 호출자의 변수를 직접 바꾼 것처럼 보입니다. 하지만 실제로는 다음 상태입니다.

```text
호출 전
member ─────> Member{name="kim"}

호출 시 참조 값 복사
member ──┐
         ├──> Member{name="kim"}
value  ──┘

value.name 변경
member ──┐
         ├──> Member{name="lee"}
value  ──┘
```

`member`와 `value`는 서로 다른 변수입니다. 다만 두 변수에 복사된 참조 값이 같은 객체를 가리키므로, `value`를 통해 객체 상태를 바꾸면 `member`로 읽을 때도 변경된 상태가 보입니다.

### 매개변수를 다른 객체로 바꾸면 차이가 드러난다

```java
static void replace(Member value) {
    value = new Member();
    value.name = "park";
}

Member member = new Member();
member.name = "kim";
replace(member);

System.out.println(member.name); // kim
```

`value = new Member()`는 **매개변수 변수에 들어 있는 참조 값을 새 객체의 참조로 바꾼 것**입니다. 호출자의 `member` 변수는 여전히 원래 객체를 가리킵니다.

```text
member ─────> 기존 Member{name="kim"}

value  ─────> 새 Member{name="park"}
```

이 예제가 Java가 참조 자체를 호출자 변수와 공유하는 방식이 아니라는 사실을 잘 보여 줍니다.

### 배열과 컬렉션도 똑같다

배열이나 `List`를 메서드에 넘겨도 규칙은 같습니다. 매개변수에 참조 값이 복사됩니다. 그래서 메서드가 같은 컬렉션 객체에 `add`를 하면 호출한 쪽에서도 변경을 볼 수 있지만, 매개변수를 새 리스트로 바꾸는 것은 호출자의 변수에 영향을 주지 않습니다.

```java
static void add(List<String> values) {
    values.add("A"); // 같은 List 객체의 상태 변경
}

static void replace(List<String> values) {
    values = new ArrayList<>(); // 매개변수만 새 객체를 가리킴
}
```

### 실무에서 중요한 이유

이 규칙은 객체를 메서드에 전달했을 때 **누가 그 객체를 변경할 수 있는가**를 판단하는 기반이 됩니다. 참조 값이 복사되어도 같은 가변 객체를 공유하면 한쪽의 변경이 다른 쪽에서 보입니다. 그래서 불변 객체, 방어적 복사, 컬렉션 소유권 같은 설계가 중요해집니다.

### 면접에서 설명한다면

Java는 모든 인자를 값으로 전달합니다. 원시 타입은 원시 값이 복사되고, 참조 타입은 객체를 가리키는 참조 값이 복사됩니다. 그래서 메서드 안에서 같은 객체의 상태를 바꾸면 호출자도 변경을 볼 수 있지만, 매개변수 자체를 다른 객체로 재대입해도 호출자의 변수는 바뀌지 않습니다.

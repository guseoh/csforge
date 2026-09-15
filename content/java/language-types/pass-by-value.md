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

Java의 메서드 인자 전달 규칙은 하나입니다. **호출자가 가진 값이 매개변수라는 새 변수에 복사됩니다.** 원시 타입은 원시 값이 복사되고, 참조 타입은 객체를 가리키는 참조 값이 복사됩니다.

```text
호출자가 가진 값
        │
        │ 복사
        ▼
메서드의 매개변수
```

![Java pass-by-value에서 참조 값이 복사되는 흐름](/learning/java/pass-by-value.svg)

따라서 “원시 타입은 값 전달, 객체는 참조 전달”이라고 둘로 나누어 외우면 오히려 잘못 이해하기 쉽습니다. 참조 타입에서도 호출자의 변수 자체가 넘어가는 것이 아니라 **그 변수에 들어 있던 참조 값**이 복사됩니다.

### 원시 값이 전달될 때

```java
int number = 10;
change(number);
System.out.println(number); // 10

static void change(int value) {
    value = 20;
}
```

호출 직후에는 서로 다른 두 변수가 같은 값 `10`을 가지고 있습니다.

```text
number = 10
value  = 10
```

메서드 안에서 `value = 20`을 실행하면 매개변수만 바뀝니다. 호출자의 `number`는 다른 변수이므로 그대로입니다.

### 참조 값이 전달될 때

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

`member`와 `value`는 서로 다른 변수지만, 복사된 참조 값들이 같은 객체를 가리킵니다. 따라서 `value.name = "lee"`는 매개변수에 새 값을 넣는 동작이 아니라 **두 참조가 공유하는 객체의 상태를 변경**합니다.

```text
member ──┐
         ├──▶ Member { name = "kim" }
value  ──┘

value.name = "lee"

member ──┐
         ├──▶ Member { name = "lee" }
value  ──┘
```

### 매개변수를 재대입하면 차이가 선명해진다

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

`value = new Member()`는 메서드 내부의 **매개변수 `value`가 가진 참조 값만 교체**합니다. 호출자의 `member` 변수까지 바꾸지는 못합니다.

| 코드 | 바뀌는 대상 | 호출자에서 변화가 보이는가 |
| --- | --- | --- |
| `value = new Member()` | 매개변수의 참조 값 | 아니오 |
| `value.name = "lee"` | 두 참조가 가리키는 같은 객체의 상태 | 예 |

배열과 컬렉션도 같은 규칙을 따릅니다.

```java
static void add(List<String> values) {
    values.add("A");
}

static void replace(List<String> values) {
    values = new ArrayList<>();
}
```

`add`는 복사된 참조 값을 통해 같은 `List` 객체를 변경합니다. `replace`는 매개변수에 새 참조 값을 넣을 뿐이므로 호출자의 변수는 바뀌지 않습니다.

### 값 전달 규칙과 공유 가변 상태는 다른 문제다

pass-by-value는 Java의 호출 규칙입니다. 실제 설계에서 더 자주 문제가 되는 것은 **복사된 참조 값들이 같은 가변 객체를 공유한다는 사실**입니다.

```java
void updateProfile(Profile profile) {
    profile.changeNickname("neo");
}
```

호출자의 `profile` 변수에 들어 있는 참조 값은 그대로여도, 메서드가 같은 `Profile` 객체의 상태를 바꾸면 호출자에게 변경이 보입니다. 그래서 API를 설계할 때는 전달받은 객체를 변경해도 되는지, 컬렉션의 소유권을 공유해도 되는지, 필요하다면 방어적 복사나 불변 객체가 더 적합한지를 함께 판단해야 합니다.

#### 흔한 오해

**“객체는 pass-by-reference로 전달된다.”** 호출자의 참조 변수 자체가 전달된다면 메서드 안에서 `value = new Member()`를 실행했을 때 호출자의 변수도 새 객체를 가리켜야 합니다. 실제로는 그렇지 않습니다.

**“pass-by-value니까 메서드가 객체를 바꿀 수 없다.”** 복사된 참조 값이 같은 가변 객체를 가리킨다면 그 객체의 상태는 변경할 수 있습니다.

결국 코드를 추적할 때는 **매개변수의 참조 값을 재대입한 것인지, 그 참조가 가리키는 객체의 상태를 변경한 것인지**를 분리해서 보면 됩니다.

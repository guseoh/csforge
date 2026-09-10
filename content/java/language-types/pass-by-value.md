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

> **학습 목표** — 메서드 호출 시 호출자 변수와 매개변수가 서로 다른 변수라는 사실을 설명하고, 참조형 인자에서도 **참조 값이 복사되는 pass-by-value**임을 상태 그림으로 추적할 수 있어야 합니다.

## 먼저 결론부터

Java의 인자 전달 규칙은 하나입니다.

```text
호출자가 가진 값
        ↓ 복사
메서드 매개변수라는 새 변수
```

원시 타입은 원시 값이 복사되고, 참조 타입은 객체를 가리키는 **참조 값**이 복사됩니다. 그래서 “원시 타입은 값 전달, 객체는 참조 전달”이라고 둘로 나누어 외우면 오히려 잘못 이해하기 쉽습니다.

![Java pass-by-value에서 참조 값이 복사되는 흐름](/learning/java/pass-by-value.svg)

## 원시 타입: 값이 복사된다

```java
int number = 10;
change(number);
System.out.println(number); // 10

static void change(int value) {
    value = 20;
}
```

호출 시점의 상태를 변수 기준으로 보면 단순합니다.

```text
호출 전       호출 직후
number=10     number=10
              value =10
```

`value = 20`은 메서드 안의 매개변수만 바꿉니다. 호출자의 `number`는 다른 변수이므로 그대로입니다.

## 참조 타입: 참조 값이 복사된다

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

`member`와 `value`는 서로 다른 변수지만 같은 객체를 가리키는 참조 값을 가지고 있습니다. 그래서 `value.name = "lee"`는 매개변수를 바꾸는 것이 아니라 **공유된 객체의 상태를 변경**합니다.

```text
member ──┐
         ├──▶ Member { name = "kim" }
value  ──┘

value.name = "lee"

member ──┐
         ├──▶ Member { name = "lee" }
value  ──┘
```

## 재대입을 해 보면 규칙이 드러난다

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

`value = new Member()`는 **매개변수 `value`가 가진 참조 값을 교체**합니다. 호출자의 `member` 변수까지 바꾸지는 못합니다.

| 코드 | 바뀌는 대상 | 호출자에서 보이는가 |
| --- | --- | --- |
| `value = new Member()` | 매개변수의 참조 값 | 아니오 |
| `value.name = "lee"` | 두 변수가 함께 가리키는 객체 상태 | 예 |

이 두 줄을 구분할 수 있으면 Java 인자 전달의 핵심은 잡은 것입니다.

## 배열과 컬렉션도 예외가 아니다

```java
static void add(List<String> values) {
    values.add("A");
}

static void replace(List<String> values) {
    values = new ArrayList<>();
}
```

두 메서드 모두 `List`의 참조 값을 전달받습니다. `add`는 같은 `List` 객체를 변경하므로 호출자도 변경을 봅니다. `replace`는 매개변수에 새 참조를 넣을 뿐이라 호출자의 변수를 바꾸지 않습니다.

## 왜 실무에서 중요한가

pass-by-value 자체는 문법 규칙이지만, 실제 설계 문제는 **가변 객체를 공유하느냐**에서 생깁니다.

```java
void updateProfile(Profile profile) {
    profile.changeNickname("neo");
}
```

호출자가 가진 `profile` 변수는 바뀌지 않아도 같은 `Profile` 객체의 상태는 바뀝니다. 그래서 API를 설계할 때는 다음을 함께 봐야 합니다.

- 전달받은 객체를 메서드가 변경해도 되는가?
- 호출자가 계속 사용하는 컬렉션을 내부에서 수정해도 되는가?
- 소유권을 분리하려면 방어적 복사가 필요한가?
- 변경 자체를 허용하지 않으려면 불변 객체가 더 적합한가?

즉 **값 전달이라는 언어 규칙**과 **공유 가변 상태라는 설계 문제**를 분리해야 합니다.

## 흔한 오해

### “객체는 reference-by-reference로 전달된다”

아닙니다. 호출자의 참조 변수 자체를 메서드가 교체할 수 있다면 `value = new Member()`가 호출자의 변수까지 바꿔야 하지만 실제로 그렇지 않습니다.

### “pass-by-value니까 메서드가 객체를 못 바꾼다”

이것도 아닙니다. 복사된 참조 값이 같은 가변 객체를 가리키면 그 객체 상태는 변경할 수 있습니다.

## 스스로 확인하기

다음 코드에서 `member.name`의 최종 값을 말하고, 그 이유를 **변수의 참조 값**과 **객체 상태**를 나눠 설명해 보세요.

```java
static void change(Member value) {
    value.name = "lee";
    value = new Member();
    value.name = "park";
}

Member member = new Member();
member.name = "kim";
change(member);
```

정답만 맞히는 것보다 `value.name = "lee"`와 `value = new Member()`가 각각 무엇을 변경했는지 설명할 수 있는지가 중요합니다.

### 정답과 해설

최종 `member.name`은 **`"lee"`**입니다.

1. `value.name = "lee"`는 `member`와 `value`가 함께 가리키는 기존 객체의 상태를 바꿉니다. 따라서 호출자 `member`에서도 `lee`가 보입니다.
2. `value = new Member()`는 매개변수 `value`에 새 객체의 참조 값을 대입합니다. 이 재대입은 메서드 내부의 `value` 변수만 바꿉니다.
3. `value.name = "park"`는 새 객체의 상태를 바꾸므로 호출자가 가진 기존 객체에는 영향을 주지 않습니다.

따라서 호출이 끝난 뒤에는 호출자의 기존 객체가 `Member { name = "lee" }` 상태로 남습니다. 이 문제의 핵심은 **변수의 참조 값 교체**와 **참조가 가리키는 객체의 상태 변경**을 분리해서 추적하는 것입니다.

---
kind: concept
contentKey: java.core.object-model.immutability-defensive-copy
topicContentKey: java.core.object-model
slug: immutability-defensive-copy
title: "불변 객체와 방어적 복사"
summary: "가변 객체의 소유권이 외부와 공유될 때 생기는 문제를 이해하고 입력·출력 경계에서 복사해 불변성을 보호한다"
level: 2
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)"
    title: "Java SE 25 API: List.copyOf"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 수정 불가능한 List 복사 결과의 계약 확인
  - url: "https://tecoble.techcourse.co.kr/post/2020-05-18-immutable-object/"
    title: "Tecoble: 불변객체를 만드는 방법"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: "final 필드만으로 끝나지 않는 불변 객체 설계의 한국어 예시 보충. 글의 stack/heap·주소 비유는 Java 언어의 물리 배치 보장으로 읽지 않으며 실제 복사 계약은 Java 25 API를 기준으로 판단한다."
---
# 불변 객체와 방어적 복사

불변 객체를 만들 때 필드를 `final`로 선언하는 것만으로는 충분하지 않을 수 있습니다. 필드가 가변 객체를 가리키고 있고 그 객체를 외부와 공유한다면, 외부 코드가 객체 내부 상태를 우회해서 바꿀 수 있기 때문입니다.

### 외부의 가변 객체를 그대로 보관하면 상태가 공유된다

```java
class Team {
    private final List<String> members;

    Team(List<String> members) {
        this.members = members;
    }
}
```

호출자가 같은 리스트 참조를 계속 가지고 있다면 `Team`이 아무 동작도 하지 않아도 내부에서 보이는 상태가 바뀔 수 있습니다.

```java
List<String> names = new ArrayList<>();
names.add("kim");

Team team = new Team(names);
names.add("lee");
```

`names.add("lee")`는 호출자와 Team이 함께 보는 같은 목록을 바꿉니다. `Team.members`를 재대입하지 않아도 외부의 변경을 내부에서 관찰하게 됩니다.

문제는 참조 필드가 `final`인지가 아니라 **가변 객체의 소유권을 외부와 공유하고 있다는 점**입니다.

### 입력 경계에서 복사해 공유를 끊을 수 있다

```java
class Team {
    private final List<String> members;

    Team(List<String> members) {
        this.members = List.copyOf(members);
    }
}
```

이제 호출자가 원본 리스트의 구조를 바꾸더라도 `Team`이 보관한 리스트에는 그 변경이 그대로 전달되지 않습니다.

이 경우 목록 구조의 소유권을 분리했습니다. 단, 원소까지 새로 복제한 것은 아니고 `copyOf`가 모든 입력에서 새 객체를 할당한다는 뜻도 아닙니다.

`List.copyOf`는 이런 소유권 경계에 유용하지만 **깊은 복사(deep copy)** 를 해 주는 것은 아닙니다.

다음 독립 예제에서는 가변 원소를 사용해 목록 구조와 원소 참조의 경계를 나눠 확인합니다.

리스트 구조 자체는 수정할 수 없어도 원소인 `MutableMember` 객체는 양쪽 리스트에서 같은 객체를 가리킬 수 있습니다.

```java
class MutableMember {
    String name; // 원소 공유를 확인하기 위한 가변 예제
    MutableMember(String name) { this.name = name; }
}

MutableMember member = new MutableMember("kim");
List<MutableMember> original = new ArrayList<>(List.of(member));
List<MutableMember> shared = original;
List<MutableMember> copy = List.copyOf(original);
original.add(new MutableMember("lee"));
member.name = "park";
// shared는 [park, lee], copy는 [park]를 관찰합니다.
// copy.add(new MutableMember("x")); // 실행하면 UnsupportedOperationException
```

```csforge-viz
{
  "version": 1,
  "type": "java-object-model",
  "example": "defensive-copy",
  "title": "목록 구조 복사와 가변 원소 공유 6단계",
  "description": "원본 목록 L1과 shared는 같은 구조를 봅니다. copy의 후속 구조 변경은 막히지만 공유 원소 M의 name 변경은 보입니다. 마지막 add 실패는 기존 상태를 유지합니다."
}
```

따라서 불변성을 어디까지 보장하려는지에 따라 원소 타입의 가변성도 함께 봐야 합니다. `String` 원소는 불변이므로 앞의 Team 예제에서는 안전하게 공유할 수 있지만, 가변 원소에는 그 결론을 그대로 적용할 수 없습니다. `List.copyOf`는 입력 컬렉션이나 원소가 `null`이면 거부한다는 계약도 가지므로, 도메인이 null을 허용한다면 그 정책과 맞는 복사 방식을 선택해야 합니다.

### 반환 경계에서도 내부 가변 상태를 노출하지 않는다

내부에서 `ArrayList` 같은 가변 컬렉션을 유지하면서 그대로 반환하면 외부가 내부 상태를 직접 바꿀 수 있습니다.

```java
List<String> members() {
    return List.copyOf(members);
}
```

내부 컬렉션 자체가 이미 수정 불가능한 값이라면 그대로 반환할 수도 있습니다. 읽기 전용 뷰(view)를 제공하는 방법도 있지만, 뷰는 원본의 이후 변경을 반영할 수 있으므로 복사와 같은 의미는 아닙니다.

### 방어적 복사는 필요한 경계에서 사용한다

모든 객체를 무조건 복사하면 비용과 코드가 늘어납니다. 방어적 복사는 특히 다음과 같은 경우에 가치가 큽니다.

- 외부에서 받은 가변 객체를 내부 상태로 오래 보관할 때
- 불변 객체라는 계약을 제공해야 할 때
- 반환한 컬렉션을 외부가 수정하면 내부 규칙이 깨질 때
- 데이터 무결성이 중요한 경계를 넘을 때

반대로 원소까지 모두 불변이고 공유가 안전하다면 무조건 깊은 복사를 할 필요는 없습니다.

`final`, 수정 불가능한 컬렉션, 방어적 복사는 서로 다른 역할을 합니다. **`final`은 참조의 재대입을 제한하고, 수정 불가능한 컬렉션은 그 컬렉션 구조의 변경을 막으며, 방어적 복사는 가변 상태의 소유권 공유를 끊기 위해 사용합니다.** 이 차이를 구분하면 불변 객체의 경계를 훨씬 정확하게 설계할 수 있습니다.

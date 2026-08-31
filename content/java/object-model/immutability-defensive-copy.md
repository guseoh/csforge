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
---
# 불변 객체와 방어적 복사

불변 객체를 만들 때 필드를 `final`로 선언하는 것만으로는 충분하지 않을 수 있습니다. 필드가 가변 객체를 가리키고 있고 그 객체를 외부와 공유한다면, 외부 코드가 객체 내부 상태를 우회해서 바꿀 수 있기 때문입니다.

### 외부에서 받은 List를 그대로 보관하면 생기는 문제

```java
class Team {
    private final List<String> members;

    Team(List<String> members) {
        this.members = members;
    }
}
```

겉으로 보면 `members` 필드는 `final`입니다. 하지만 호출자가 같은 리스트 참조를 계속 가지고 있습니다.

```java
List<String> names = new ArrayList<>();
names.add("kim");

Team team = new Team(names);
names.add("lee");
```

`Team`이 직접 아무 메서드도 호출하지 않았는데 내부에서 바라보는 멤버 목록이 바뀝니다.

```text
호출자 names ──┐
               ├──> 같은 ArrayList
Team.members ──┘
```

문제는 참조 자체가 `final`인지가 아니라 **가변 객체의 소유권을 외부와 공유하고 있다는 점**입니다.

### 입력 경계에서 복사해 소유권을 끊는다

```java
class Team {
    private final List<String> members;

    Team(List<String> members) {
        this.members = List.copyOf(members);
    }
}
```

`List.copyOf`는 결과 리스트를 호출자가 수정할 수 없는 형태로 제공합니다. 원본 리스트가 이후 변경되어도 `Team`이 보관하는 리스트와 직접 같은 가변 상태를 공유하지 않도록 만들 수 있습니다.

다만 `List.copyOf`를 **깊은 복사(deep copy)** 로 오해하면 안 됩니다.

```java
List<MutableMember> members = ...;
List<MutableMember> copy = List.copyOf(members);
```

리스트 구조 자체는 수정할 수 없어도 그 안의 `MutableMember` 객체가 가변이라면 해당 객체의 상태는 바뀔 수 있습니다. 불변성의 깊이는 원소 타입까지 봐야 합니다.

### 반환할 때도 내부 가변 상태를 그대로 노출하지 않는다

```java
List<String> members() {
    return members;
}
```

내부 리스트가 이미 수정 불가능한 리스트라면 그대로 반환해도 외부가 구조를 변경할 수 없습니다. 하지만 내부에서 `ArrayList`를 유지해야 한다면 그대로 반환하는 것은 위험합니다.

```java
List<String> members() {
    return List.copyOf(members);
}
```

또는 API의 필요에 따라 읽기 전용 view를 고려할 수 있지만, view는 원본 변경을 반영할 수 있으므로 “복사”와 같은 의미가 아닙니다.

### 방어적 복사는 언제 가치가 큰가

모든 객체를 무조건 복사하면 비용과 코드가 늘어납니다. 특히 큰 컬렉션을 자주 복사하면 실제 성능 영향이 생길 수 있습니다.

그래서 다음 상황에서 우선 검토합니다.

- 외부에서 받은 가변 객체를 장기간 내부 상태로 보관할 때
- 불변 객체라는 계약을 제공할 때
- 반환한 컬렉션을 외부가 바꾸면 내부 규칙이 깨질 때
- 보안이나 데이터 무결성이 중요한 경계를 넘을 때

### 백엔드 모델링에서 왜 중요할까

DTO에서 받은 `List`를 도메인 객체가 그대로 보관하거나, 엔티티의 내부 컬렉션을 그대로 반환하는 코드는 소유권 경계를 흐릴 수 있습니다. “누가 이 값을 변경할 수 있는가?”를 명확하게 해야 예측 가능한 상태 변경을 만들 수 있습니다.

불변 객체는 동시성에서도 공유하기 쉽다는 장점이 있지만, 불변성을 만들었다고 모든 thread-safety 문제가 자동으로 해결되는 것은 아닙니다. 여러 객체 사이의 복합 상태 변경은 여전히 별도 동기화가 필요할 수 있습니다.

### 문제를 풀 때 확인할 것

`final`이 붙었는지만 보지 말고 다음을 확인합니다.

1. 필드가 가리키는 객체 자체는 가변인가?
2. 그 객체의 참조를 외부도 가지고 있는가?
3. 복사한 것은 컨테이너 구조뿐인가, 원소 객체까지 독립적인가?
4. 반환값을 통해 내부 상태를 다시 변경할 수 있는가?

이 네 가지를 구분하면 얕은 불변성과 실제 소유권 보호를 혼동하지 않게 됩니다.

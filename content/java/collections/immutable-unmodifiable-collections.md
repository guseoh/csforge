---
kind: concept
contentKey: java.core.collections.immutable-unmodifiable-collections
topicContentKey: java.core.collections
slug: immutable-unmodifiable-collections
title: "변경 불가 컬렉션과 unmodifiable view"
summary: "List.of·copyOf처럼 수정할 수 없는 컬렉션과 원본을 감싼 unmodifiable view의 변경 전파·소유권 차이를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#of()"
    title: "Java SE 25 API: List.of"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: unmodifiable List factory 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)"
    title: "Java SE 25 API: List.copyOf"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: unmodifiable copy 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html#unmodifiableList(java.util.List)"
    title: "Java SE 25 API: Collections.unmodifiableList"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: backing list view 계약 확인
---
# 변경 불가 컬렉션과 unmodifiable view

컬렉션을 “수정할 수 없다”는 결과만 보고 모두 같은 구조라고 생각하면 소유권 문제를 놓칠 수 있습니다. 특히 `List.copyOf`와 `Collections.unmodifiableList`는 둘 다 호출자가 `add`하지 못하게 만들 수 있지만 **원본과의 관계가 다릅니다.**

### List.of는 처음부터 변경 불가 컬렉션을 만든다

```java
List<String> roles = List.of("USER", "ADMIN");
// roles.add("MANAGER"); // UnsupportedOperationException
```

`List.of`가 반환하는 List는 수정 연산을 지원하지 않습니다. null 원소도 허용하지 않습니다.

### unmodifiableList는 원본을 감싸는 view다

```java
List<String> source = new ArrayList<>();
source.add("A");

List<String> view = Collections.unmodifiableList(source);
source.add("B");

System.out.println(view); // 원본 변경이 보임
```

`view.add()`는 막히지만 원본 `source`가 변경되면 view에서도 그 변경을 볼 수 있습니다.

```text
source ─────> 실제 가변 List
                 ▲
                 │
unmodifiable view┘
```

즉 “view를 수정할 수 없다”와 “데이터가 절대 변하지 않는다”는 같은 말이 아닙니다.

### List.copyOf는 원본 변경과 분리할 수 있다

```java
List<String> snapshot = List.copyOf(source);
source.add("C");
```

일반적으로 `snapshot`은 이후 source 변경을 따라가는 view가 아니라 입력 원소를 기반으로 한 변경 불가 List입니다. 다만 입력이 이미 적절한 unmodifiable List라면 API가 같은 인스턴스를 재사용할 수 있으므로 **반드시 새 객체를 만든다**고 말하면 안 됩니다.

또 `List.copyOf`는 원소 객체 자체를 깊게 복사하지 않습니다.

```java
List<MutableMember> copy = List.copyOf(members);
```

List 구조는 바꿀 수 없어도 `MutableMember`의 상태가 변하면 관찰 결과는 달라질 수 있습니다.

### 불변성과 소유권을 함께 본다

내부 컬렉션을 외부에 반환할 때 단순 unmodifiable view가 충분한지, snapshot copy가 필요한지는 원본이 이후 변해도 되는지에 따라 달라집니다.

| 방식 | 호출자가 구조 수정 | 원본 변경 반영 | 깊은 복사 |
|---|---|---|---|
| `List.of` | 불가 | 별도 원본 없음 | 아님 |
| `List.copyOf` | 불가 | 일반적으로 원본 변경과 분리 | 아님 |
| `unmodifiableList(source)` | 불가 | 반영됨 | 아님 |

문제에서는 “수정 메서드가 막힌다”만 보지 말고 **누가 실제 backing data를 소유하고 변경할 수 있는지**까지 추적해야 합니다.

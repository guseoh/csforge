---
kind: concept
contentKey: java.core.collections.hashset-set-semantics
topicContentKey: java.core.collections
slug: hashset-set-semantics
title: "HashSet과 중복 판단"
summary: "Set의 중복 없음 의미가 equals와 hashCode 계약을 통해 HashSet에서 어떻게 구현되는지 이해한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html"
    title: "Java SE 25 API: HashSet"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: HashSet의 Set 계약과 성능 특성 확인
---
# HashSet과 중복 판단

`Set`은 중복 원소를 허용하지 않는 추상화입니다. 하지만 “중복”이라는 말은 객체의 모든 필드가 우연히 같은지를 자동으로 비교한다는 뜻이 아닙니다. `HashSet`에서는 원소 타입의 **equals와 hashCode 계약**이 중복 판단에 직접 연결됩니다.

```java
Set<MemberKey> keys = new HashSet<>();
keys.add(new MemberKey(1L));
keys.add(new MemberKey(1L));
```

두 객체가 서로 다른 인스턴스여도 equals가 `true`이고 hashCode 계약도 맞으면 Set에서는 같은 원소로 판단할 수 있습니다.

### add의 반환값도 유용하다

`Set.add`는 집합이 실제로 변경되었는지 boolean으로 알려 줍니다.

```java
if (!seen.add(id)) {
    System.out.println("이미 처리한 id");
}
```

먼저 `contains`하고 다시 `add`하는 것보다 의도를 간결하게 표현할 수 있는 경우가 있습니다.

### hashCode만 같다고 중복은 아니다

hash 충돌은 발생할 수 있으므로 같은 hashCode를 가진 서로 다른 객체도 Set에 함께 존재할 수 있습니다. 최종 중복 판단에는 equals가 중요합니다.

반대로 equals인 객체의 hashCode가 다르면 HashSet이 같은 후보 영역에서 비교하지 못해 계약에 맞지 않는 결과가 나올 수 있습니다.

### 원소 상태를 바꾸는 것도 위험하다

Set에 넣은 객체의 equals/hashCode 기준 필드를 나중에 바꾸면 `contains`, `remove`가 예상과 다르게 동작할 수 있습니다. 그래서 Set의 key 성격을 가진 값 객체는 불변으로 설계하는 편이 좋습니다.

### 언제 Set이 자연스러운가

- 중복 ID 제거
- 이미 방문한 값 확인
- 사용자 권한 집합
- 태그처럼 동일 값이 여러 번 있을 의미가 없는 데이터

반대로 동일 사건이 여러 번 발생한 순서를 보존해야 한다면 List가 맞을 수 있습니다.

문제에서는 구현체 이름보다 **중복 기준이 무엇이며 그 기준을 equals/hashCode가 올바르게 표현하는지**를 먼저 확인하세요.

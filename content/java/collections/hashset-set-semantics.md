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

`Set`은 중복 원소를 허용하지 않는 추상화입니다. 하지만 여기서 중복은 "모든 필드가 우연히 같은가"를 뜻하지 않습니다. `HashSet`은 원소 타입의 **`equals`와 `hashCode` 계약**을 이용해 같은 원소인지 판단합니다.

```java
Set<MemberKey> keys = new HashSet<>();
keys.add(new MemberKey(1L));
keys.add(new MemberKey(1L));
```

두 객체가 서로 다른 인스턴스여도 논리적 동등성이 같고 hash 계약이 일관되면 Set에서는 같은 원소로 취급할 수 있습니다.

### add의 반환값은 집합이 실제로 바뀌었는지를 알려 준다

```java
if (!seen.add(id)) {
    System.out.println("이미 처리한 id");
}
```

`Set.add`는 새 원소가 들어가 집합이 변경되면 `true`, 이미 같은 원소가 있어 변경되지 않으면 `false`를 반환합니다. 중복 검사가 목적이라면 `contains` 뒤에 다시 `add`하는 것보다 이 계약이 의도를 더 직접적으로 표현할 때가 있습니다.

### hash 충돌과 중복은 같은 말이 아니다

서로 다른 객체가 같은 hashCode를 가질 수 있으므로 hash 값이 같다는 사실만으로 중복이 되지는 않습니다. 실제 동등성은 `equals`까지 확인해야 합니다.

반대로 `equals`가 `true`인 두 객체가 서로 다른 hashCode를 반환하면 hash 기반 Set의 탐색 전제를 깨뜨립니다. 이 계약 자체는 앞선 `HashMap`과 같은 원리이므로, 여기서는 **Set의 중복 의미가 원소 equality에 의존한다**는 점에 집중하면 됩니다.

### Set에 들어간 뒤 equality 기준을 바꾸면 찾기 어려워질 수 있다

```java
UserKey key = new UserKey("kim");
Set<UserKey> keys = new HashSet<>();
keys.add(key);

key.changeName("lee");
```

만약 `name`이 `equals`와 `hashCode`에 참여한다면 저장 시점과 현재의 검색 기준이 달라집니다. `HashSet`은 원소 내부 변경을 관찰해 자동으로 위치를 다시 계산하지 않으므로 `contains`나 `remove`가 기대와 다르게 동작할 수 있습니다.

따라서 Set에서 원소 identity를 결정하는 상태는 가능하면 안정적으로 유지하는 편이 좋습니다. 변경이 필요한 값이라면 제거한 뒤 새 상태로 다시 넣는 식으로 컬렉션의 계약을 다시 맞출 수 있습니다.

### 언제 Set이 자연스러운가

중복 ID 제거, 방문 여부 기록, 권한 집합, 태그처럼 **같은 값이 여러 번 존재할 의미가 없는 데이터**에 잘 맞습니다. 반대로 같은 사건이 여러 번 발생한 순서까지 보존해야 한다면 List가 더 자연스러울 수 있습니다.

`HashSet`을 사용할 때는 구현체 이름보다 먼저 "이 타입에서 무엇을 같은 원소라고 볼 것인가"를 확인하세요. 그 논리적 동등성이 안정적으로 정의되어야 Set의 중복 없음이라는 계약도 의미를 가집니다.

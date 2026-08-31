---
kind: concept
contentKey: java.core.coding-tests.hashmap-hashset-counting
topicContentKey: java.core.coding-tests
slug: hashmap-hashset-counting
title: "HashMap and HashSet counting idioms"
summary: "빈도 계산과 방문 여부 문제에서 Map·Set의 getOrDefault·merge·add 반환값을 간결하게 활용한다"
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html"
    title: "Java SE 25 API: HashMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: getOrDefault·merge를 포함한 Map 동작 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html"
    title: "Java SE 25 API: HashSet"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: add·contains와 Set uniqueness 계약 확인
---
# HashMap·HashSet counting idiom

코딩테스트에서는 "각 문자열이 몇 번 등장했는가", "이 좌표를 이미 방문했는가", "서로 다른 값이 몇 개인가" 같은 상태를 자주 저장합니다. 이때 배열 index로 바로 표현하기 어려운 key라면 `HashMap`과 `HashSet`이 구현을 단순하게 해 줍니다.

### 빈도는 key와 count의 쌍으로 저장한다

가장 직관적인 코드는 다음과 같습니다.

```java
Map<String, Integer> counts = new HashMap<>();

for (String word : words) {
    int previous = counts.getOrDefault(word, 0);
    counts.put(word, previous + 1);
}
```

`getOrDefault(word, 0)`은 key가 없을 때 0을 반환합니다. 중요한 점은 **0을 실제 map에 저장하는 것은 아니라는 것**입니다.

```java
int count = counts.getOrDefault("java", 0);
// "java" key가 없었다면 map은 여전히 비어 있을 수 있음
```

### `merge`를 사용하면 누락과 기존 값을 한 번에 표현할 수 있다

```java
for (String word : words) {
    counts.merge(word, 1, Integer::sum);
}
```

의미는 다음처럼 생각할 수 있습니다.

```text
key 없음 -> 1 저장
key 있음 -> 기존 count와 1을 합쳐 새 값 저장
```

코딩테스트에서는 frequency counting 의도가 짧게 드러납니다. 다만 `merge`의 일반 계약에는 remapping 결과가 null일 때의 동작 등 더 많은 규칙이 있으므로 복잡한 사용에서는 공식 API를 확인합니다.

### 방문 여부만 필요하면 Set이 더 직접적이다

```java
Set<Long> visited = new HashSet<>();

if (!visited.contains(id)) {
    visited.add(id);
    process(id);
}
```

`add`의 반환값을 사용하면 한 번에 표현할 수 있습니다.

```java
if (visited.add(id)) {
    process(id); // 실제로 새 값이 추가된 경우에만 실행
}
```

Set에 이미 같은 값이 있다면 `add`는 false를 반환합니다. "처음 방문했을 때만 처리" 같은 코드에 유용합니다.

### Map이 필요한지 Set이면 충분한지 구분한다

```text
key만 필요
- 방문 여부
- 중복 제거
- membership
=> Set

key에 값이 따라감
- 빈도
- 점수
- 마지막 위치
=> Map
```

모든 문제를 `Map<K, Boolean>`로 구현할 수는 있지만 값이 단순 membership이라면 Set이 의미를 더 잘 보여 줍니다.

### 순회 순서를 기대하지 않는다

`HashMap`과 `HashSet`은 입력 순서나 정렬 순서를 기본 계약으로 제공하지 않습니다.

출력이 정렬되어야 한다면:

- key를 별도 List에 모아 정렬
- `TreeMap`/`TreeSet` 같은 sorted collection이 요구에 맞는지 검토
- 입력 순서 보존이 필요하면 다른 collection을 선택

등을 고려합니다.

"내 PC에서 넣은 순서대로 나왔다"는 테스트 결과를 계약으로 생각하면 안 됩니다.

### equality가 key 의미를 결정한다

문자열이나 record처럼 key의 `equals/hashCode`가 올바르게 정의되어야 map/set이 같은 key를 같은 값으로 판단합니다.

Mutable 객체를 key로 넣은 뒤 equality에 사용되는 필드를 바꾸면 조회가 깨질 수 있습니다. 코딩테스트에서 custom key를 만들 때 record를 활용하면 값 기반 equality를 간결하게 만들 수 있는 경우가 있습니다.

```java
record Position(int row, int col) { }
Set<Position> visited = new HashSet<>();
```

### 문제를 풀 때 확인할 것

1. 필요한 상태가 membership인지 key-value인지 구분합니다.
2. 빈도 count의 초기값이 무엇인지 정합니다.
3. `getOrDefault`가 값을 자동 저장한다고 착각하지 않습니다.
4. `Set.add`의 반환값을 활용할 수 있는지 봅니다.
5. HashMap/HashSet 순회 순서를 정답 출력에 사용하고 있지 않은지 확인합니다.

### 자주 헷갈리는 부분

- `getOrDefault`는 누락된 key를 map에 삽입하지 않습니다.
- `HashSet.add`는 새 원소가 실제로 추가됐는지 boolean으로 알려 줍니다.
- HashMap/HashSet의 iteration order는 정렬이나 입력 순서를 보장하지 않습니다.
- 일반 HashMap을 여러 thread가 공유한다고 counting 연산이 자동으로 thread-safe해지는 것은 아닙니다.

### 면접이나 문제 풀이에서 설명한다면

빈도 계산처럼 key마다 값이 필요하면 HashMap, 방문 여부나 중복 제거처럼 membership만 필요하면 HashSet이 자연스럽습니다. `getOrDefault`와 `merge`로 빈도 계산을 간단히 작성할 수 있고 `Set.add`의 반환값으로 처음 방문 여부를 바로 판단할 수 있습니다. 순회 순서는 보장되지 않으므로 출력 순서가 필요하면 별도 정렬이나 다른 collection을 선택해야 합니다.

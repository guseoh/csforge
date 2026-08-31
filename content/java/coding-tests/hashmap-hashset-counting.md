---
kind: concept
contentKey: java.core.coding-tests.hashmap-hashset-counting
topicContentKey: java.core.coding-tests
slug: hashmap-hashset-counting
title: "HashMap and HashSet counting idioms"
summary: "frequency counting, visited membership, getOrDefault/merge 같은 Map·Set idiom을 코딩테스트 구현에 활용한다"
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html"
    title: "Java SE 25 API: HashMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: getOrDefault와 merge를 포함한 Map 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html"
    title: "Java SE 25 API: HashSet"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: membership 집합 계약 확인
---
# HashMap·HashSet counting idiom

## 쉬운 진입

값이 몇 번 나왔는지 세려면 key와 count를 map에 저장하고, 이미 방문했는지만 알면
HashSet에 key를 넣는다. 배열 인덱스로 범위를 제한하기 어렵거나 문자열·좌표처럼 key가
다양한 경우 이 두 자료구조가 구현을 단순하게 만든다.

## 정확한 메커니즘

~~~
Map<String, Integer> count = new HashMap<>();
for (String word : words) {
    count.merge(word, 1, Integer::sum);
}

Set<Long> visited = new HashSet<>();
if (visited.add(id)) {
    // id가 처음 추가된 경우에만 처리
}

int occurrences = count.getOrDefault("java", 0);
~~~

getOrDefault는 key가 없을 때 읽을 기본값을 주지만 map에 그 값을 자동 저장하지 않는다.
merge는 key가 없으면 value를 넣고, 있으면 remapping function으로 결합한다. HashSet.add의
반환값은 실제로 새 원소가 추가되었는지를 나타낸다. null key를 허용하는지와 해시
equality 계약은 사용하는 구현체의 API 계약으로 확인하며, 순회 순서가 필요하면 별도
순서 자료구조를 선택한다.

## 실전·면접 연결

빈도 map을 읽은 뒤 바로 삭제할지, 방문 set을 별도 유지할지 결정하면 상태의 의미가
명확해진다. 여러 thread가 공유하는 counting은 일반 HashMap idiom만으로 안전해지지
않으며 concurrent collection이나 별도 동기화가 필요한 다른 문제다.

## 흔한 오해

- getOrDefault는 누락된 key를 map에 삽입하지 않는다.
- HashMap과 HashSet의 iteration 순서는 입력 순서나 정렬 순서를 보장하지 않는다.
- containsKey 후 put을 나눈 코드는 공유 환경에서 하나의 원자적 연산이 아니다.

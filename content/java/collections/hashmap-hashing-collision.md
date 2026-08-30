---
kind: concept
contentKey: java.core.collections.hashmap-hashing-collision
topicContentKey: java.core.collections
slug: hashmap-hashing-collision
title: "HashMap의 hashing과 충돌"
summary: "hashCode와 equals로 key를 찾는 과정, 충돌과 변경 가능한 키의 위험을 설명한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html"
    title: "HashMap API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: hashing, equals와 예상 성능 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode()"
    title: "Object.hashCode API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: equals와 hashCode 일관성 계약 확인
---
# HashMap의 hashing과 충돌

## 쉬운 진입

사전에서 단어의 첫 글자 서랍을 먼저 찾고 실제 단어를 비교하는 것처럼 HashMap은 key의
hashCode로 후보 위치를 찾은 뒤 equals로 같은 key인지 확인한다.

## 정확한 메커니즘

```text
key.hashCode() -> bucket 선택 -> 후보 key.equals(input) -> value 반환
                         └─ 여러 key면 collision 처리
```

서로 다른 key가 같은 hash를 가질 수 있으므로 hashCode가 유일해야 하는 것은 아니다.
다만 equals가 true인 key는 같은 hash를 가져야 한다. HashMap의 평균적인 조회 성능은
좋은 분포를 전제하며, 실제 bucket 구조와 treeification은 JDK 구현 세부사항이므로 계약과
특정 구현을 구분해야 한다.

## 실전·면접 연결

Map에 넣은 뒤 key의 equals/hashCode에 사용한 필드를 바꾸면 기존 bucket에서 찾지 못할 수
있다. key는 불변으로 만들거나, 변경 전에 제거하고 새 key로 다시 넣는다. 외부 입력을 key로
쓸 때는 hash flooding과 과도한 충돌도 방어 관점에서 고려한다.

## 흔한 오해

- hash collision은 곧 key 충돌/덮어쓰기를 뜻하지 않는다. equals가 false면 별도 entry다.
- hashCode만 같다고 두 key가 같은 것은 아니다.
- HashMap의 내부 tree 전환을 애플리케이션 계약으로 의존하면 안 된다.

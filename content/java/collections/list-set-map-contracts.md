---
kind: concept
contentKey: java.core.collections.list-set-map-contracts
topicContentKey: java.core.collections
slug: list-set-map-contracts
title: "List·Set·Map 컬렉션 계약"
summary: "순서·중복·키 매핑이라는 자료 구조의 계약에 맞춰 컬렉션을 선택한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html"
    title: "Java SE 25 List API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 순서 있는 중복 허용 sequence 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html"
    title: "Set API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 중복 없는 집합 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html"
    title: "Map API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: key-value 매핑 계약 확인
---
# List·Set·Map 컬렉션 계약

## 쉬운 진입

같은 상품을 여러 번 담는 장바구니는 `List`, 태그처럼 중복이 의미 없는 값은 `Set`, 상품
번호로 가격을 찾는 구조는 `Map`이 자연스럽다. 자료 구조 이름보다 원하는 계약을 먼저 말해야 한다.

## 정확한 메커니즘

```text
List<T> : 순서 있음 · 중복 허용 · index 접근
Set<T>  : 중복 없음 · equals/hashCode 또는 정렬 계약
Map<K,V>: key -> value · key 중복 없음
```

List의 순서는 구현과 계약에 따라 다르고, Set의 중복 판정은 구현에 따라 `equals/hashCode`
또는 비교 순서에 의존한다. Map은 key의 동등성으로 기존 값을 대체할 수 있으므로 `put`의
의미를 이해해야 한다.

## 실전·면접 연결

API 경계에서 변경 가능한 내부 컬렉션을 그대로 반환하지 말고 복사나 불변 view를 선택한다.
빈 값은 null 대신 빈 컬렉션으로 반환하면 호출부의 분기와 오류가 줄어든다. 성능은 계약을
선택한 뒤 구현체의 접근/삽입 특성으로 결정한다.

## 흔한 오해

- 모든 `Set`이 정렬된 순서를 보장하지 않는다.
- `Map`은 `Collection`의 하위 타입이 아니며 key와 value의 관계를 표현한다.
- `List`의 중복 허용은 같은 object를 여러 번 넣어도 된다는 뜻이지 값의 의미가 항상 같다는 뜻은 아니다.

---
kind: concept
contentKey: java.core.object-contracts.comparable-natural-order
topicContentKey: java.core.object-contracts
slug: comparable-natural-order
title: "Comparable and natural order"
summary: "compareTo의 자연 순서와 equals 불일치가 sorted collection에 미치는 영향을 판단한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Comparable.html"
    title: "Comparable API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: natural ordering과 compareTo 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html"
    title: "TreeSet API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: sorted set이 ordering으로 중복을 판단하는 방식 확인
---
# Comparable and natural order

## 쉬운 진입

학생을 이름순으로 정렬할지 학번순으로 정렬할지는 object가 자연스럽게 하나의 기준을 가질지와
관련 있다. `Comparable`은 그 기본 순서를 타입 자신이 제공하는 계약이다.

## 정확한 메커니즘

`compareTo`는 음수·0·양수로 this가 앞서는지, 같은 순서인지, 뒤서는지를 나타낸다. 반환값이
정확히 -1 또는 1일 필요는 없다. 특히 `compareTo`가 0인 두 값을 sorted collection은 같은
순서로 취급할 수 있다.

```java
public int compareTo(Version other) {
    int majorResult = Integer.compare(major, other.major);
    return majorResult != 0 ? majorResult : Integer.compare(minor, other.minor);
}
```

가능하면 natural ordering은 `equals`와 consistent하게 설계한다. 그렇지 않으면 `TreeSet`에는
`equals`가 false인 object가 하나만 들어가거나, `TreeMap`에서 key가 덮인 것처럼 보일 수 있다.
이것이 항상 Java compile error라는 뜻은 아니다.

## 실전·면접 연결

버전, 금액, 우선순위처럼 기본 순서가 도메인의 중심일 때 Comparable을 사용한다. nullable
field와 tie-breaker를 명시하고, 숫자 subtraction으로 비교하지 않는다. 순서가 여러 개면
Comparator가 더 적합하다.

## 흔한 오해

- `compareTo` 결과가 0이면 반드시 `equals`가 true여야 하는 것은 아니지만, sorted collection 사용에서 문제가 될 수 있다.
- compareTo의 반환값을 빼기 연산으로 만들면 큰 정수에서 overflow할 수 있다.
- natural order가 모든 화면·업무의 정렬 기준이라는 뜻은 아니다.

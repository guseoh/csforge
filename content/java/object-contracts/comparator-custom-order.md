---
kind: concept
contentKey: java.core.object-contracts.comparator-custom-order
topicContentKey: java.core.object-contracts
slug: comparator-custom-order
title: "Comparator and custom order"
summary: "여러 정렬 기준과 overflow 없는 비교를 명확한 Comparator로 구성한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html"
    title: "Comparator API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: custom ordering contract과 comparator 조합 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html"
    title: "Java SE 25 Integer API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: overflow 안전한 compare API 확인
---
# Comparator and custom order

## 쉬운 진입

같은 User를 이름순, 가입일순, 실패 횟수 내림차순으로 모두 보여줘야 한다. object의
natural order를 매번 바꾸기보다 그 화면이 필요한 순서를 `Comparator`로 따로 표현하면
각 사용 목적이 드러난다.

## 정확한 메커니즘

Comparator는 두 값을 비교하는 외부 정책이다. `thenComparing`, `reversed`, `comparing`과
`comparingInt`를 사용하면 기준을 읽는 순서대로 조합할 수 있다.

```java
Comparator<User> byFailures = Comparator
        .comparingInt(User::failureCount)
        .reversed()
        .thenComparing(User::name);
```

`a - b`를 비교 결과로 반환하면 int overflow로 순서가 뒤집힐 수 있다. `Integer.compare`,
`Long.compare` 또는 comparator factory를 사용한다. comparator가 0이라고 두 object의 모든
field가 동일한 것은 아니며, sorted collection에서는 동일한 위치로 취급될 수 있다.

## 실전·면접 연결

정렬 결과의 안정성이 중요하면 동률 기준을 추가해 deterministic ordering을 만든다. null
허용 여부도 `nullsFirst`·`nullsLast`로 명시한다. comparator가 equality와 일치하지 않아도
가능하지만 TreeSet/TreeMap의 중복·lookup 의미를 이해하고 선택해야 한다.

## 흔한 오해

- comparator chain의 앞 기준이 같으면 뒤 기준이 평가된다.
- `Comparator.reverseOrder()`가 object의 business equality를 뒤집는 것은 아니다.
- subtraction이 짧다는 이유로 모든 숫자 비교에 안전한 것은 아니다.

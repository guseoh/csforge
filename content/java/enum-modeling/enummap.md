---
kind: concept
contentKey: java.core.enum-modeling.enummap
topicContentKey: java.core.enum-modeling
slug: enummap
title: "EnumMap으로 enum 키 매핑하기"
summary: "enum 키를 쓰는 Map에서 타입 안전성, 순서, 기본값 정책을 명확히 한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/EnumMap.html"
    title: "EnumMap API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: enum 키 전용 Map의 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html"
    title: "Map API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: key-value 매핑과 null/containsKey 의미 확인
---
# EnumMap으로 enum 키 매핑하기

## 쉬운 진입

요일별 영업시간처럼 키가 enum으로 고정되어 있다면 `Map<Day, OpeningHours>`가 모델의
경계를 보여준다. `EnumMap`은 그 키 타입을 생성 시점에 고정하고 enum 순서를 자연스럽게
활용한다.

## 정확한 메커니즘

```java
EnumMap<Day, Integer> closingHour = new EnumMap<>(Day.class);
closingHour.put(Day.MONDAY, 18);
int hour = closingHour.getOrDefault(Day.SUNDAY, 0);
```

`EnumMap`은 enum 키만 허용하고 키 iteration은 enum 선언 순서다. 키를 하나도 모르는 빈
`Map`과 달리 `Day.class`가 매핑의 타입 기준이 된다. 값에는 일반 Map과 같은 null 정책을
적용할 수 있으므로, 값이 없다는 의미와 명시적 null을 구분해야 한다.

## 실전·면접 연결

상태별 핸들러, 권한별 한도, 열거형별 통계처럼 키 집합이 작고 닫힌 경우 `HashMap`보다
의도가 선명하고 효율적인 선택이 될 수 있다. enum 키의 선언 순서를 화면 표시 순서로
사용하는 것은 별도 제품 계약으로 결정해야 한다.

## 흔한 오해

- `EnumMap`은 값도 enum이어야 하는 컬렉션이 아니다. 키만 enum이다.
- 없는 키의 `get`은 0 같은 숫자 기본값을 자동으로 주지 않는다.
- enum 선언 순서가 항상 사용자에게 보여줄 정렬 기준이라는 보장은 없다.

---
kind: concept
contentKey: java.core.enum-modeling.enumset
topicContentKey: java.core.enum-modeling
slug: enumset
title: "EnumSet으로 enum 집합 다루기"
summary: "enum 전용 Set의 타입 안전성과 효율, 집합 연산을 선택에 활용한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/EnumSet.html"
    title: "EnumSet API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: enum 전용 Set 구현과 factory 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html"
    title: "Set API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 중복 없는 집합 계약 확인
---
# EnumSet으로 enum 집합 다루기

## 쉬운 진입

사용자에게 허용된 권한이 `READ`, `WRITE`, `ADMIN`처럼 enum으로 닫혀 있다면 `Set<String>`보다
`EnumSet<Permission>`이 의도를 정확히 표현한다. 잘못된 타입의 값은 애초에 집합에 넣을 수 없다.

## 정확한 메커니즘

`EnumSet`은 하나의 enum 타입만 원소로 받으며 `noneOf`, `of`, `allOf`, `complementOf` 같은
팩토리로 집합을 만든다. 구현은 enum의 유한한 상수 집합을 이용하므로 일반 `HashSet`보다
메모리와 연산에서 유리한 경우가 많고, 원소의 iteration 순서는 enum 선언 순서를 따른다.

```java
EnumSet<Permission> editable = EnumSet.of(Permission.READ, Permission.WRITE);
editable.add(Permission.ADMIN);
editable.remove(Permission.WRITE);
```

`EnumSet`은 일반 Set 계약을 따르며 null 원소를 허용하지 않는다. 여러 스레드가 동시에
수정하는 동기화 컨테이너가 아니므로 공유 변경 상태라면 별도 동기화나 불변 복사 전략이
필요하다.

## 실전·면접 연결

권한 조합, 기능 플래그, 처리 단계처럼 enum 값의 부분집합을 표현할 때 적합하다. 외부에서
받은 문자열을 집합에 넣기 전에는 허용된 enum으로 변환하고, API 응답에서는 안정적인 코드로
직렬화해 내부 선언 순서와 경계를 분리한다.

## 흔한 오해

- `EnumSet`은 모든 enum을 섞는 집합이 아니라 한 enum 타입 전용 집합이다.
- 선언 순서 iteration은 비즈니스 우선순위 정렬을 의미하지 않는다.
- `EnumSet`이 빠르다는 이유로 동시 변경 안전성까지 제공한다고 보면 안 된다.

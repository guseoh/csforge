---
kind: concept
contentKey: java.core.functional.behavior-parameterization
topicContentKey: java.core.functional
slug: behavior-parameterization
title: "Behavior parameterization"
summary: "변화하는 동작을 parameter로 전달해 control flow 중복을 줄인다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Predicate.html"
    title: "Java SE 25 API: Predicate"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 조건 동작 전달과 조합 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Function.html"
    title: "Java SE 25 API: Function"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 변환 동작 전달 계약 확인
---
# Behavior parameterization

## 쉬운 진입

목록을 순회하는 구조는 같은데 “성인만 선택”, “이름만 출력”처럼 바뀌는 부분이 있다. 그
변화하는 규칙을 메서드 안에 복사하지 않고 `Predicate`나 `Function`으로 받으면 한 흐름을
여러 정책이 재사용할 수 있다.

## 정확한 메커니즘

```java
static <T> List<T> select(List<T> source, Predicate<T> rule) {
    List<T> result = new ArrayList<>();
    for (T item : source) if (rule.test(item)) result.add(item);
    return result;
}

var adults = select(users, user -> user.age() >= 20);
```

여기서 메서드는 순회·결과 생성이라는 고정 control flow를 소유하고, caller는 조건이라는
behavior만 공급한다. 이 Concept에서는 stream pipeline 자체보다 “동작을 값처럼 전달하는
경계”에 집중한다.

## 실전·면접 연결

parameterized behavior는 전략을 작은 함수로 표현하는 방법이다. 규칙이 여러 상태와 의존성을
가져 커지면 이름 있는 class나 별도 domain policy가 더 읽기 쉽다. 함수형이라는 이유로 모든
분기를 lambda로 숨기지 말고 테스트와 디버깅 경계를 고려한다.

## 흔한 오해

- lambda를 전달해도 메서드의 모든 책임이 자동으로 분리되는 것은 아니다.
- 함수형 인터페이스는 무조건 무상태여야 한다는 언어 규칙은 없다.
- 동작을 전달하는 것과 병렬 실행을 요청하는 것은 별개다.

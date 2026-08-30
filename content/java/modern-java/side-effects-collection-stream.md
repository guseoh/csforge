---
kind: concept
contentKey: java.core.modern-java.side-effects-collection-stream
topicContentKey: java.core.modern-java
slug: side-effects-collection-stream
title: Stream의 부수 효과와 컬렉션 변환
summary: stream 연산에서 상태 변경을 줄이고 결과 컬렉션의 의도를 명확히 표현한다
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html"
    title: Stream API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: non-interference와 stateless 동작 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html"
    title: Collectors API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 결과 수집 연산 선택 확인
---
# Stream에서 부수 효과 줄이기

Stream의 함수형 연산은 가능하면 입력을 방해하지 않고(stateless, non-interfering) 결과를 반환하는 방향이 읽기 쉽습니다. `map` 안에서 외부 리스트에 추가하거나 공유 카운터를 증가시키면 순차 실행에서 우연히 동작해도 병렬 실행·재사용·테스트에서 취약해집니다.

```java
List<String> activeNames = users.stream()
        .filter(User::active)
        .map(User::name)
        .toList();
```

결과를 모으려는 목적이면 `toList`, `toMap`, `groupingBy` 같은 terminal collector를 우선 검토합니다. 중복 키 정책이나 null 정책은 collector마다 다르므로 명시적으로 결정해야 합니다. 단순한 변환이 아니라 여러 상태를 조정하는 업무 흐름이라면 stream 안에 숨기기보다 이름 있는 메서드와 반복문이 더 적합할 수 있습니다.

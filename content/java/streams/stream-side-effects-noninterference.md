---
kind: concept
contentKey: java.core.streams.stream-side-effects-noninterference
topicContentKey: java.core.streams
slug: stream-side-effects-noninterference
title: "Stream side effects and non-interference"
summary: "stateless·non-interference를 지키고 shared mutable side effect를 진단한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html"
    title: "Java SE 25 API: java.util.stream package"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: non-interference·stateless behavior 가이드 확인
---
# Stream side effects and non-interference

## 쉬운 진입

stream이 읽는 list를 pipeline 안에서 동시에 add/remove하거나, 여러 원소가 공유하는
`ArrayList`에 `forEach`로 넣으면 결과가 순서와 실행 방식에 따라 흔들릴 수 있다. source를
방해하지 않고 각 연산이 입력만으로 결과를 계산하게 하는 것이 핵심이다.

## 정확한 메커니즘

non-interference는 stream source가 traversal 중 구조적으로 수정되지 않아야 한다는 의미이며,
stateless behavior는 한 원소의 결과가 이전 원소 처리의 숨은 상태에 의존하지 않는다는
방향이다. 결과는 `collect` 같은 terminal operation으로 소유권 있게 만든다.

```java
List<String> upper = names.stream()
        .map(String::toUpperCase)
        .toList(); // 외부 shared list에 직접 add하지 않음
```

원소 내부의 mutable 상태를 바꾸는 side effect도 가능하지만, thread safety·실행 순서·재사용
계약을 별도로 증명해야 한다. API가 허용하는 동작과 특정 구현에서 우연히 보이는 순서를
구분한다.

## 실전·면접 연결

공유 누적이 필요하면 collector나 명시적인 동기화 구조를 선택한다. `forEach`에서 index나
외부 counter를 증가시키는 코드는 sequential에서만 맞아 보이기 쉽다. side effect를 완전히
없앨 수 없는 I/O pipeline은 실패 재시도와 중복 실행까지 설계해야 한다.

## 흔한 오해

- stream이 함수형 문법이라고 모든 lambda가 자동으로 pure가 되지 않는다.
- sequential stream도 source를 수정해도 안전하다는 보장이 없다.
- `synchronizedList` 하나를 쓴다고 pipeline의 전체 의미와 원자성이 해결되는 것은 아니다.

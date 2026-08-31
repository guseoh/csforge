---
kind: concept
contentKey: java.core.streams.tomap-duplicate-keys
topicContentKey: java.core.streams
slug: tomap-duplicate-keys
title: "toMap and duplicate keys"
summary: "중복 key의 merge policy를 명시해 수집 실패와 손실을 피한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html"
    title: "Java SE 25 API: Collectors"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: toMap overload와 duplicate key merge 계약 확인
---
# toMap and duplicate keys

## 쉬운 진입

이름을 key로 사람을 map에 넣는데 동명이인이 있으면 “나중 값을 쓸지, 합칠지, 거부할지”가
필요하다. `Collectors.toMap(keyMapper, valueMapper)`는 중복 key를 조용히 임의 병합하지 않고
기본적으로 실패하므로 정책을 생각하게 만든다.

## 정확한 메커니즘

```java
Map<String, Integer> latest = records.stream().collect(
        Collectors.toMap(Record::key, Record::value, (oldValue, newValue) -> newValue));
```

세 번째 인자는 같은 key가 다시 나왔을 때 사용할 merge function이다. 합계, 첫 값 유지,
최신 값 유지, 예외 등 domain 정책을 명시한다. map supplier를 추가하는 overload는 결과
구현체를 선택하지만 duplicate policy를 대신 정해 주지는 않는다.

## 실전·면접 연결

key의 equality는 map의 계약이므로 normalize 여부와 case sensitivity를 먼저 정한다.
“마지막 입력이 최신”이라는 정책도 stream encounter order와 collector 계약을 전제로 해야
하므로 parallel 사용까지 고려하면 더 신중해야 한다. 데이터 손실이 허용되지 않으면 merge가
아닌 명시적 충돌 결과를 반환하는 편이 낫다.

## 흔한 오해

- `toMap`이 duplicate key를 자동으로 list에 모아 주지 않는다.
- merge function이 없을 때 항상 첫 값이 보존되는 것은 아니다.
- 같은 문자열처럼 보여도 key normalization을 하지 않으면 다른 key일 수 있다.

---
kind: concept
contentKey: java.core.time-numeric.datetimeformatter-parsing-formatting
topicContentKey: java.core.time-numeric
slug: datetimeformatter-parsing-formatting
title: "DateTimeFormatter parsing and formatting"
summary: "pattern·locale·zone이 date-time text에 미치는 영향을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatter.html"
    title: "Java SE 25 API: DateTimeFormatter"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: formatter pattern·locale·zone 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatterBuilder.html"
    title: "Java SE 25 API: DateTimeFormatterBuilder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 복합 parse/format builder 확인
---
# DateTimeFormatter parsing and formatting

## 쉬운 진입

date-time object와 화면 문자열은 서로 다른 표현이다. formatter는 그 경계를 맡으며, 같은
숫자라도 `MM`은 month, `mm`은 minute처럼 pattern 대소문자가 의미를 바꾼다.

## 정확한 메커니즘

```java
var formatter = DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm", Locale.ROOT);
LocalDateTime value = LocalDateTime.parse("2026-08-31 09:30", formatter);
String text = value.format(formatter);
```

`LocalDateTime` formatter는 zone이 없는 값을 다루며, `withZone`으로 zone을 설정한 formatter가
Instant를 출력할 때는 timeline을 해당 zone으로 표시한다. month/day 이름의 언어는 Locale에
영향받고, `yyyy`와 era 의미처럼 연도 pattern도 계약을 확인한다. parse는 입력이 pattern과
맞지 않으면 실패하므로 외부 입력 검증 경계로 다룬다.

## 실전·면접 연결

기계 간 교환에는 명시적인 표준 formatter와 zone/offset을 사용하고, 사용자 표시에는 Locale을
주입한다. static formatter를 공유할 때는 `DateTimeFormatter`의 immutable/thread-safe
계약을 확인한다. 문자열을 먼저 local로 parse한 뒤 의미 없이 system zone을 붙이는 실수를
피한다.

## 흔한 오해

- formatter pattern만으로 zone 정보가 문자열에 새로 생기지 않는다.
- Locale과 ZoneId는 언어와 시간대라는 서로 다른 축이다.
- parse 성공이 업무적으로 유효한 날짜·시간이라는 뜻까지 보장하지 않는다.

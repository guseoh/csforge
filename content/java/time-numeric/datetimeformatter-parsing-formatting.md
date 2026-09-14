---
kind: concept
contentKey: java.core.time-numeric.datetimeformatter-parsing-formatting
topicContentKey: java.core.time-numeric
slug: datetimeformatter-parsing-formatting
title: "DateTimeFormatter로 시간 파싱·표시하기"
summary: "날짜·시간 객체와 문자열 사이의 변환에서 pattern, Locale, ZoneId가 맡는 역할을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatter.html"
    title: "Java SE 25 API: DateTimeFormatter"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: formatter pattern·Locale·ZoneId와 parse/format 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatterBuilder.html"
    title: "Java SE 25 API: DateTimeFormatterBuilder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 복합적인 formatter를 조립하는 builder 계약 확인
---
# DateTimeFormatter로 시간 파싱·표시하기

`LocalDateTime` 같은 시간 객체와 `"2026-08-31 14:30"` 같은 문자열은 같은 것이 아닙니다. 한쪽은 날짜·시간 필드를 가진 값이고, 다른 쪽은 문자들의 형식입니다. `DateTimeFormatter`는 **두 표현 사이에서 어떤 문자열 규칙을 사용할지** 정의합니다.

### parsing과 formatting은 서로 반대 방향이다

```java
DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm", Locale.ROOT);

LocalDateTime time = LocalDateTime.parse(
        "2026-08-31 14:30",
        formatter
);

String text = time.format(formatter);
```

```text
String
  │ parse
  ▼
Temporal value
  │ format
  ▼
String
```

문자열이 formatter가 기대하는 구조와 시간 필드 규칙을 만족하지 않으면 parsing은 실패할 수 있습니다.

### pattern 문자는 실제 시간 필드를 뜻한다

Pattern은 단순한 출력 예시 문자열이 아닙니다. 각 문자가 서로 다른 필드를 나타냅니다.

```text
MM -> month
mm -> minute
```

대소문자 하나가 의미를 바꿀 수 있으므로 중요한 외부 형식이라면 pattern 정의를 API 문서와 대조해야 합니다. `yyyy`와 `uuuu`처럼 비슷해 보여도 달력 의미가 다른 문자도 있습니다.

### parse 가능성과 업무상 유효성은 다르다

Formatter는 문자열을 시간 값으로 해석할 수 있는지 판단하지만, "예약은 오늘부터 30일 이내여야 한다" 같은 정책까지 검증하지 않습니다.

`DateTimeFormatter`는 resolver style을 통해 날짜·시간 필드 해석 강도를 조정할 수 있습니다. `STRICT`를 사용한다고 해도 그것은 시간 값의 해석 규칙이지 서비스의 비즈니스 규칙을 대신하지 않습니다.

```text
formatter 책임
- 문자열 구조
- 시간 필드 해석

application/domain 책임
- 예약 허용 범위
- 특정 지역의 업무 시간
- 서비스 상태에 따른 허용 여부
```

### Locale과 ZoneId는 다른 문제를 해결한다

`Locale`은 월 이름이나 요일 이름처럼 **사람에게 표시되는 언어·지역 표현**에 영향을 줍니다. `ZoneId`는 한 실제 순간을 어느 지역 시각으로 표현할지 결정합니다.

```text
Locale -> January / 1월 같은 문자 표현
ZoneId -> 같은 Instant가 지역별로 몇 시인지 계산
```

`LocalDateTime`처럼 원래 zone이 없는 값에 formatter를 사용한다고 숨은 실제 시점이 자동으로 생기지는 않습니다.

반대로 `Instant`를 문자열로 표시할 때 formatter에 zone을 줄 수 있습니다.

```java
DateTimeFormatter formatter = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm")
        .withZone(ZoneId.of("Asia/Seoul"));

String text = formatter.format(instant);
```

이때 zone은 이미 존재하는 `Instant`를 **어떤 지역 시각으로 표시할지** 결정합니다.

DateTimeFormatter를 볼 때는 parse인지 format인지, pattern이 어떤 필드를 뜻하는지, Locale과 ZoneId 중 무엇이 표현에 영향을 주는지를 분리해서 보세요. Formatter는 문자열과 시간 값의 변환 계약이지 시간대 정책이나 비즈니스 유효성 전체를 대신하는 도구는 아닙니다.

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

날짜·시간 객체와 화면이나 API에서 사용하는 문자열은 같은 것이 아닙니다. `LocalDateTime`은 시간 값을 구조화해서 보관하는 객체이고, `"2026-08-31 14:30"`은 문자들의 순서입니다. 두 표현 사이를 오갈 때 **어떤 문자열 형식을 사용할지 명시하는 역할**을 `DateTimeFormatter`가 맡습니다.

### parsing과 formatting은 반대 방향의 변환이다

```java
DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm", Locale.ROOT);

LocalDateTime time = LocalDateTime.parse(
        "2026-08-31 14:30",
        formatter
);

String text = time.format(formatter);
```

`parse`는 문자열을 시간 객체로 해석하고, `format`은 시간 객체를 문자열로 표현합니다.

```text
"2026-08-31 14:30"
          │ parse
          ▼
LocalDateTime
          │ format
          ▼
"2026-08-31 14:30"
```

문자열이 formatter가 기대하는 구조와 맞지 않으면 parsing은 실패할 수 있습니다. 따라서 외부 API나 사용자 입력을 parse하는 코드는 **형식과 시간 필드를 해석하는 경계**이기도 합니다.

### parse 성공과 업무 유효성은 같은 말이 아니다

`DateTimeFormatter`의 parsing은 단순히 글자 수만 검사하지 않습니다. 문자열에서 field 값을 읽은 뒤 resolver style에 따라 날짜·시간 객체로 **해석(resolve)** 하는 단계가 있습니다. `ofPattern`으로 만든 formatter는 기본적으로 `SMART` resolver style을 사용하므로, 어떤 입력이 허용되거나 조정되는지는 formatter와 resolver 계약을 함께 봐야 합니다.

업무에서 엄격한 달력 입력을 요구한다면 `withResolverStyle(ResolverStyle.STRICT)` 같은 설정을 검토할 수 있습니다. 그러나 strict parse까지 통과했다고 해서 다음 정책까지 자동으로 만족하는 것은 아닙니다.

- 오늘부터 30일 이내 예약만 허용한다.
- 사용자의 `ZoneId`에서 DST gap에 해당하는 시각은 거부한다.
- 영업일에만 결제일을 지정할 수 있다.

즉 **formatter가 시간 값을 해석할 수 있는가**와 **서비스가 그 값을 허용하는가**를 분리해야 합니다.

### pattern 문자는 대소문자까지 의미가 있다

날짜 formatter의 pattern은 단순한 예시 문자열이 아닙니다. 각 문자가 어떤 시간 필드를 뜻하는지 정해져 있습니다.

대표적으로 `MM`과 `mm`은 완전히 다른 의미입니다.

- `MM`: month
- `mm`: minute

따라서 pattern을 눈대중으로 작성하면 컴파일은 되더라도 전혀 다른 결과를 만들 수 있습니다. `yyyy`와 `uuuu`처럼 연도를 표현하는 문자도 달력 의미가 다를 수 있으므로, 중요한 외부 형식에서는 API 문서의 pattern 정의를 확인하는 습관이 좋습니다.

### Locale과 ZoneId는 서로 다른 역할이다

`Locale`은 "어느 언어와 지역 표현 규칙으로 문자를 표시할지"에 영향을 줍니다. 월 이름이나 요일 이름처럼 사람이 읽는 텍스트가 대표적입니다.

`ZoneId`는 **어떤 시간대 규칙으로 한 순간을 local 시간으로 표현할지**에 관한 정보입니다.

```text
Locale -> January / 1월 같은 문자 표현
ZoneId -> 같은 Instant가 서울/뉴욕에서 몇 시인지 결정
```

둘을 같은 설정으로 생각하면 안 됩니다.

### LocalDateTime에 formatter zone을 붙인다고 숨은 순간이 생기지는 않는다

`LocalDateTime`은 원래 zone 정보가 없습니다. 문자열에 zone이 없는데 단순히 parse했다고 해서 세계의 한 순간이 자동으로 결정되지 않습니다.

반면 `Instant`를 출력할 때 formatter에 zone을 지정하면 그 Instant를 해당 지역 시각으로 표현할 수 있습니다.

```java
DateTimeFormatter formatter = DateTimeFormatter
        .ofPattern("uuuu-MM-dd HH:mm")
        .withZone(ZoneId.of("Asia/Seoul"));

String text = formatter.format(Instant.now());
```

여기서는 원래 `Instant`가 한 순간을 가지고 있고, formatter의 zone은 **표시 방법**을 결정합니다.

### 백엔드 API에서는 교환 형식과 사용자 표시 형식을 구분한다

기계 간 API는 사람이 읽기 예쁜 형식보다 명확하고 일관된 형식이 중요합니다. offset/zone이 필요한 시각이라면 그 정보가 실제 문자열 계약에 포함되는지 확인해야 합니다.

반대로 UI 표시에서는 Locale과 사용자의 ZoneId가 중요할 수 있습니다. 같은 formatter 하나를 모든 곳에 적용하는 것보다 **API 저장·전송 계약과 사용자 표현 계약을 분리**하는 편이 안전합니다.

`DateTimeFormatter`는 immutable이며 thread-safe한 API 계약을 제공하므로 formatter를 반복 생성해야만 안전한 것은 아닙니다.

### 문제를 풀 때 확인할 것

1. 현재 동작이 parse인지 format인지 확인합니다.
2. pattern의 각 문자가 실제로 어떤 시간 필드인지 봅니다.
3. parse 문제라면 resolver style과 결과 temporal type을 확인합니다.
4. 입력 객체가 `Instant`, `LocalDateTime`, `ZonedDateTime` 중 무엇인지 확인합니다.
5. Locale과 ZoneId 중 어느 설정이 결과에 영향을 주는지 구분합니다.
6. 문자열 자체가 zone/offset 정보를 포함하는지 확인합니다.

### 자주 헷갈리는 부분

- formatter pattern은 timezone 정보를 없는 곳에서 자동으로 만들어 주지 않습니다.
- Locale과 ZoneId는 서로 다른 개념입니다.
- parse에 성공했다고 업무상 허용된 시간이라는 뜻까지 보장되는 것은 아닙니다.
- `SMART`와 `STRICT` 같은 resolver policy는 업무 검증 규칙의 대체물이 아닙니다.
- 화면에서 문자열을 짧게 표시했다고 원래 시간 값의 정밀도가 바뀌는 것은 아닙니다.

### 학습 후 스스로 설명해 보기

`DateTimeFormatter`는 Java 시간 객체와 문자열 사이의 parse/format 규칙을 정의합니다. Pattern은 날짜·시간 필드를 정하고 Locale은 언어적 표현, ZoneId는 시간대 표현에 영향을 줍니다. Parsing에는 field resolution 규칙도 관여하지만 서비스의 예약 범위나 사용자의 시간대 같은 비즈니스 유효성까지 대신 검증하지는 않습니다.

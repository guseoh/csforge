---
kind: concept
contentKey: java.core.time-numeric.datetimeformatter-parsing-formatting
topicContentKey: java.core.time-numeric
slug: datetimeformatter-parsing-formatting
title: "DateTimeFormatter parsing and formatting"
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
# DateTimeFormatter parsing and formatting

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

문자열이 formatter가 기대하는 구조와 맞지 않으면 parsing은 실패할 수 있습니다. 따라서 외부 API나 사용자 입력을 parse하는 코드는 **형식 검증이 이루어지는 경계**이기도 합니다.

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

`DateTimeFormatter`는 immutable이며 여러 스레드에서 사용할 수 있는 API 계약을 제공하므로 formatter를 반복 생성해야만 안전한 것은 아닙니다.

### 문제를 풀 때 확인할 것

1. 현재 동작이 parse인지 format인지 확인합니다.
2. pattern의 각 문자가 실제로 어떤 시간 필드인지 봅니다.
3. 입력 객체가 `Instant`, `LocalDateTime`, `ZonedDateTime` 중 무엇인지 확인합니다.
4. Locale과 ZoneId 중 어느 설정이 결과에 영향을 주는지 구분합니다.
5. 문자열 자체가 zone/offset 정보를 포함하는지 확인합니다.

### 자주 헷갈리는 부분

- formatter pattern은 timezone 정보를 없는 곳에서 자동으로 만들어 주지 않습니다.
- Locale과 ZoneId는 서로 다른 개념입니다.
- parse에 성공했다고 업무상 허용된 시간이라는 뜻까지 보장되는 것은 아닙니다.
- 화면에서 문자열을 짧게 표시했다고 원래 시간 값의 정밀도가 바뀌는 것은 아닙니다.

### 면접에서 설명한다면

`DateTimeFormatter`는 Java 시간 객체와 문자열 사이의 parse/format 규칙을 정의합니다. Pattern은 날짜·시간 필드를 정하고 Locale은 언어적 표현, ZoneId는 시간대 표현에 영향을 줍니다. 백엔드에서는 API 교환 형식과 사용자 표시 형식을 분리하고, local time에 zone 정보가 자동으로 생기지 않는다는 점을 주의해야 합니다.

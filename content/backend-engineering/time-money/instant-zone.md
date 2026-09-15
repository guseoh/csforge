---
kind: concept
contentKey: backend.core.time-money.instant-zone
topicContentKey: backend.core.time-money
slug: instant-zone
title: "절대 시점과 시간대 계약"
summary: "발생한 사건의 절대 시점과 사용자가 해석하는 지역 시간을 분리하고 저장소·API·예약 정책 사이에서 timezone 의미가 유실되지 않게 설계한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Instant.html"
    title: "Java SE 25 API: Instant"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "timeline의 한 시점을 나타내는 Instant 계약 확인"
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZoneId.html"
    title: "Java SE 25 API: ZoneId"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "지역 기반 시간대 규칙을 나타내는 ZoneId 계약 확인"
---
# 절대 시점과 시간대 계약

백엔드에서 시간 오류는 `Instant`와 `LocalDateTime`의 API 차이를 몰라서만 생기지 않습니다. **저장하려는 값이 이미 발생한 사건의 시점인지, 특정 지역 달력에 묶인 업무 시간인지 구분하지 않은 채 API와 DB를 오갈 때** 의미가 사라지는 경우가 많습니다.

주문 생성이나 결제 승인처럼 이미 발생한 사건은 세계 어디서 보더라도 같은 순간이어야 합니다.

```text
결제 승인 시점
2026-09-15T00:30:00Z
        │
        ├─ Asia/Seoul에서 표시 → 09:30
        └─ America/New_York에서 표시 → 지역 규칙에 따른 시각
```

이런 값은 서버 기본 timezone과 분리된 절대 시점으로 저장하고 API에서도 offset/UTC 의미가 드러나게 표현하는 편이 안전합니다.

반대로 "매주 월요일 오전 9시 서울 시간에 실행"은 아직 하나의 `Instant`가 아닙니다. 다음 실행 시점을 계산하려면 `09:00`이라는 local time뿐 아니라 `Asia/Seoul` 같은 지역 규칙이 필요합니다. `+09:00` 같은 offset 하나만 저장하면 DST를 사용하는 지역이나 장기 예약에서 원래 업무 의미를 보존하지 못할 수 있습니다.

### 저장소와 API가 같은 의미를 보게 한다

문제는 Java type 하나를 고르는 데서 끝나지 않습니다.

```text
외부 요청
  │  "2026-09-15T09:30:00+09:00"
  ▼
API parsing
  │
  ▼
application의 시간 의미
  │
  ▼
DB 저장 형식
  │
  ▼
응답/화면의 지역 시간 변환
```

각 단계가 같은 순간을 표현하는지 확인해야 합니다. DB나 serializer가 timezone 정보를 버리거나 서버 기본 timezone으로 다시 해석하면 개발 PC와 production에서 서로 다른 시간이 만들어질 수 있습니다.

### 발생 시각과 업무 달력을 구분한다

다음 두 질문은 서로 다릅니다.

- "이 주문은 정확히 언제 생성됐는가?" → 절대 시점이 핵심입니다.
- "서울 기준 9월 30일 영업 종료까지 주문 가능한가?" → 지역 날짜·시간과 `ZoneId`가 정책의 일부입니다.

두 번째 규칙을 먼저 임의의 UTC 시각으로 바꾼 뒤 원래 지역 규칙을 버리면 DST나 정책 변경을 다시 계산하기 어려워질 수 있습니다.

백엔드에서 시간 모델링의 핵심은 Java 시간 API를 많이 쓰는 것이 아니라 **저장·전송·정책 계산 사이에서 시간의 의미를 보존하는 것**입니다.

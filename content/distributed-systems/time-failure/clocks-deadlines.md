---
kind: concept
contentKey: distributed.core.time-failure.clocks-deadlines
topicContentKey: distributed.core.time-failure
slug: clocks-deadlines
title: "분산 환경의 시계와 Deadline"
summary: "wall clock과 monotonic time의 역할을 구분하고 여러 hop을 지나는 요청에 end-to-end deadline을 전파하는 이유를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/info/rfc5905"
    title: "RFC 5905: Network Time Protocol Version 4"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "분산 node clock 동기화의 protocol 배경 확인"
  - url: "https://grpc.io/docs/guides/deadlines/"
    title: "gRPC Documentation: Deadlines"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "deadline propagation과 clock skew 보호 확인"
---
# 분산 환경의 시계와 Deadline

한 process 안에서는 `현재 시각`을 하나의 값처럼 사용하기 쉽지만, 여러 node가 통신하는 분산 환경에서는 서로의 wall clock이 완전히 같다고 가정할 수 없습니다. NTP 같은 동기화가 있어도 작은 clock skew와 조정은 남을 수 있으므로, 시간의 용도부터 나누는 것이 중요합니다.

Wall clock은 사용자에게 보여 줄 시각이나 만료 날짜처럼 달력상의 시간을 표현하는 데 적합합니다. 반면 한 process 안에서 timeout이나 작업 소요 시간을 재려면 clock 조정의 영향을 받지 않는 monotonic time이 더 적합합니다.

```text
wall clock      → 실제 시각, 기록 시각, 달력 기반 만료
monotonic time  → elapsed time, local timeout, backoff
```

서로 다른 host가 남긴 wall-clock timestamp만 비교해 두 event의 인과 순서를 단정하면 안 됩니다. 순서가 중요한 protocol에서는 revision, sequence, term처럼 해당 시스템이 제공하는 논리적 순서 정보를 사용합니다.

분산 호출에서는 hop마다 독립적인 timeout을 새로 부여하는 것보다 상위 요청의 전체 deadline을 전달하는 편이 안전합니다. 이미 앞 단계에서 800ms를 소비했다면 downstream은 원래 2초를 다시 얻는 것이 아니라 남은 budget 안에서 끝나야 합니다.

```text
client deadline: 2s
  ├─ service A에서 0.8s 사용
  └─ service B에는 약 1.2s의 남은 budget 전달
```

gRPC도 deadline propagation 과정에서 이미 지난 시간을 제외한 timeout을 downstream으로 전달해 서로 다른 host의 clock skew 영향을 줄입니다. 다만 deadline이 지났다고 application이 시작한 모든 background 작업이 자동으로 멈추는 것은 아니므로, server code도 cancellation을 확인하고 불필요한 작업을 종료해야 합니다.

핵심은 **실제 시각, 경과 시간, 요청의 남은 시간 예산을 같은 개념으로 사용하지 않는 것**입니다. 이 구분이 있어야 다음 부분 장애 상황에서 timeout을 곧바로 실패 확정으로 오해하지 않을 수 있습니다.

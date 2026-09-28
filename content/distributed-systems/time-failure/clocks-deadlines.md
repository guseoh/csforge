---
kind: concept
contentKey: distributed.core.time-failure.clocks-deadlines
topicContentKey: distributed.core.time-failure
slug: clocks-deadlines
title: "분산 환경의 시계와 요청 기한"
summary: "실제 시각을 표현하는 wall clock과 경과 시간을 재는 monotonic time을 구분하고, 여러 구간을 지나는 요청에 전체 기한을 전달하는 이유를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/info/rfc5905"
    title: "RFC 5905: Network Time Protocol Version 4"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "분산 노드의 시계 동기화와 오차가 생기는 배경 확인"
  - url: "https://grpc.io/docs/guides/deadlines/"
    title: "gRPC Documentation: Deadlines"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "요청 기한 전파와 서로 다른 호스트의 시계 오차를 줄이는 방식 확인"
---
# 분산 환경의 시계와 요청 기한

한 프로세스 안에서는 `현재 시각`을 하나의 값처럼 사용하기 쉽지만, 여러 노드가 통신하는 분산 환경에서는 서로의 wall clock이 완전히 같다고 가정할 수 없습니다. NTP 같은 동기화를 사용해도 작은 시계 오차(clock skew)와 시각 조정은 남을 수 있으므로, 먼저 시간을 어떤 목적으로 사용하는지 구분해야 합니다.

Wall clock은 사용자에게 보여 줄 시각이나 만료 날짜처럼 달력상의 시간을 표현하는 데 적합합니다. 반면 한 프로세스 안에서 시간 초과나 작업 소요 시간을 재려면 시각 조정의 영향을 받지 않는 monotonic time이 더 적합합니다.

```text
wall clock      → 실제 시각, 기록 시각, 달력 기반 만료
monotonic time  → 경과 시간, 로컬 시간 초과, 재시도 대기 시간
```

서로 다른 호스트가 남긴 wall-clock timestamp만 비교해 두 이벤트의 인과 순서를 단정하면 안 됩니다. 순서가 중요한 프로토콜에서는 리비전(revision), 순번(sequence), 세대(term)처럼 해당 시스템이 제공하는 논리적 순서 정보를 사용합니다.

분산 호출에서는 각 구간마다 독립적인 시간 초과를 새로 부여하는 것보다 상위 요청의 전체 요청 기한(deadline)을 전달하는 편이 안전합니다. 이미 앞 단계에서 800ms를 소비했다면 하위 서비스가 원래 2초를 다시 얻는 것이 아니라 남은 시간 예산 안에서 끝나야 합니다.

```text
클라이언트 요청 기한: 2초
  ├─ 서비스 A에서 0.8초 사용
  └─ 서비스 B에는 약 1.2초의 남은 시간 예산 전달
```

gRPC도 요청 기한을 전달할 때 이미 지난 시간을 제외한 남은 시간 초과 값을 하위 호출에 전달해 서로 다른 호스트의 시계 오차 영향을 줄입니다. 다만 요청 기한이 지났다고 애플리케이션이 시작한 모든 백그라운드 작업이 자동으로 멈추는 것은 아니므로, 서버 코드도 취소 신호(cancellation)를 확인하고 더 이상 필요하지 않은 작업을 종료해야 합니다.

핵심은 **실제 시각, 경과 시간, 요청의 남은 시간 예산을 같은 개념으로 사용하지 않는 것**입니다. 이 구분이 있어야 다음 부분 장애 상황에서 시간 초과를 곧바로 실패 확정으로 오해하지 않을 수 있습니다.

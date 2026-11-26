---
kind: concept
contentKey: network-http.core.http-versions.transport-head-of-line
topicContentKey: network-http.core.http-versions
slug: transport-head-of-line
title: "전송 계층의 HOL 차단"
summary: "HTTP/2 스트림 다중화 아래에서도 TCP의 순서 보장 때문에 하나의 손실이 여러 스트림 전달을 함께 지연시킬 수 있는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9000"
    title: "QUIC: A UDP-Based Multiplexed and Secure Transport"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QUIC 연결·스트림·손실 복구와 혼잡 제어의 기본 규칙을 확인한다."
    displayOrder: 1
---
# 전송 계층의 HOL 차단

HTTP/2는 여러 HTTP 스트림의 프레임을 하나의 TCP 바이트 스트림에 교차 배치합니다. TCP의 앞쪽 바이트가 유실되면 뒤 바이트가 도착해도 누락 구간을 건너뛰어 애플리케이션에 전달할 수 없습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "전송 계층의 HOL 차단",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "transport-head-of-line"
}
```

예를 들어 스트림 A의 프레임 일부가 손실되고 스트림 B의 프레임 바이트가 그 뒤에 있다면, B도 TCP의 연속 전달이 재개될 때까지 기다릴 수 있습니다. HTTP/1.1 파이프라이닝의 응답 순서 차단과는 다른 계층의 문제입니다.

QUIC에서는 스트림별 offset으로 수신 순서를 관리합니다. A의 누락 구간이 B의 순서 자체를 차단하지 않으므로 B의 필요한 데이터가 도착했다면 전달을 진행할 수 있습니다.

### 성능상의 경계

QUIC의 여러 스트림은 네트워크 대역폭과 연결 수준 혼잡 제어를 공유합니다. 하나의 패킷에 여러 스트림의 데이터가 담겨 함께 손실될 수도 있습니다. 애플리케이션의 작업 의존성과 헤더 압축에 따른 대기도 남을 수 있습니다.

따라서 HTTP/3는 TCP 바이트 스트림의 스트림 간 HOL을 개선하지만 모든 지연이나 혼잡을 제거하지는 않습니다. 실제 전환 효과는 손실, RTT, 스트림별 지연을 관찰해 판단합니다.

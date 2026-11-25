---
kind: concept
contentKey: network-http.core.tcp.tcp-head-of-line
topicContentKey: network-http.core.tcp
slug: tcp-head-of-line
title: "TCP 전송 계층 HOL 차단"
summary: "앞선 바이트 범위의 손실이 복구될 때까지 뒤에 이미 도착한 바이트도 애플리케이션 전달을 기다리는 TCP HOL을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# TCP 전송 계층 HOL 차단

TCP는 하나의 연결에 있는 데이터를 시퀀스 순서대로 전달합니다. 앞쪽 바이트가 손실되면 뒤쪽 바이트가 먼저 도착해도 순서 있는 스트림의 다음 데이터로 전달할 수 없습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "TCP 전송 계층 HOL 차단",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "tcp-head-of-line"
}
```

수신 버퍼가 선도착 데이터를 보존하고 있다고 가정하면 누락 구간이 복구되는 순간 연속 범위가 확장되고 이후 데이터도 전달할 수 있습니다. 이를 TCP 전송 계층의 Head-of-Line(HOL) 차단이라고 부릅니다.

### HTTP 버전과의 관계

HTTP/2는 여러 논리 스트림의 프레임을 한 TCP 연결에 교차 배치하여 HTTP 응답 순서 제약을 줄입니다. 하지만 프레임들이 하나의 TCP 바이트 스트림 위에 있으므로 앞 바이트가 손실되면 뒤쪽 다른 스트림 프레임도 전달되지 않을 수 있습니다.

QUIC은 스트림별 offset으로 순서 상태를 관리합니다. A의 손실 구간이 B의 필요한 데이터까지 같은 방식으로 차단하지 않습니다. 그러나 혼잡 제어, 대역폭 및 연결 수준 흐름 제어는 공유하며 애플리케이션 자체의 의존성도 남을 수 있습니다.

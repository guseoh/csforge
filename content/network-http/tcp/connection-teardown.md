---
kind: concept
contentKey: network-http.core.tcp.connection-teardown
topicContentKey: network-http.core.tcp
slug: connection-teardown
title: "TCP 연결 종료"
summary: "TCP의 양방향 바이트 스트림을 FIN·ACK로 방향별 종료하고 정상 종료와 RST 중단을 구분하는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# TCP 연결 종료

TCP는 양방향 바이트 스트림을 제공합니다. 양쪽의 송신 방향을 독립적으로 종료할 수 있으며, FIN은 자신의 송신 방향에 더 이상 보낼 데이터가 없다는 신호입니다.

```csforge-viz
{
  "version": 1,
  "type": "network-core",
  "title": "TCP 양방향 종료와 TIME_WAIT",
  "description": "클라이언트가 먼저 FIN을 보내는 정상 종료 사례입니다. 각 FIN·ACK의 송신과 수신, half-close와 TIME_WAIT를 분리해 보여줍니다.",
  "example": "tcp-teardown"
}
```

그림은 클라이언트가 먼저 종료하는 일반적인 예입니다. 첫 FIN을 받은 서버는 CLOSE-WAIT 상태에서 자신의 송신 방향으로 데이터를 계속 보낼 수 있습니다. 서버가 송신을 종료하여 FIN을 보내면 클라이언트는 이를 확인하고 TIME-WAIT 상태로 진입합니다. FIN과 ACK가 항상 서로 다른 네 개의 세그먼트로 전송되는 것은 아닙니다.

### FIN과 RST

FIN은 바이트 스트림의 정상적인 끝을 나타내며 시퀀스 공간 한 위치를 소비합니다. 수신 측은 앞선 데이터가 전달된 후 EOF를 관찰할 수 있습니다. RST는 연결을 중단하는 신호로 정상 EOF와 구분해야 합니다.

HTTP 응답의 길이가 1000바이트로 선언되어 있는데 600바이트만 받은 뒤 FIN이 도착했다면 TCP의 정상 종료와 별개로 HTTP 응답은 불완전합니다. TCP EOF만으로 HTTP 프레이밍의 완료나 업무 성공을 판단하지 않습니다.

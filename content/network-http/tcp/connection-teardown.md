---
kind: concept
contentKey: network-http.core.tcp.connection-teardown
topicContentKey: network-http.core.tcp
slug: connection-teardown
title: "Connection Teardown"
summary: "FIN·ACK 교환과 half-close 상태를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# Connection Teardown

TCP connection은 양방향 byte stream이므로 한쪽 방향의 전송 종료와 connection 전체 종료를 구분한다. Endpoint가 자신의 송신 stream에 더 보낼 data가 없으면 **FIN**을 보내고, peer는 그 FIN을 ACK한다. 반대 방향 stream은 별도로 계속 열려 있을 수 있다.

```text
A ── FIN ──> B   A → B 방향 종료
A <─ ACK ─── B

B는 아직 A에게 data를 보낼 수 있음

A <─ FIN ─── B   B → A 방향도 종료
A ── ACK ──> B
```

이처럼 한쪽 송신만 닫힌 상태를 half-close라고 볼 수 있다.

### FIN과 RST는 의미가 다르다

FIN은 orderly하게 byte stream의 끝을 알리는 control이다. Receiver는 FIN 이전까지 정상적으로 전달된 bytes를 읽은 뒤 EOF를 관찰할 수 있다.

RST는 정상적인 stream 종료와 달리 connection을 abort하는 신호다. 현재 connection state가 더 이상 유효하지 않거나 즉시 연결을 중단해야 하는 상황에서 사용될 수 있다.

### Transport EOF와 application 완료는 다르다

Peer의 FIN을 받았다는 것은 상대 TCP가 더 이상 그 방향으로 bytes를 보내지 않는다는 뜻이다. 상대 application이 business operation을 성공적으로 commit했다는 뜻은 아니다.

Connection Teardown의 핵심은 **TCP의 두 방향을 독립적으로 종료할 수 있으며 FIN/ACK를 통한 orderly close와 RST 기반 abort를 구분해야 한다는 것**이다.

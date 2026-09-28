---
kind: concept
contentKey: network-http.core.tcp.three-way-handshake
topicContentKey: network-http.core.tcp
slug: three-way-handshake
title: "TCP 3방향 핸드셰이크"
summary: "SYN·SYN-ACK·ACK를 통해 양쪽의 초기 시퀀스 번호를 확인하고 TCP 연결 상태를 ESTABLISHED로 만드는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
---
# TCP 3방향 핸드셰이크

TCP로 데이터를 주고받기 전에 양쪽 종단점은 **서로의 초기 시퀀스 번호를 알리고 확인하면서 연결 상태를 맞춰야 한다.** 일반적인 능동 연결 수립에서 이 과정이 `SYN → SYN-ACK → ACK`의 3방향 핸드셰이크다.

```text
Client                         Server
  | -------- SYN, seq=x ------> |
  | <--- SYN,ACK seq=y ack=x+1 -|
  | -------- ACK ack=y+1 ------>|
```

첫 SYN은 클라이언트가 자신의 초기 시퀀스 번호 `x`를 알린다. 서버는 SYN-ACK로 이를 확인하면서 자신의 초기 시퀀스 번호 `y`를 보낸다. 클라이언트가 마지막 ACK로 서버의 SYN까지 확인하면 양쪽은 데이터 교환이 가능한 연결 상태로 들어갈 수 있다.

### 왜 단순히 `연결하자` 한 번으로 끝내지 않는가

TCP는 양방향 바이트 스트림이다. 양쪽이 각각 자신이 보낼 바이트의 시퀀스 공간을 시작하고, 상대가 그 시작점을 받았다는 사실까지 확인해야 이후 ACK와 재전송을 일관되게 해석할 수 있다.

또한 네트워크에 늦게 남아 있던 과거 세그먼트와 새 연결의 세그먼트를 구분하는 데도 연결별 시퀀스 상태가 중요하다.

### TCP 연결 수립은 TLS·HTTP 성공보다 앞 단계다

3방향 핸드셰이크가 성공했다는 것은 **전송 계층 TCP 연결이 성립했다**는 뜻이다. HTTPS라면 그다음 TLS 핸드셰이크가 실패할 수 있고, TLS가 성공해도 HTTP 요청이나 애플리케이션 업무 처리가 실패할 수 있다.

```text
TCP 3-way handshake
        ↓
TLS handshake (HTTPS라면)
        ↓
HTTP 요청/응답
        ↓
애플리케이션 업무 처리
```

핵심은 **TCP 3방향 핸드셰이크가 양쪽의 초기 시퀀스 상태를 확인해 신뢰성 바이트 스트림을 시작할 전송 계층 상태를 만드는 과정**이라는 점이다.

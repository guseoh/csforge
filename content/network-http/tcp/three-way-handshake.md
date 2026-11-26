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

TCP 연결을 시작하려면 양쪽의 초기 시퀀스 번호와 연결 상태를 맞춰야 합니다. 일반적인 능동 연결 수립에서는 SYN, SYN-ACK, ACK를 교환합니다.

```csforge-viz
{
  "version": 1,
  "title": "TCP 연결 수립의 메시지와 양쪽 상태",
  "description": "SYN은 시퀀스 번호 하나를 차지합니다. SYN-ACK는 ack=101, 마지막 ACK는 seq=101·ack=301이며, 서버가 이 ACK를 받은 뒤 양쪽이 ESTABLISHED가 됩니다.",
  "type": "tcp-handshake",
  "clientIsn": 100,
  "serverIsn": 300
}
```

그림에서 클라이언트의 ISN은 100이고 서버의 ISN은 300입니다. SYN이 시퀀스 공간 한 위치를 소비하므로 서버는 ACK 101로 응답하고 자신의 SYN을 SEQ 300으로 보냅니다. 클라이언트의 마지막 ACK는 SEQ 101, ACK 301입니다.

마지막 ACK가 전송 중일 때 클라이언트는 ESTABLISHED이지만 서버는 아직 SYN-RECEIVED 상태입니다. 서버가 마지막 ACK를 정상적으로 받으면 양쪽이 ESTABLISHED가 됩니다.

### 세 번의 교환이 필요한 이유

두 방향의 초기 시퀀스 번호를 알리고 상대가 이를 받았는지 확인합니다. 이 상태는 지연된 이전 연결의 세그먼트를 새 연결과 구분하고 이후 ACK와 재전송을 해석하는 데 중요합니다.

위 도식은 데이터가 없는 일반 연결 수립 예시이며 재전송, 동시 열기, TCP Fast Open 등은 제외합니다. TCP 연결 수립이 성공해도 TLS 인증, HTTP 처리 및 업무 트랜잭션은 별도로 실패할 수 있습니다.

---
kind: concept
contentKey: network-http.core.request-journey.transport-establishment
topicContentKey: network-http.core.request-journey
slug: transport-establishment
title: "전송 연결 수립"
summary: "선택한 목적지와 HTTP 버전에 따라 TCP 또는 QUIC 연결 상태가 준비되고, 기존 연결 재사용 여부가 실제 요청 경로를 바꾸는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결, 바이트 스트림, 시퀀스·ACK와 연결 상태의 기본 규칙을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc9000.html#section-2"
    title: "RFC 9000 §2: QUIC Streams"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QUIC의 연결 안에 있는 신뢰성 있는 스트림과 UDP 데이터그램 운반 경계를 확인한다."
    displayOrder: 2
    relationNote: "TCP 연결과 QUIC 연결·스트림이 서로 다른 전송 모델이라는 점을 비교한다."
---
# 전송 연결 수립

DNS로 목적지 주소를 얻었더라도 HTTP 메시지를 전달할 전송 상태가 필요합니다. TCP 기반 HTTP/1.1·2에서는 TCP 핸드셰이크로 양방향 바이트 스트림을 사용할 연결을 구성합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-core",
  "title": "HTTP 요청과 TCP 세그먼트의 다른 경계",
  "description": "HTTP/1.1 요청 한 개를 TCP의 바이트 스트림으로 운반하는 예시입니다. 데이터 세그먼트의 분할 수는 고정되지 않습니다.",
  "example": "http-over-tcp"
}
```

그림은 HTTP/1.1 요청 하나가 TCP 바이트 스트림을 통해 여러 세그먼트로 전달될 수 있음을 보여 줍니다. TCP의 read 경계는 HTTP 메시지 경계와 일치하지 않습니다.

HTTP/3는 UDP 데이터그램 위에서 동작하는 QUIC의 연결 및 스트림을 사용합니다. QUIC은 자체 연결 상태, 신뢰성, 손실 복구, 혼잡 제어와 TLS 기반 보안을 제공합니다. UDP를 사용한다고 HTTP/3에 연결 상태가 없는 것은 아닙니다.

### 연결과 요청은 일대일이 아닙니다

HTTP/1.1의 지속 연결이나 HTTP/2·3의 다중화를 통해 같은 연결에서 여러 요청을 처리할 수 있습니다. 기존 연결이 없거나 사용할 수 없을 때 새 연결을 만듭니다.

URL 요청의 흐름을 항상 DNS → TCP → HTTP로 고정해 외우지 않습니다. 캐시, 연결 재사용, 전송 버전 및 보안 상태를 고려합니다. 연결 성공도 TLS 인증이나 HTTP 업무 처리 성공과는 별개입니다.

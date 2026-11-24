---
kind: concept
contentKey: network-http.core.request-journey.tls-before-http
topicContentKey: network-http.core.request-journey
slug: tls-before-http
title: "HTTP 전 TLS 연결"
summary: "새 HTTPS 통신에서 보호된 HTTP 데이터를 보내기 전에 TLS 보안 상태가 준비되는 일반 흐름과 연결 재사용·0-RTT 같은 예외를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "RFC 8446은 2026년 RFC 9846으로 대체되었다. 이 링크는 초기 TLS 1.3 규격의 근거다."
  - url: "https://www.rfc-editor.org/rfc/rfc9846"
    title: "RFC 9846: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현행 TLS 1.3 표준의 핸드셰이크·키·보안 요구사항을 확인한다."
    displayOrder: 2
    relationNote: "RFC 9846 §1.2와 TLS 1.3 보안 상태 구성을 확인한다."
  - url: "https://www.rfc-editor.org/rfc/rfc9001.html#section-4"
    title: "RFC 9001 §4: Using TLS to Secure QUIC"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS 1.3 핸드셰이크와 QUIC CRYPTO 프레임의 관계를 확인한다."
    displayOrder: 3
    relationNote: "HTTP/3가 별도 TLS 레코드 계층 대신 QUIC의 CRYPTO 프레임으로 키 합의를 운반하는 방식을 읽는다."
---
# HTTP 전 TLS 연결

새 HTTPS 연결을 사용하려면 상대 인증과 데이터 보호에 필요한 암호 상태를 준비해야 합니다. HTTP 버전에 따라 TLS가 전송 프로토콜과 결합되는 방식은 다릅니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "HTTP 전 TLS 연결",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "tls-before-http"
}
```

TCP 기반 HTTP/1.1·2의 HTTPS는 TCP 연결 위에 TLS 핸드셰이크를 수행하고 HTTP 데이터를 TLS 레코드로 보호합니다. HTTP/3에서는 UDP 위의 QUIC에 TLS 1.3이 통합됩니다. QUIC CRYPTO 프레임에 TLS 핸드셰이크 메시지를 전달하며 HTTP 스트림은 QUIC 패킷 보호를 사용합니다. TLS 레코드 계층을 TCP와 동일하게 사용하는 구조가 아닙니다.

### 연결 재사용과 0-RTT

이미 사용 가능한 보호 연결이 있다면 새 요청마다 핸드셰이크를 반복하지 않습니다. 연결 풀, HTTP/2 및 HTTP/3 다중화가 이 비용을 줄이는 데 도움이 됩니다.

재개 연결에서 0-RTT 조기 데이터를 사용할 수 있는 경우 핸드셰이크가 최종 완료되기 전에 일부 애플리케이션 데이터를 보낼 수 있습니다. 그러나 replay 위험이 있으므로 일반적인 요청과 같은 실행 안전성을 가정해서는 안 됩니다. 결제·주문 생성 등의 요청에 대해서는 허용 정책과 중복 효과 방지를 별도로 설계합니다.

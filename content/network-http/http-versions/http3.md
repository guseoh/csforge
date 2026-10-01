---
kind: concept
contentKey: network-http.core.http-versions.http3
topicContentKey: network-http.core.http-versions
slug: http3
title: "HTTP/3와 QUIC"
summary: "HTTP 의미 체계(HTTP semantics)를 QUIC 스트림(stream)과 QPACK 위에 매핑하는 HTTP/3의 전송 계층(transport) 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9114"
    title: "RFC 9114: HTTP/3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# HTTP/3와 QUIC

HTTP/3는 GET·POST 같은 메서드, 상태 코드, 헤더 필드와 표현 같은 HTTP 의미를 유지하면서 전송 방식을 QUIC 위로 옮긴 HTTP 버전이다. HTTP/1.1의 텍스트 메시지 프레이밍이나 HTTP/2의 TCP 연결을 그대로 UDP 데이터그램에 넣는 방식은 아니다.

요청·응답에는 QUIC 양방향 스트림을 사용하고, 연결 제어와 QPACK 헤더 압축에는 별도의 단방향 스트림을 사용한다. QUIC 자체가 암호화와 스트림별 신뢰성 전달을 제공하므로 HTTP/3는 TCP 위에 별도 TLS 계층을 쌓는 HTTP/2와 연결 구조가 다르다.

```text
HTTP 의미
      ↓
HTTP/3 프레이밍 + QPACK
      ↓
QUIC 스트림 / 암호화된 전송
      ↓
UDP / IP
```

스트림별 독립 오프셋과 순서 전달 덕분에 한 요청 스트림의 누락 데이터가 다른 스트림의 순서 전달을 TCP와 같은 방식으로 막지는 않는다. 다만 혼잡, 대역폭과 애플리케이션 간 의존성이 사라지는 것은 아니다.

HTTP 버전이 바뀌어도 메서드 의미나 인가 계약이 자동으로 바뀌지 않는다. **HTTP/3의 핵심 변화는 HTTP 의미 자체보다 QUIC 기반 전송과 프레이밍 방식에 있다.**

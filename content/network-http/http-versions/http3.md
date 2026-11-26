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

HTTP/3는 메서드, 상태 코드, 필드, 표현이라는 HTTP 의미를 QUIC에 매핑하는 버전입니다. HTTP/1.1의 텍스트 메시지를 UDP에 직접 담는 방식이 아닙니다.

```text
HTTP 의미
→ HTTP/3 프레임 · QPACK
→ QUIC 스트림 및 패킷 보호
→ UDP / IP
```

요청과 응답에는 일반적으로 클라이언트가 시작한 양방향 QUIC 스트림을 사용합니다. 연결 제어와 QPACK의 인코더·디코더에는 별도의 단방향 스트림이 사용됩니다. QUIC에 통합된 TLS 1.3은 키와 인증 상태를 준비하며 HTTP/3의 데이터는 QUIC 패킷 보호를 사용합니다.

### 개선되는 지연과 남는 제약

한 스트림에 누락 구간이 생겨도 다른 스트림의 필요한 데이터가 모두 도착했다면 순서 전달을 진행할 수 있습니다. 그러나 연결 수준 혼잡 제어, 흐름 제어, QPACK의 동적 테이블 의존성 및 애플리케이션 병목은 여전히 영향을 줍니다.

UDP 경로가 차단되면 HTTP/3 연결을 사용할 수 없는 경우가 있으며 클라이언트는 지원되는 다른 HTTP 버전을 시도할 수 있습니다. 버전 선택과 재시도 정책은 실제 배포 환경에 맞춰 판단합니다.

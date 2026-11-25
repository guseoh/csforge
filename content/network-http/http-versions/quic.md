---
kind: concept
contentKey: network-http.core.http-versions.quic
topicContentKey: network-http.core.http-versions
slug: quic
title: "QUIC 전송 계층"
summary: "UDP 위에서 암호화된 연결(encrypted connection), 신뢰성 있는 스트림(reliable stream), 혼잡 제어(congestion control)를 제공하는 QUIC 전송 프로토콜을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9000"
    title: "QUIC: A UDP-Based Multiplexed and Secure Transport"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QUIC 연결·스트림·손실 복구와 혼잡 제어의 기본 규칙을 확인한다."
    displayOrder: 1
---
# QUIC 전송 계층

HTTP/2에서 여러 응답을 다중화해도 아래의 TCP 연결에서 앞쪽 바이트가 유실되면 이후에 도착한 프레임을 전달하지 못할 수 있습니다. QUIC은 이러한 전송 경계를 개선하기 위해 UDP 데이터그램 위에 별도의 연결 및 다중 스트림 전송을 구현합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "QUIC 전송 계층",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "quic"
}
```

QUIC의 스트림은 순서 있는 바이트 흐름이며 각각 독립적인 offset을 사용합니다. 스트림 A의 offset 일부가 손실돼도 B의 필요한 데이터가 도착했다면 B는 전달을 진행할 수 있습니다. 단, B의 데이터와 필요한 제어 정보까지 실제로 도착했다는 전제가 필요합니다.

### 패킷 번호와 스트림 offset

QUIC 패킷 번호는 패킷 손실 감지와 ACK 처리에 사용합니다. 스트림 offset은 해당 스트림에서 데이터가 위치한 바이트 범위를 나타냅니다. 손실 복구 시에는 필요한 정보를 새로운 패킷 번호를 사용하는 패킷으로 전송할 수 있습니다. TCP의 sequence number와 QUIC의 packet number를 같은 의미로 보면 안 됩니다.

### TLS와 연결 이동

QUIC은 TLS 1.3의 핸드셰이크와 키 스케줄을 통합하지만 TCP 위 TLS처럼 TLS 레코드 계층으로 HTTP 데이터를 전송하지 않습니다. 핸드셰이크 메시지는 CRYPTO 프레임에 담기고, 애플리케이션 스트림 데이터는 QUIC의 보호를 받습니다.

연결 ID와 경로 검증은 주소·포트가 바뀌어도 연결을 유지하는 기능에 기여합니다. 모든 이동이 허용되거나 항상 성공한다는 뜻은 아닙니다.

### 남아 있는 제약

한 연결의 스트림들은 혼잡 제어와 네트워크 대역폭을 공유하며 연결 수준 흐름 제어의 영향을 받습니다. HTTP/3의 헤더 압축 상태나 애플리케이션 요청 간 의존성도 대기를 발생시킬 수 있습니다. UDP가 차단된 환경에서는 HTTP/3 연결을 사용할 수 없어 TCP 기반 HTTP 버전으로 대체할 필요가 있습니다.

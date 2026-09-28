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
---
# 전송 연결 수립

DNS와 라우팅을 거쳐 목적지 주소와 경로가 정해졌다고 해서 곧바로 HTTP 메시지를 보낼 수 있는 것은 아니다. HTTP 데이터를 운반할 **전송 계층의 통신 상태**가 먼저 필요하다.

HTTP/1.1이나 HTTP/2를 TCP 위에서 사용할 때는 클라이언트와 서버가 TCP 3방향 핸드셰이크를 거쳐 양방향 바이트 스트림을 사용할 연결을 만든다.

```text
클라이언트                 서버
   ───── SYN ────────────>
   <── SYN + ACK ─────────
   ───── ACK ────────────>

        TCP 연결 준비
```

이 연결이 성립했다는 것은 두 TCP 종단점이 데이터를 주고받을 전송 상태를 만들었다는 뜻이지, 그 위의 TLS나 HTTP 요청까지 성공했다는 뜻은 아니다.

### HTTP/3는 QUIC 연결을 사용한다

HTTP/3는 QUIC 위에서 동작한다. QUIC은 UDP 데이터그램을 기반으로 하지만 단순한 raw UDP 사용과는 다르다. QUIC 프로토콜 자체가 연결 상태, 신뢰성 있는 스트림, 손실 복구, 혼잡 제어와 TLS 1.3 기반 보안 핸드셰이크를 제공한다.

따라서 `UDP를 사용하므로 HTTP/3에는 연결이 없다`고 설명하면 부정확하다.

```text
HTTP/1.1·HTTP/2
HTTP → TCP 연결 → IP

HTTP/3
HTTP → QUIC 연결·스트림 → UDP → IP
```

### HTTP 요청마다 새 연결을 만드는 것은 아니다

이미 사용할 수 있는 연결이 있다면 클라이언트는 기존 연결을 재사용할 수 있다. HTTP/1.1의 지속 연결이나 연결 풀을 사용할 수 있고, HTTP/2·HTTP/3는 하나의 연결 안에 여러 논리 스트림을 두어 여러 요청을 처리할 수 있다.

그래서 다음 관계는 성립하지 않는다.

```text
HTTP 요청 1개 = TCP·QUIC 연결 1개
```

한 연결이 여러 요청을 처리할 수도 있고, 장애·부하 분산·연결 수명 때문에 새 연결이 만들어질 수도 있다.

### 실제 요청 흐름은 항상 `DNS → TCP → HTTP`로 고정되지 않는다

DNS 결과가 캐시되어 있을 수 있고, 기존 연결을 재사용할 수도 있으며, HTTP/3라면 TCP 자체를 사용하지 않는다. 따라서 URL을 입력했을 때의 흐름을 하나의 고정된 명령 목록으로 외우기보다 **현재 어떤 상태가 이미 준비되어 있고 어떤 전송 프로토콜을 사용하는지**를 봐야 한다.

장애 분석에서도 이 구분이 중요하다. DNS는 성공했지만 TCP `connect()`가 타임아웃될 수 있고, TCP 연결은 성공했지만 TLS 인증에서 실패할 수 있다. 각 단계가 별도의 성공·실패 경계를 가진다.

핵심은 **HTTP를 보내기 전에 그 바이트를 운반할 TCP 또는 QUIC 연결 상태가 필요하며, 연결 수립 성공은 HTTP 처리 성공보다 아래 단계의 보장이라는 점**이다.

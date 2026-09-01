---
kind: concept
contentKey: infrastructure.core.network.dns-tls
topicContentKey: infrastructure.core.network
slug: dns-tls
title: "DNS와 TLS certificate lifecycle"
summary: "name resolution과 certificate issuance·rotation·expiry를 connection failure와 연결한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "DNS name resolution의 기본 모델 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "TLS 1.3 handshake와 server authentication 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc9114"
    title: "RFC 9114: HTTP/3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "HTTP/3가 QUIC 위에서 동작해 TCP 기반 HTTP/1.1·HTTP/2와 transport 경계가 다른 점 확인"
---
# DNS와 TLS certificate lifecycle

사용자가 `api.example`을 호출할 때 이름을 endpoint address로 해석하는 DNS 단계와, HTTPS 연결에서 server identity를 검증하는 TLS 단계는 서로 다른 실패 경계입니다. 다만 **DNS 다음에 항상 TCP가 오고 그다음 TLS가 온다고 일반화하면 안 됩니다.** HTTP version과 transport에 따라 연결 수립 경로가 달라집니다.

```text
api.example
  └─ DNS lookup -> endpoint address
       ├─ HTTP/1.1·HTTP/2 over HTTPS: TCP -> TLS -> HTTP
       └─ HTTP/3: QUIC(TLS handshake 포함) -> HTTP/3
```

HTTP/1.1과 HTTP/2를 HTTPS로 사용할 때는 일반적으로 TCP 연결 위에서 TLS를 수립하지만, HTTP/3는 QUIC 위에서 동작하며 QUIC handshake가 TLS를 통합합니다. 따라서 장애를 분석할 때 “DNS → TCP → TLS → HTTP” 한 줄을 모든 HTTP 요청의 protocol guarantee로 사용하지 않고 실제 negotiated protocol과 client/network 경계를 확인합니다.

DNS record 변경은 TTL·resolver cache 때문에 즉시 모든 client에 반영되지 않을 수 있습니다. TLS certificate는 hostname·validity·trust chain을 만족해야 하며 expiry나 잘못된 SAN은 application-level HTTP response를 받기 전에 연결을 실패시킬 수 있습니다.

### rotation은 만료 전 transition이다

새 certificate를 발급하고 load balancer/secret store에 배포한 뒤 old certificate를 얼마 동안 함께 허용할지, 모든 instance가 새 material을 읽었는지 확인해야 합니다. 만료 직전에 수동 교체하면 rollout 일부만 성공하거나 stale process가 남는 장애가 생길 수 있습니다.

### DNS와 TLS를 application retry로 덮지 않는다

DNS misconfiguration이나 certificate expiry를 무한 retry하면 traffic과 alert만 늘어납니다. resolver 결과·negotiated protocol·certificate chain·deployment version을 확인하고, failure가 모든 region/instance에 공통인지 분리합니다.

### 문제를 풀 때 확인할 것

1. DNS resolution과 이후 transport/security establishment, HTTP processing을 분리합니다.
2. HTTP/1.1·HTTP/2의 TCP+TLS 경로와 HTTP/3의 QUIC 경로를 구분합니다.
3. DNS cache/TTL과 certificate expiry를 함께 봅니다.
4. rotation 중 old/new instance의 certificate material을 확인합니다.
5. hostname/SAN/trust chain과 secret reload, 만료 전 자동화·alert를 테스트합니다.

### 면접에서 설명한다면

DNS는 name을 address로 해석하고 TLS는 HTTPS endpoint의 identity와 encrypted connection을 만드는 데 참여합니다. 다만 transport는 HTTP version에 따라 달라져 HTTP/1.1·2는 보통 TCP+TLS, HTTP/3는 QUIC을 사용합니다. DNS cache와 certificate rotation의 transition을 고려하지 않으면 일부 client나 instance만 새 설정을 사용하거나 만료 시 HTTP 처리 전에 연결이 실패할 수 있으므로 protocol 경계별로 검증·관측합니다.


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
    relationNote: "TLS handshake와 인증서 기반 server authentication 확인"
---
# DNS와 TLS certificate lifecycle

사용자가 `api.example`을 호출할 때 이름이 IP로 해석되는 DNS 단계와, 그 IP의 server가 certificate로 이름을 증명하는 TLS 단계는 서로 다른 실패 경계입니다.

```text
api.example
  ├─ DNS lookup -> address
  ├─ TCP/TLS handshake -> certificate/name 검증
  └─ HTTP request
```

DNS record 변경은 TTL·resolver cache 때문에 즉시 모든 client에 반영되지 않을 수 있습니다. TLS certificate는 hostname·validity·trust chain을 만족해야 하며 expiry나 잘못된 SAN은 application request 전에 connection failure를 만듭니다.

### rotation은 만료 전 transition이다

새 certificate를 발급하고 load balancer/secret store에 배포한 뒤 old certificate를 얼마 동안 함께 허용할지, 모든 instance가 새 material을 읽었는지 확인해야 합니다. 만료 직전에 수동 교체하면 rollout 일부만 성공하거나 stale process가 남는 장애가 생길 수 있습니다.

### DNS와 TLS를 application retry로 덮지 않는다

DNS misconfiguration이나 certificate expiry를 무한 retry하면 traffic과 alert만 늘어납니다. resolver 결과·certificate chain·deployment version을 확인하고, failure가 모든 region/instance에 공통인지 분리합니다.

### 문제를 풀 때 확인할 것

1. DNS resolution, TCP connect, TLS verification, HTTP response를 분리합니다.
2. DNS cache/TTL과 certificate expiry를 함께 봅니다.
3. rotation 중 old/new instance의 material을 확인합니다.
4. hostname/SAN/trust chain과 secret reload를 테스트합니다.
5. 만료 전 자동화와 alert를 운영합니다.

### 면접에서 설명한다면

DNS는 name을 address로 해석하고 TLS는 그 endpoint가 올바른 이름과 trust를 가진지 검증하는 별도 단계입니다. DNS cache와 certificate rotation의 transition을 고려하지 않으면 일부 instance만 새 설정을 사용하거나 만료 시 request 전에 연결이 실패할 수 있으므로 자동 갱신·검증·관측을 둡니다.


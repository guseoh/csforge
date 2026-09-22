---
kind: concept
contentKey: network-http.core.tls.tls-termination
topicContentKey: network-http.core.tls
slug: tls-termination
title: "TLS Termination과 Trust Boundary"
summary: "proxy에서 TLS를 종료할 때 client-proxy와 proxy-backend가 별도 connection과 trust boundary가 되는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# TLS Termination과 Trust Boundary

reverse proxy나 load balancer가 client와 직접 TLS handshake를 수행하면 그 장비가 TLS endpoint가 된다. client가 보낸 encrypted application data는 proxy에서 복호화되고, proxy는 내용을 읽은 뒤 backend로 별도의 connection을 만들어 전달한다. 이것이 TLS termination이다.

이 구조에서는 `client → proxy`와 `proxy → backend`가 같은 end-to-end TLS connection이 아니다. 첫 구간의 certificate와 key는 proxy에서 끝나고, backend 구간은 평문 HTTP일 수도 있고 새로운 TLS connection일 수도 있다.

```text
Client ── TLS connection A ──> [Proxy: 복호화·HTTP 처리]
                                  │
                                  └── HTTP 또는 TLS connection B ──> Backend
```

암호화와 peer identity 검증은 connection A와 B에서 각각 결정된다. Proxy가 평문으로 전달하면 보호 경계는 proxy에서 끝나고, TLS를 다시 사용하면 별도의 certificate 검증과 key가 필요하다.

### Termination 지점이 trust boundary를 바꾼다

client는 외부 service identity를 proxy certificate로 검증한다. proxy가 backend와 다시 TLS를 맺는다면 이번에는 proxy가 backend certificate와 identity를 별도로 검증해야 한다. 첫 번째 TLS가 성공했다는 사실이 두 번째 hop을 자동으로 보호하지 않는다.

proxy가 HTTP를 볼 수 있으므로 forwarding 과정에서 original scheme, host나 client 관련 metadata를 header로 전달하기도 한다. 이 정보는 TLS 자체가 end-to-end로 보존한 값이 아니라 **새 HTTP hop에서 intermediary가 다시 전달한 metadata**다. backend가 그 값을 신뢰하려면 요청이 실제로 신뢰한 proxy를 거쳐 왔다는 경계가 별도로 필요하다.

따라서 `HTTPS니까 browser에서 backend까지 모두 암호화된다`고 일반화하면 안 된다. TLS termination 구조에서는 **어디에서 복호화되는지, 이후 hop을 어떤 channel로 보호하는지, 각 hop에서 어떤 identity를 검증하는지**를 따로 확인해야 한다.

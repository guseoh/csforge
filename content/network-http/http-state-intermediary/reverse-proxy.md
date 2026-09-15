---
kind: concept
contentKey: network-http.core.http-state-intermediary.reverse-proxy
topicContentKey: network-http.core.http-state-intermediary
slug: reverse-proxy
title: "Reverse Proxy"
summary: "origin 앞에서 client 요청을 받아 backend로 전달하는 reverse proxy의 hop과 connection 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Reverse Proxy

reverse proxy는 origin server 앞에서 client request를 받고, 선택한 backend로 별도의 upstream request를 전달하는 server-side intermediary다. client는 proxy를 public endpoint로 보지만 backend는 proxy와의 connection을 보게 된다.

```text
client → reverse proxy → backend
```

하나의 reverse proxy가 여러 backend 중 route를 선택하거나 TLS termination, load balancing, cache 같은 기능을 추가할 수 있다. 하지만 reverse proxy라는 역할 자체는 이런 기능 모두를 필수로 포함한다는 뜻이 아니다.

client→proxy와 proxy→backend는 서로 다른 connection이므로 transport, TLS, timeout과 peer address도 각각 다를 수 있다. proxy가 client-facing TLS를 종료했다면 backend hop이 자동으로 TLS가 되는 것도 아니다. 또한 proxy가 request를 retry한다면 backend가 이미 처리한 요청과 중복될 가능성도 생긴다.

그래서 reverse proxy 뒤의 backend가 원래 client scheme, host나 address를 알아야 한다면 intermediary가 별도 metadata를 전달해야 한다. **Reverse proxy의 핵심은 client-facing connection을 종료하고 backend 쪽에 새로운 HTTP hop을 만든다는 것**이다.

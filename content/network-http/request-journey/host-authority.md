---
kind: concept
contentKey: network-http.core.request-journey.host-authority
topicContentKey: network-http.core.request-journey
slug: host-authority
title: "Host·Authority와 Virtual Hosting"
summary: "HTTP authority가 같은 IP·port에서 여러 logical host 중 request 대상을 선택하게 하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Host·Authority와 Virtual Hosting

하나의 IP address와 port에서 여러 hostname의 HTTP service를 함께 제공할 수 있다. network layer에서는 같은 destination endpoint로 연결되더라도 HTTP server는 request가 어느 logical host를 대상으로 하는지 알아야 한다. 이 역할을 HTTP/1.1의 `Host`와 HTTP/2·3의 `:authority`가 담당한다.

예를 들어 `api.example.com`과 `admin.example.com`이 같은 reverse proxy IP를 사용해도 authority가 다르면 proxy나 origin server는 서로 다른 virtual host 설정이나 route로 request를 전달할 수 있다. 따라서 TCP destination address만으로 HTTP resource의 logical destination을 완전히 결정할 수 없다.

### DNS name, TLS SNI, HTTP authority는 연결되지만 같은 정보는 아니다

DNS name은 address 후보를 찾는 데 사용되고, TLS SNI는 handshake 중 server가 적절한 TLS 설정과 certificate를 선택하는 데 사용할 수 있으며, HTTP authority는 HTTP request의 대상 authority를 표현한다. 일반적인 HTTPS 서비스에서는 같은 hostname이 세 단계에 걸쳐 사용되지만 각각 다른 protocol 계층의 정보다.

proxy가 다음 backend hop을 만들면 upstream connection의 network destination과 HTTP authority가 다시 달라질 수도 있다. 그래서 `어느 IP로 연결했는가`와 `HTTP request가 어느 authority를 대상으로 하는가`를 분리해야 virtual hosting과 proxy routing을 정확히 이해할 수 있다.

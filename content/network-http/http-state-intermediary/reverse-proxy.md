---
kind: concept
contentKey: network-http.core.http-state-intermediary.reverse-proxy
topicContentKey: network-http.core.http-state-intermediary
slug: reverse-proxy
title: "Reverse Proxy"
summary: "origin 앞에서 inbound request를 backend로 분배하는 reverse proxy를 설명한다."
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

reverse proxy는 public origin 앞에서 client connection을 받고, 별도의 upstream connection으로 backend origin에 request를 전달하는 서버 측 intermediary다. client가 보는 endpoint와 backend가 보는 peer·connection은 같지 않으며, 하나의 public host 뒤로 여러 backend를 routing할 수 있다. TLS termination, load balancing, compression, rate limiting, health routing과 cache를 둘 수 있지만 reverse proxy라는 이름만으로 모든 기능이 포함되는 것은 아니다.

client-to-proxy와 proxy-to-backend는 별도 connection이므로 각각의 timeout, connection pool, retry, header forwarding, TLS policy가 존재한다. proxy가 client 쪽 TLS를 종료해도 backend까지 암호화된다는 뜻은 아니며, upstream retry는 이미 backend가 처리한 POST 같은 side effect를 중복 실행할 수 있다. proxy가 추가한 host·scheme·client 정보도 trusted boundary가 확인한 경우에만 backend이 사용해야 한다.

reverse proxy는 origin 앞에서 routing하는 역할과 HTTP cache 역할을 구분한다. cache가 없는 reverse proxy도 있고, cache가 있는 경우에는 freshness·validator·personalization policy가 추가된다. proxy가 502·504로 upstream failure를 표현하는지, backend의 500을 그대로 전달하는지 status mapping과 관측 계약을 명시해야 장애 원인을 섞지 않는다.

### Backend 연결

Spring이 실제 client IP와 외부 HTTPS 여부를 알기 위해 trusted forwarded header의 source와 hop 범위를 제한한다. proxy가 반환한 502/504와 backend가 생성한 500을 서로 다른 알람으로 만들고, proxy retry·timeout이 application request의 중복 처리와 연결되지 않는지 확인한다.

---
kind: concept
contentKey: network-http.core.request-journey.proxy-gateway-path
topicContentKey: network-http.core.request-journey
slug: proxy-gateway-path
title: "Proxy and Gateway Path"
summary: "forward proxy·reverse proxy·gateway가 request path를 바꾸는 지점을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Proxy and Gateway Path

forward proxy는 client를 대신해 outbound request를 만들고, reverse proxy는 origin 앞에서 inbound request를 받아 backend로 전달한다. gateway는 protocol translation, authentication, routing, rate limit 같은 경계 policy를 함께 수행할 수 있다.

intermediary마다 connection, timeout, retry, header와 body buffering 정책이 달라 end-to-end contract를 바꿀 수 있다. proxy retry가 POST side effect를 중복하지 않는지와 original client identity를 어떻게 전달하는지 확인한다.

### Backend 연결

API gateway와 Spring app의 timeout·max body·status mapping을 정렬한다. proxy가 반환한 502/504와 backend가 반환한 500을 관측에서 구분한다.

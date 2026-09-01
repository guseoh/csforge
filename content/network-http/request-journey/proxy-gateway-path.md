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

forward proxy는 client가 요청한 outbound destination으로 가는 중간 endpoint이고, reverse proxy는 origin server 앞에서 inbound request를 받아 하나 이상의 backend로 전달하는 중간 endpoint다. gateway라는 말은 이 중계 경로에 protocol translation, authentication, routing, rate limit, aggregation 같은 경계 policy까지 함께 수행하는 역할을 포함해 사용할 수 있다. 이름보다 실제 connection과 trust boundary를 확인해야 한다.

intermediary마다 client-facing과 upstream-facing connection, timeout, retry, header rewrite, body buffering과 cache 정책이 다르다. 이 때문에 client가 본 504가 backend의 500인지 upstream connect timeout인지 달라지고, proxy retry가 POST side effect를 중복하거나 request body를 다시 읽지 못할 수 있다. original client identity도 forwarded metadata와 trusted proxy 범위를 통해 별도로 전달·검증한다.

API gateway와 Spring app의 timeout·max body·streaming·status mapping을 정렬하고, proxy가 반환한 502/504, gateway policy가 만든 4xx와 backend가 반환한 500을 관측에서 구분한다. gateway health가 origin application readiness나 DB transaction 상태를 자동으로 보장하지 않는다는 점도 유지한다.

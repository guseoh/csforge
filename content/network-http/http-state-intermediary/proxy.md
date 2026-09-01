---
kind: concept
contentKey: network-http.core.http-state-intermediary.proxy
topicContentKey: network-http.core.http-state-intermediary
slug: proxy
title: "Forward Proxy"
summary: "client 대신 outbound request를 전달하는 forward proxy를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Forward Proxy

forward proxy는 client가 직접 origin에 연결하는 대신 client가 선택한 proxy에 request를 보내고 proxy가 outbound 연결을 만드는 구조다. client 운영자나 조직의 network policy가 어떤 request를 proxy로 보낼지 결정하며, origin 운영자가 자신의 앞에 둔 reverse proxy와 방향과 관찰 지점이 다르다. proxy는 egress filtering, audit, address hiding, cache를 제공할 수 있지만 proxy 장애·정책·관찰 가능성이 새로운 trust와 failure boundary가 된다.

일반 HTTP request는 proxy가 target을 알고 upstream request를 만들 수 있고, HTTPS처럼 end-to-end TLS를 유지할 때는 `CONNECT` tunnel을 사용해 proxy가 바이트를 전달할 수 있다. proxy가 TLS를 종료·검사하는 구성이라면 client가 proxy의 인증서를 신뢰해야 하며 proxy가 plaintext를 볼 수 있는 별도 trust model이 생긴다. origin이 보는 socket peer는 보통 proxy이므로 original client 정보는 표준 또는 관행 forwarded header, 별도 proxy protocol 같은 명시적인 전달 계약이 있어야 한다.

proxy가 request를 재시도하거나 body를 buffer하면 streaming, timeout, side effect가 달라질 수 있다. DNS를 client가 수행하는지 proxy가 수행하는지, 인증 credential을 어떤 hop까지 전달하는지, direct bypass가 허용되는지를 함께 정해야 하며, forward proxy header를 origin identity의 증명으로 자동 신뢰해서는 안 된다.

### Backend 연결

개발환경의 `HTTP_PROXY`·`HTTPS_PROXY`와 bypass 목록은 외부 API와 private service의 실제 경로를 달리 만들 수 있다. proxy 사용 여부, CONNECT 여부, upstream timeout과 인증 범위를 startup configuration과 outbound metrics에서 관찰 가능하게 하며, proxy 로그에 bearer credential이나 cookie가 남지 않도록 redaction한다.

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

forward proxy는 client가 직접 origin에 연결하는 대신 proxy에 request를 보내 proxy가 outbound 연결을 만드는 구조다. filtering, corporate egress policy, cache, address hiding을 제공할 수 있지만 proxy가 새로운 trust와 failure boundary가 된다.

origin은 proxy를 직접 peer로 볼 수 있고 original client 정보는 표준·비표준 forwarded header나 proxy protocol로 전달될 수 있다. 인증·TLS CONNECT·header forwarding 규칙을 명시한다.

### Backend 연결

개발환경 HTTP_PROXY 설정이 외부 API request와 private service request를 다르게 만들 수 있다. proxy 사용 여부와 bypass 목록을 startup configuration에서 관찰 가능하게 한다.

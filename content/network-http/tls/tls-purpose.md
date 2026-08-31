---
kind: concept
contentKey: network-http.core.tls.tls-purpose
topicContentKey: network-http.core.tls
slug: tls-purpose
title: "TLS Purpose"
summary: "도청·변조·server impersonation을 줄이는 TLS 목표를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS와 HTTP message 전달 순서를 확인한다."
    displayOrder: 1
---
# TLS Purpose

TLS는 통신 channel에서 confidentiality와 integrity를 제공하고, certificate 검증을 통해 상대 endpoint identity를 인증하는 protocol이다. 암호화된 bytes가 도착해도 HTTP authorization이나 user identity가 자동으로 증명되는 것은 아니다.

handshake에서 identity와 key material을 합의한 뒤 application data는 symmetric session key로 보호한다. certificate 검증·hostname 확인을 끄면 암호화는 남아도 server impersonation 방어가 약해진다.

### Backend 연결

HTTPS의 TLS 성공과 HTTP 200은 별도 상태다. certificate expiry·hostname·trust chain·application authorization을 각각 모니터링한다.

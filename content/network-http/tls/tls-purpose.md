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

TLS는 두 TLS endpoint 사이의 channel에서 협상된 cryptographic mechanism으로 confidentiality와 integrity를 제공하고, certificate 또는 다른 인증 재료를 통해 상대 identity를 검증할 수 있게 하는 protocol이다. 여기서 인증은 “이 connection의 반대편이 제시한 key가 특정 service identity와 연결되는가”에 관한 것이지, 그 service에 로그인한 user나 HTTP authorization이 성공했다는 뜻은 아니다.

handshake는 protocol version·cipher capability·key material과 인증 상태를 정한 뒤 application data를 보호할 traffic secret을 만든다. 암호화된 bytes가 도착해도 endpoint 내부 memory·로그·trusted proxy에서 평문이 보이는 문제까지 해결하지는 않으며, certificate chain이나 hostname 확인을 끄면 encryption은 남아도 server impersonation 방어가 약해진다. TLS version과 cipher suite가 지원된다는 사실도 application protocol compatibility를 보장하지 않는다.

Backend monitoring에서는 TCP connect, TLS handshake, certificate expiry·hostname·trust chain과 HTTP authorization·response를 별도 상태로 기록한다. HTTPS의 TLS 성공은 HTTP 200이나 business transaction commit과 같은 의미가 아니다.

---
kind: concept
contentKey: network-http.core.tls.tls-termination
topicContentKey: network-http.core.tls
slug: tls-termination
title: "TLS Termination"
summary: "proxy에서 TLS를 종료할 때 client-backend trust boundary가 바뀌는 점을 설명한다."
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
# TLS Termination

TLS termination은 load balancer나 reverse proxy가 client와의 TLS handshake를 끝내고, 그 결과 얻은 HTTP를 내부 backend에 새 connection으로 전달하는 구조다. client-to-proxy channel이 암호화됐어도 proxy가 HTTP를 읽을 수 있고, proxy-to-backend hop의 confidentiality, server identity와 client identity 전달은 별도 계약이다. backend까지 TLS를 다시 맺으면 두 TLS connection의 인증과 certificate 검증은 독립적이다.

termination proxy가 original scheme, host, client identity를 forwarded header로 전달할 때 backend는 어느 proxy와 어느 network path를 신뢰할지 검증해야 한다. 신뢰되지 않은 client가 header를 직접 넣을 수 있으면 secure redirect, audit source와 authorization이 오염된다. 내부 network가 안전하다고 가정해 평문과 민감 data를 무제한 허용하지 말고, 필요하면 backend TLS나 mTLS로 다음 boundary를 보호한다.

Spring의 secure cookie, redirect URL, HSTS와 absolute URL 판단은 실제 external scheme과 trusted proxy header 설정에 의존할 수 있다. trusted proxy 목록, header overwrite 규칙, internal TLS policy와 certificate rotation을 함께 테스트하고, proxy에서 TLS가 종료된 connection과 backend connection을 metrics에서 구분한다.

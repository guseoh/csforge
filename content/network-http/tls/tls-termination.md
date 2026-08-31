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
    title: "The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS와 HTTP message 전달 순서를 확인한다."
    displayOrder: 1
---
# TLS Termination

TLS termination은 load balancer나 reverse proxy가 client와 TLS handshake를 끝내고 내부 backend에는 새 connection을 만드는 구조다. client-to-proxy channel이 암호화되어도 proxy-to-backend hop의 confidentiality와 identity를 별도로 결정해야 한다.

termination proxy가 original scheme, host, client identity를 forwarded header로 전달할 때 backend가 어느 proxy를 신뢰할지 검증한다. 내부 network가 안전하다고 가정해 평문과 민감 data를 무제한 허용하지 않는다.

### Backend 연결

Spring의 secure cookie, redirect URL, HSTS 판단은 실제 external scheme과 proxy header 설정에 의존한다. trusted proxy 목록과 internal TLS policy를 함께 테스트한다.

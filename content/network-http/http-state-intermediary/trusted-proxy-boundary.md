---
kind: concept
contentKey: network-http.core.http-state-intermediary.trusted-proxy-boundary
topicContentKey: network-http.core.http-state-intermediary
slug: trusted-proxy-boundary
title: "Trusted Proxy Boundary"
summary: "어느 proxy의 forwarded value를 신뢰할지 결정하는 경계를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7239"
    title: "Forwarded HTTP Extension"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "forwarded identity와 trusted intermediary 경계를 확인한다."
    displayOrder: 1
---
# Trusted Proxy Boundary

trusted proxy boundary는 backend가 forwarded scheme, host, client address를 어느 intermediary가 검증해 추가했다고 믿을지 정하는 설정이다. trust 범위가 없으면 client가 가짜 IP나 HTTPS scheme을 주입해 정책과 로그를 바꿀 수 있다.

경계는 network location, mTLS, proxy protocol, known hop count 같은 증거로 고정한다. proxy를 하나 더 추가하거나 direct backend access를 허용하면 기존 trust assumption을 다시 검토해야 한다.

### Backend 연결

CSRF origin, redirect, audit actor, rate limit이 forwarded 값에 의존하면 ingress topology를 configuration과 test fixture에 명시한다. 신뢰할 수 없는 값은 display hint로만 사용하고 authorization에는 쓰지 않는다.


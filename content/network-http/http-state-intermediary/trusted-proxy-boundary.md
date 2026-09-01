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

trusted proxy boundary는 backend가 forwarded scheme·host·client address를 어느 intermediary가 관찰·정규화해 추가했다고 믿을지 정하는 security policy다. backend가 외부 client에 직접 노출되거나 임의 source의 header를 읽으면 attacker가 가짜 IP, HTTPS scheme, host를 주입해 rate limit·audit·redirect·CSRF 판단을 바꿀 수 있다. forwarded field의 존재 자체는 이 boundary를 만들어 주지 않는다.

경계는 backend ingress를 trusted proxy network로 제한하고, 필요하면 mTLS·authenticated proxy protocol·known hop count·고정된 proxy address 같은 증거로 구성한다. trusted edge에서 client가 보낸 기존 forwarded field를 제거·재작성하고, backend는 실제 socket peer가 허용된 proxy인지 확인한 뒤 chain을 해석한다. 단순히 “첫 번째 IP를 사용”하거나 모든 source의 header를 신뢰하는 방식은 chain 주입에 취약하다.

proxy를 하나 더 추가하거나 CDN과 ingress 순서를 바꾸면 어느 hop의 값이 신뢰되는지와 목록 방향이 달라질 수 있다. topology별로 direct request, 단일 proxy, 여러 proxy, header injection, malformed IPv6/quoted value를 테스트하고, 신뢰하지 못한 값은 authorization 판단 대신 관찰용 hint로만 취급한다. trusted proxy가 전달한 값도 원래 사용자 credential을 대신하지 않으며, backend domain authorization은 별도로 수행해야 한다.

### Backend 연결

CSRF origin, redirect, audit actor, rate limit이 forwarded 값에 의존하면 ingress topology와 trusted proxy address/hop 설정을 configuration 및 test fixture에 명시한다. 신뢰할 수 없는 값은 display hint로만 사용하고 authorization이나 tenant identity에 쓰지 않으며, production에서 backend direct access가 가능한지 네트워크 레벨에서도 확인한다.


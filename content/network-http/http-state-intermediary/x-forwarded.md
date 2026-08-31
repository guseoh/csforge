---
kind: concept
contentKey: network-http.core.http-state-intermediary.x-forwarded
topicContentKey: network-http.core.http-state-intermediary
slug: x-forwarded
title: "X-Forwarded Headers"
summary: "비표준 관행 header의 체인과 spoofing 위험을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7239"
    title: "Forwarded HTTP Extension"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "forwarded identity와 trusted intermediary 경계를 확인한다."
    displayOrder: 1
---
# X-Forwarded Headers

X-Forwarded-For, X-Forwarded-Proto, X-Forwarded-Host는 표준화 이전부터 널리 쓰인 관행 header다. proxy chain에서 comma-separated client 목록과 append/overwrite 규칙이 구현마다 다를 수 있어 source와 신뢰 boundary가 중요하다.

외부 client가 X-Forwarded-For를 직접 넣고 ingress가 제거하지 않으면 rate limit, audit, allowlist가 조작될 수 있다. trusted proxy가 정규화한 가장 가까운 값과 실제 socket peer를 함께 보존한다.

### Backend 연결

client IP 기반 security와 observability에서 header chain을 파싱하는 라이브러리와 trusted hop 수를 고정한다. local direct access와 production ingress의 동작을 같은 값으로 가정하지 않는다.


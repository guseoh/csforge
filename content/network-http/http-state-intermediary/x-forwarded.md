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

`X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`는 표준 `Forwarded`가 정착하기 전부터 널리 사용된 관행 field다. 보통 X-Forwarded-For는 proxy chain의 address 목록, 나머지는 관찰된 scheme과 host를 전달하지만, append·overwrite·공백·목록 순서 규칙이 제품마다 다를 수 있다. 따라서 이름만 보고 표준 형식이나 신뢰성을 가정하지 않는다.

외부 client가 `X-Forwarded-For`를 직접 넣고 ingress가 제거하지 않으면 rate limit, audit, IP allowlist와 scheme 기반 redirect가 조작될 수 있다. 흔한 구성에서는 proxy가 client address를 목록에 추가하고 오른쪽에 가까운 값이 신뢰된 proxy의 관찰에 가깝지만, 이 convention도 실제 topology와 정규화 규칙을 확인해야 한다. backend는 실제 socket peer와 trusted hop 정보를 함께 사용해 신뢰 가능한 값을 선택한다.

X-Forwarded header는 upstream이 client identity를 이해하기 위한 전달 힌트이지, client가 누구인지 증명하는 credential이 아니다. 한 hop을 더 추가하거나 direct backend access를 열면 기존 “신뢰하는 오른쪽 hop 수”가 틀릴 수 있으므로, proxy chain 변경과 parser 설정 변경을 함께 검토한다.

### Backend 연결

client IP 기반 security와 observability에서는 검증된 parser, trusted proxy address/hop 수, direct access 차단을 함께 고정한다. local direct access는 실제 socket peer가 client일 수 있지만 production ingress에서는 마지막 trusted proxy가 peer일 수 있으므로 두 환경의 값을 같은 의미로 가정하지 않는다.


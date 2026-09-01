---
kind: concept
contentKey: network-http.core.http-state-intermediary.forwarded-header
topicContentKey: network-http.core.http-state-intermediary
slug: forwarded-header
title: "Forwarded Header"
summary: "intermediary가 원래 host·scheme·client 정보를 전달하는 표준 header를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7239"
    title: "Forwarded HTTP Extension"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "forwarded identity와 trusted intermediary 경계를 확인한다."
    displayOrder: 1
---
# Forwarded Header

`Forwarded`는 proxy가 request를 전달하면서 `for=`, `by=`, `host=`, `proto=` 같은 parameter로 관찰한 hop 정보를 전달하는 표준화된 HTTP field 형식이다. 여러 intermediary가 자신이 본 값을 추가할 수 있어 하나의 값이 “검증된 원래 client”를 자동으로 뜻하지 않는다. quoted value, IPv6 address와 obfuscated identifier parsing도 형식에 맞게 처리해야 한다.

외부 client가 먼저 보낸 `Forwarded`를 ingress가 그대로 넘기면 attacker가 scheme·host·client address를 위조할 수 있다. trusted edge는 inbound header를 제거하거나 정규화한 뒤 자신이 관찰한 값을 추가하고, backend는 허용된 intermediary에서 온 chain만 신뢰해야 한다. header의 정보는 external URL 생성, routing, logging에 사용할 수 있지만 cryptographic authentication proof나 원래 client의 서명된 신원으로 자동 승격하지 않는다.

`proto=https`는 보통 client와 trusted edge 사이에서 관찰한 scheme을 전달할 뿐 backend-to-upstream channel까지 HTTPS라는 보장은 아니다. `host`를 이용해 redirect나 absolute URL을 만들 때도 허용된 public host 목록과 함께 검증해야 하며, 여러 hop의 값을 어느 순서로 해석하는지는 topology와 trust policy에 포함한다.

### Backend 연결

Spring의 external URL 생성과 secure redirect는 trusted proxy가 정규화한 scheme·host만 사용하고, 허용 host 목록 밖의 값으로 redirect하지 않는다. ingress 앞에서 이미 존재하는 forwarded header를 덮어쓰는지, backend가 직접 노출될 때 header를 신뢰하지 않는지 integration test로 확인한다.


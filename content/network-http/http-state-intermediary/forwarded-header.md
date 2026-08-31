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

Forwarded header는 proxy chain이 원래 client, host, protocol 정보를 전달하는 표준 형식이다. 여러 intermediary가 값을 append할 수 있어 어느 hop이 추가했는지와 backend가 신뢰할 위치를 함께 정의한다.

client가 직접 보낸 Forwarded 값을 proxy가 제거·교체하지 않으면 spoofing이 가능하다. header의 정보는 routing·logging·redirect에 사용할 수 있지만 authentication proof로 자동 승격하지 않는다.

### Backend 연결

Spring의 external URL 생성과 secure redirect는 trusted proxy가 정규화한 scheme/host만 사용한다. ingress 앞에서 이미 존재하는 forwarded header를 덮어쓰는지 확인한다.


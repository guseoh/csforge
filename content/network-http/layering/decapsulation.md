---
kind: concept
contentKey: network-http.core.layering.decapsulation
topicContentKey: network-http.core.layering
slug: decapsulation
title: "Decapsulation"
summary: "수신 host가 각 계층 header를 제거하고 상위 payload를 전달하는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Internet protocol layering의 책임 경계를 확인한다."
    displayOrder: 1
---
# Decapsulation

수신 장비와 host는 link header를 검사하고 network header의 목적지와 transport header의 port를 해석한 뒤 payload를 상위 계층으로 전달한다. 각 단계에서 checksum, address, protocol number, state가 맞지 않으면 다음 계층까지 올라가지 않을 수 있다.

decapsulation은 bytes가 도착했다는 것과 application이 message를 완성했다는 것을 구분한다. TCP stream은 여러 packet으로 나뉘거나 합쳐질 수 있어 application framing이 끝나야 하나의 message가 된다.

### Backend 연결

HTTP parser는 socket read 한 번을 request 하나로 가정하지 않는다. partial read와 pipelined bytes를 buffer에 보존하고 protocol parser가 소비한 위치를 관리한다.


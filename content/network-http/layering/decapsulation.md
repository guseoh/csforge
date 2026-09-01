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

수신 interface는 먼저 link frame이 자신에게 전달된 것인지와 link-level 무결성·type을 확인하고, host의 network layer는 IP destination과 next-protocol 정보를 검사한다. 이어 transport layer가 TCP sequence/connection 또는 UDP port/datagram을 처리해 상위 payload를 전달한다. checksum, address, protocol state가 맞지 않거나 local policy가 거부하면 bytes가 다음 계층으로 올라가지 않고 그 지점에서 drop될 수 있다.

router가 packet을 forwarding하는 경우에는 최종 application까지 decapsulation하지 않고 IP header를 보고 다음 link를 위한 새 frame을 만든다. 반면 destination host에서는 transport가 packet 단위의 도착과 application message의 완성을 분리한다. TCP stream은 여러 packet이 합쳐지거나 나뉘어 전달되므로 sequence로 ordered bytes를 만든 뒤 HTTP Content-Length, transfer coding 또는 다른 framing 규칙이 message 끝을 결정한다.

HTTP parser는 socket read 한 번을 request 하나로 가정하지 않는다. partial read와 pipelined 또는 다음 message의 bytes를 buffer에 보존하고, protocol parser가 소비한 위치와 connection state를 관리한다. link/network 단계에서 drop된 frame은 application log에 남지 않을 수 있으므로 계층별 capture와 counter가 필요하다.


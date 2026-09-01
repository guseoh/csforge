---
kind: concept
contentKey: network-http.core.layering.mtu
topicContentKey: network-http.core.layering
slug: mtu
title: "MTU"
summary: "link가 한 번에 운반할 수 있는 최대 frame payload와 fragmentation 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1191"
    title: "Path MTU Discovery"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MTU와 packet fragmentation의 경계를 확인한다."
    displayOrder: 1
---
# MTU

MTU(Maximum Transmission Unit)는 하나의 link가 fragmentation 없이 운반할 수 있는 IP packet 크기의 상한이다. end-to-end 경로에는 link가 여러 개이므로 각 link의 MTU 중 가장 작은 값이 path MTU가 된다. 이는 application message나 TCP stream의 최대 크기가 아니다. TCP는 큰 byte stream을 여러 segment로 나눌 수 있고, UDP application은 datagram 크기가 path MTU를 넘지 않도록 별도 판단해야 한다.

packet이 다음 link MTU보다 크면 IPv4에서는 조건에 따라 fragmentation될 수 있고, DF가 설정되었거나 IPv6 경로인 경우에는 router가 조각내지 않고 drop과 ICMP 오류를 통해 송신자가 더 작은 packet을 선택하도록 할 수 있다. PMTUD가 이 ICMP feedback을 받지 못하면 큰 packet만 통과하지 않는 black hole과 timeout이 생길 수 있다. tunnel·VPN·container overlay는 추가 header 때문에 effective path MTU를 낮출 수 있다.

MTU가 작다고 모든 HTTP 요청이 실패하는 것은 아니다. 작은 packet은 지나가고 특정 payload 크기에서만 문제가 생길 수 있으며, fragmentation은 loss 한 번이 전체 logical transfer에 미치는 영향과 처리 비용을 바꾼다. 따라서 큰 upload/response가 특정 VPN 경로에서만 timeout되면 DF probe, PMTUD state, ICMP 차단, packet loss와 MSS/MTU 설정을 계층별로 확인한다. application chunk size나 retry 횟수를 먼저 키워 network black hole을 숨기지 않는다.


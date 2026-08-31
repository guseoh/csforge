---
kind: concept
contentKey: network-http.core.layering.mtu
topicContentKey: network-http.core.layering
slug: mtu
title: "MTU"
summary: "link가 한 번에 운반할 수 있는 최대 frame payload와 fragmentation 비용을 설명한다."
level: 1
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

MTU는 link나 path가 fragmentation 없이 운반할 수 있는 최대 IP packet 크기와 관련된 한계다. application message가 MTU보다 크다고 곧바로 오류가 나는 것은 아니며, transport가 여러 segment로 나누지만 IP fragmentation이나 PMTUD 실패는 별도 비용을 만든다.

너무 큰 packet은 경로 중 작은 MTU에서 drop되거나 fragment되어 loss 영향과 처리 비용이 커질 수 있다. tunnel, VPN, container network는 effective MTU를 더 낮출 수 있다.

### Backend 연결

큰 HTTP upload가 특정 환경에서만 timeout되면 path MTU와 ICMP 차단을 점검한다. application chunk size와 retry를 늘리기 전에 transport·network 증거를 확인한다.


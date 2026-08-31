---
kind: concept
contentKey: network-http.core.ip-routing.icmp
topicContentKey: network-http.core.ip-routing
slug: icmp
title: "ICMP"
summary: "IP control·error message가 reachability와 diagnostic을 지원하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc792"
    title: "Internet Control Message Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP control message와 reachability 진단을 확인한다."
    displayOrder: 1
---
# ICMP

ICMP는 IP 전달 실패, unreachable, time exceeded, echo 같은 control message를 전달한다. application payload의 reliable transport가 아니라 network layer의 상태와 오류를 알리는 보조 protocol이다.

ICMP가 차단되면 실제 forwarding이 항상 실패하는 것은 아니지만 PMTUD와 진단 정보가 사라질 수 있다. echo reply가 없다는 사실만으로 TCP port가 닫혔다고 결론 내리지 않는다.

### Backend 연결

connect timeout을 조사할 때 ICMP 오류, TCP SYN 응답, TLS와 HTTP 단계를 분리한다. 운영 firewall은 필요한 ICMP 종류와 rate limit을 검토한다.


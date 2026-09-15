---
kind: concept
contentKey: network-http.core.ip-routing.icmp
topicContentKey: network-http.core.ip-routing
slug: icmp
title: "ICMP"
summary: "IP delivery 오류와 진단 정보를 전달하는 ICMP의 역할을 설명한다."
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

ICMP(Internet Control Message Protocol)는 IP forwarding과 관련된 **error와 control information을 전달하는 network-layer protocol**이다. Destination unreachable, time exceeded, parameter problem 같은 message를 통해 sender가 packet delivery 문제를 알 수 있게 하고, Echo Request/Reply는 reachability 진단에 사용된다.

### ICMP는 transport protocol이 아니다

ICMP는 TCP처럼 ordered byte stream을 제공하지 않고 application data를 전달하는 일반 transport도 아니다. IP packet delivery 과정에서 발생한 상태와 오류를 알려 주는 보조 protocol이다.

예를 들어 TTL이 0이 된 router는 packet을 폐기하고 ICMP Time Exceeded를 보낼 수 있다. Route가 없거나 destination에 도달할 수 없는 경우에는 Destination Unreachable 계열 message가 사용될 수 있다.

### Ping 성공과 service 성공은 다르다

Echo Reply가 온다는 것은 network-layer reachability의 한 단서를 제공하지만 특정 TCP port가 열려 있거나 HTTP application이 정상이라는 뜻은 아니다. 반대로 ICMP Echo가 차단되어 ping이 실패해도 다른 traffic은 전달될 수 있다.

ICMP의 핵심은 **IP forwarding의 오류와 진단 정보를 sender에게 전달해 network-layer 상태를 설명하는 것**이다.

---
kind: concept
contentKey: network-http.core.port-nat.nat-vs-firewall
topicContentKey: network-http.core.port-nat
slug: nat-vs-firewall
title: "NAT versus Firewall"
summary: "address translation과 stateful packet filtering의 역할을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# NAT versus Firewall

NAT는 packet의 source/destination address나 port를 바꾸고 mapping state에 따라 reply를 반대 방향으로 변환하는 기능이다. firewall은 source·destination·port·protocol·connection state·identity 같은 조건과 정책을 평가해 traffic을 허용하거나 차단한다. 두 기능이 같은 gateway에 구현될 수 있지만, 주소를 바꿨다는 사실이 특정 traffic을 허용해야 한다는 규칙으로 바뀌지는 않는다.

NAT가 mapping 없는 inbound를 전달하지 않는 환경에서는 firewall처럼 보일 수 있지만, 그것은 implicit reachability 동작일 뿐 명시적인 보안 정책의 대체가 아니다. port forwarding을 추가하면 NAT 경로와 firewall allow rule을 모두 바꿔야 할 수 있고, 반대로 firewall이 허용해도 route·listener·NAT mapping이 없으면 application connection은 실패한다.

public listener를 열 때는 destination port allow rule, authentication, rate limit, logging과 admin/health endpoint의 노출 범위를 각각 설계한다. 특히 proxy나 NAT 뒤에서 관찰되는 source address는 identity와 다를 수 있으므로 access policy와 audit의 신뢰 경계를 명시한다.

Backend에서 “포트가 외부에 안 보인다”는 사실만으로 보안을 판단하지 않는다. 외부·내부 interface, security group/firewall state, port forwarding, application bind와 authorization을 순서대로 확인해야 하며, NAT table의 우연한 비노출을 least-privilege 정책으로 간주하지 않는다.


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

NAT는 packet address와 port를 변환하고 reply를 mapping에 맞춰 되돌리는 기능이다. firewall은 source, destination, port, protocol, connection state와 policy에 따라 허용·차단하는 기능이며 둘은 한 장비에 함께 있어도 개념이 다르다.

NAT가 inbound를 어렵게 만들 수 있지만 그것이 보안 정책의 충분한 대체는 아니다. public listener를 열 때 explicit allow rule, authentication, rate limit과 logging을 별도로 둔다.

### Backend 연결

“포트가 외부에 안 보인다”는 사실만으로 보안이 확보되지 않는다. application health endpoint와 admin endpoint의 ingress policy를 분리한다.


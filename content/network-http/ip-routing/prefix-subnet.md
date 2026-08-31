---
kind: concept
contentKey: network-http.core.ip-routing.prefix-subnet
topicContentKey: network-http.core.ip-routing
slug: prefix-subnet
title: "Prefix and Subnet"
summary: "network prefix 길이로 local subnet과 host 범위를 나누는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc791"
    title: "Internet Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP address와 packet forwarding의 기본을 확인한다."
    displayOrder: 1
---
# Prefix and Subnet

prefix length는 address의 network 부분이 몇 bit인지 나타내고 나머지가 subnet 안의 host 공간이 된다. 두 address의 prefix가 맞으면 local delivery 후보이고, 아니면 route와 gateway를 사용한다.

subnet mask, CIDR 표기, usable address 수를 혼동하지 않는다. network·broadcast·reserved address와 cloud/VPC의 특별한 예약 범위를 환경별로 확인한다.

### Backend 연결

보안 allowlist와 service bind 범위에 CIDR를 사용할 때 실제 client source가 NAT 뒤에서 어떻게 보이는지 확인한다. 너무 넓은 subnet을 신뢰 경계로 쓰지 않는다.


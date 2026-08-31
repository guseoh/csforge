---
kind: concept
contentKey: network-http.core.dns.ns-mx
topicContentKey: network-http.core.dns
slug: ns-mx
title: "NS and MX"
summary: "NS와 MX record가 name service delegation과 mail delivery를 구분하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1035"
    title: "Domain Names — Implementation and Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS delegation과 service record의 역할을 확인한다."
    displayOrder: 1
---
# NS and MX

NS record는 어떤 server가 zone을 authoritative하게 책임지는지 나타내고, MX record는 domain의 mail delivery target과 preference를 나타낸다. 둘 다 일반 web A/AAAA lookup과 다른 service contract를 가진다.

MX target은 보통 name이고 그 name을 다시 address로 조회한다. mail routing preference가 낮을수록 우선이라는 규칙과 target에 직접 IP를 넣지 않는 형식을 구분한다.

### Backend 연결

web endpoint와 mail endpoint를 같은 domain configuration으로 취급하지 않는다. notification 장애에서 SMTP DNS, connection, TLS, authentication을 HTTP health와 별도로 진단한다.


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

NS record는 특정 zone을 authoritative하게 서비스하는 name server를 가리키며, parent zone의 delegation과 child zone의 관리 경계를 연결한다. MX record는 domain으로 들어오는 mail을 받을 mail exchanger name과 preference를 표현한다. 따라서 NS/MX 조회는 web service의 A/AAAA 조회와 서로 다른 service contract다.

MX의 exchange 값은 IP literal이 아니라 domain name이며, mail sender는 그 name의 A/AAAA를 다시 조회해 SMTP connection destination을 얻는다. preference 값은 우선순위 숫자이고 일반적으로 더 낮은 값이 먼저 시도되며, 같은 preference의 여러 exchanger는 delivery policy에 따라 선택될 수 있다. MX가 가리키는 name이 다시 MX만 갖거나 address를 제공하지 않으면 mail delivery가 실패할 수 있다.

NS와 MX가 모두 존재한다는 사실은 해당 name server가 reachable하거나 SMTP server가 listening한다는 뜻이 아니다. delegation, address resolution, TCP connection, TLS와 SMTP authentication은 각각 다른 단계이며, DNS cache 때문에 record 변경도 즉시 모든 sender에 반영되지 않을 수 있다.

Backend web endpoint와 mail endpoint를 같은 domain configuration으로 취급하지 않는다. notification 장애에서는 MX와 mail host address, SMTP connection·TLS·authentication을 HTTP health와 별도로 진단하고, mail exchanger의 우선순위와 failover 결과를 기록한다.


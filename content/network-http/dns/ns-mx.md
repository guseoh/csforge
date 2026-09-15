---
kind: concept
contentKey: network-http.core.dns.ns-mx
topicContentKey: network-http.core.dns
slug: ns-mx
title: "NS·MX"
summary: "zone delegation과 mail delivery destination을 NS/MX로 구분한다."
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
# NS·MX

NS와 MX는 모두 DNS record지만 **가리키는 역할이 다르다.** NS record는 어떤 name server가 zone을 authoritative하게 담당하는지 나타내고, MX record는 특정 domain으로 들어오는 mail을 어느 mail exchanger가 받을지 나타낸다.

### NS record

Parent zone의 delegation에서 NS record는 child zone을 담당하는 authoritative server name을 가리킨다. Resolver는 이 정보를 이용해 다음 authoritative server로 이동할 수 있다.

```text
example.com. NS ns1.example.net.
```

### MX record

MX record는 mail exchanger의 domain name과 preference를 제공한다. 일반적으로 낮은 preference 값이 더 우선한다.

```text
example.com. MX 10 mail1.example.com.
example.com. MX 20 mail2.example.com.
```

Mail sender는 선택한 exchanger name의 A/AAAA record를 다시 해석해 실제 network address를 얻는다.

NS와 MX의 핵심은 **NS는 DNS zone의 authoritative delegation을, MX는 mail delivery destination을 표현하며 서로 다른 protocol 책임을 가진다는 것**이다.

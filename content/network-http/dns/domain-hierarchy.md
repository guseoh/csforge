---
kind: concept
contentKey: network-http.core.dns.domain-hierarchy
topicContentKey: network-http.core.dns
slug: domain-hierarchy
title: "Domain Hierarchy"
summary: "root·TLD·authoritative zone으로 domain name을 계층 해석하는 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Domain Hierarchy

DNS namespace는 점(`.`)으로 구분한 label을 계층적으로 배치한다. 완전한 domain name은 오른쪽에서 왼쪽으로 root, TLD, 그 아래 domain과 host label로 이어진다.

예를 들어 `www.example.com.`은 다음처럼 볼 수 있다.

```text
root
 └─ com
     └─ example
         └─ www
```

### 하나의 서버가 전체 namespace를 관리하지 않는다

DNS는 namespace를 zone 단위로 나누고 delegation으로 관리 책임을 분산한다. Parent zone은 child zone을 어느 name server가 책임지는지 알려 줄 수 있고, child zone의 authoritative server는 자기 zone의 record를 제공한다.

Domain과 zone은 항상 같은 범위가 아니다. 어떤 subdomain이 별도 zone으로 위임되면 parent domain tree 안에 있어도 authoritative 관리 경계는 나뉜다.

DNS hierarchy의 핵심은 **계층적인 이름 공간을 zone과 delegation으로 나누어 여러 authoritative server가 분산 관리한다는 것**이다.

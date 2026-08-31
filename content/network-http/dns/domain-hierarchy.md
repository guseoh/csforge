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
    title: "Domain Names — Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS name hierarchy와 resolution 역할을 확인한다."
    displayOrder: 1
---
# Domain Hierarchy

DNS name은 root에서 TLD, domain, subdomain으로 내려가는 계층적 label이다. zone을 관리하는 authoritative server는 자신이 책임지는 name에 대한 record를 제공하고, 전체 인터넷 이름을 한 서버가 보유하지 않는다.

label 비교는 대소문자와 trailing dot 처리 같은 protocol 규칙을 따르며, domain 소유권과 application tenant 권한은 다른 문제다. 이름이 해석되어도 해당 address와 port가 reachable하다는 뜻은 아니다.

### Backend 연결

service hostname을 content나 설정에 저장할 때 DNS name과 URL origin을 구분한다. 운영 환경의 split-horizon DNS가 개발 환경과 다른 address를 반환할 수 있음을 문서화한다.


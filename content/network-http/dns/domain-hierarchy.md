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

DNS name은 여러 label을 점으로 연결한 계층적 이름이며, 완전한 이름의 오른쪽 끝에는 root를 나타내는 빈 label이 있다. 예를 들어 `www.example.com.`은 root 아래의 `com`, 그 아래의 `example`, 그 아래의 `www`를 순서대로 가리킨다. 이 namespace는 하나의 서버가 전체를 보유하는 방식이 아니라, zone과 delegation 경계마다 관리 책임을 나눈다.

resolver는 name의 오른쪽 계층부터 delegation을 따라가며 어느 authoritative server에 다음 질문을 해야 하는지 알아낸다. 하나의 domain과 하나의 zone이 항상 같은 범위인 것은 아니다. zone cut 아래의 subdomain이 다른 zone으로 위임될 수 있고, parent zone의 NS delegation과 child zone의 authoritative record는 서로 다른 관리 경계를 가진다.

DNS label 비교는 protocol 규칙에 따라 대소문자를 구분하지 않지만, application의 URL 문자열·검색 suffix·trailing dot 처리와는 별도 문제다. domain 소유권이나 DNS 응답을 받았다는 사실도 application tenant 권한, 해당 address의 route, service port의 reachability를 대신 보장하지 않는다.

Backend 설정에서는 DNS name, URL origin의 scheme/authority, 실제 listener와 trust boundary를 구분한다. split-horizon DNS처럼 client network에 따라 같은 name이 다른 address를 반환할 수 있는 환경에서는 resolver 위치와 view를 함께 기록해야 한다.


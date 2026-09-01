---
kind: concept
contentKey: network-http.core.dns.authoritative-server
topicContentKey: network-http.core.dns
slug: authoritative-server
title: "Authoritative Server"
summary: "zone의 canonical DNS record를 책임지는 authoritative server를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "Domain Names — Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS name hierarchy와 resolution 역할을 확인한다."
    displayOrder: 1
---
# Authoritative Server

authoritative server는 자신이 서비스하는 zone의 source data에 근거해 해당 name과 record type에 대한 answer를 제공한다. recursive resolver가 다른 서버의 응답을 cache해 대신 반환하는 것과 달리, authoritative라는 표시는 그 server가 그 zone에 대한 관리 책임을 가진다는 의미다. 여러 authoritative instance가 있어도 같은 zone data를 제공하도록 운영할 수 있다.

parent zone의 NS delegation은 child zone을 어느 server가 책임지는지 가리키고, child authoritative server는 그 zone 안의 A/AAAA·CNAME·MX 같은 record를 답한다. 응답의 권위 여부와 DNSSEC 서명 검증은 서로 다른 개념이므로, authoritative server가 답했다는 사실만으로 client가 서명을 검증했다는 뜻은 아니다.

authoritative server가 정상이어도 client가 다른 recursive cache에서 이전 answer를 받거나, delegation·firewall·transport 문제로 authoritative까지 도달하지 못할 수 있다. 반대로 authoritative data가 잘못되어도 cache가 잠시 오래된 정상 answer를 반환할 수 있어 source와 cached view를 따로 비교해야 한다.

서비스 endpoint를 변경할 때는 authoritative record, TTL과 실제 backend rollout을 함께 계획한다. old address가 cache나 기존 connection에 남아 있는 overlap window 동안에도 이전 backend를 안전하게 유지하고, 새 answer가 실제 listener·route까지 이어지는지 확인한다.


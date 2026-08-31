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

authoritative server는 특정 zone의 record에 대해 canonical 답을 제공한다. recursive resolver가 여러 단계로 찾은 결과와 달리, authoritative 응답은 해당 zone 운영자가 선언한 source에 근거한다.

zone delegation의 NS record와 실제 address record, DNSSEC 같은 검증 경계를 구분한다. authoritative 서버가 정상이어도 recursive cache나 client network가 그 서버까지 도달하지 못할 수 있다.

### Backend 연결

서비스 endpoint 변경 시 DNS record의 TTL과 실제 backend rollout 시간을 함께 계획한다. old address가 cache에 남는 동안에도 구 endpoint를 안전하게 유지한다.


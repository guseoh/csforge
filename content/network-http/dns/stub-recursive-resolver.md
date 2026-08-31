---
kind: concept
contentKey: network-http.core.dns.stub-recursive-resolver
topicContentKey: network-http.core.dns
slug: stub-recursive-resolver
title: "Stub and Recursive Resolver"
summary: "client stub과 recursive resolver가 DNS 질의를 나누어 처리하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "Domain Names — Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS name hierarchy와 resolution 역할을 확인한다."
    displayOrder: 1
---
# Stub and Recursive Resolver

application의 stub resolver는 보통 로컬 설정이나 configured DNS resolver에 질문을 전달한다. recursive resolver는 cache에 답이 없으면 root·TLD·authoritative server를 따라가 필요한 결과를 대신 수집한다.

client와 recursive resolver, resolver와 authoritative server 사이의 timeout·retry·cache가 각각 다르다. “DNS 요청 한 번”이 network에서 한 packet 왕복 하나라는 뜻은 아니다.

### Backend 연결

Java DNS cache와 OS resolver cache, local Docker DNS의 TTL이 다를 수 있다. 장애 시 application process가 실제로 사용한 resolver와 answer를 함께 기록한다.


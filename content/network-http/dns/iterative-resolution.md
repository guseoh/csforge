---
kind: concept
contentKey: network-http.core.dns.iterative-resolution
topicContentKey: network-http.core.dns
slug: iterative-resolution
title: "Iterative Resolution"
summary: "resolver가 referral을 따라 다음 DNS server에 반복 질의하는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "Domain Names — Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS name hierarchy와 resolution 역할을 확인한다."
    displayOrder: 1
---
# Iterative Resolution

iterative resolution에서 server는 자신이 최종 답을 모르더라도 다음으로 질의할 server의 delegation 정보를 돌려줄 수 있다. recursive resolver가 root에서 TLD, authoritative 방향으로 이 referral을 따라가며 답을 조립한다.

각 단계의 NS와 glue record, timeout·retry가 다르면 resolution 전체가 느려지거나 실패한다. resolver가 client 대신 recursion을 수행하는 것과 client가 직접 iterative query를 하는 것을 구분한다.

### Backend 연결

DNS latency를 application request latency에 숨기려고 무한 connect retry를 하지 않는다. resolver health, cache hit, authoritative timeout을 별도 metric으로 남긴다.


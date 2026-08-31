---
kind: concept
contentKey: network-http.core.dns.negative-cache
topicContentKey: network-http.core.dns
slug: negative-cache
title: "DNS Negative Cache"
summary: "NXDOMAIN·no-data 결과를 cache하는 negative caching의 전파 지연을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc2308"
    title: "Negative Caching of DNS Queries"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS negative response와 cache 전파를 확인한다."
    displayOrder: 1
---
# DNS Negative Cache

존재하지 않는 name의 NXDOMAIN이나 record type이 없는 no-data 응답도 resolver가 일정 시간 cache할 수 있다. 잘못 만든 hostname을 나중에 추가해도 이전 실패가 남아 connection이 계속 실패할 수 있다.

negative TTL과 authoritative SOA, local resolver cache를 함께 확인한다. 임시 name을 삭제·재생성하는 운영 절차는 성공 record TTL뿐 아니라 실패 cache window도 고려한다.

### Backend 연결

새 review/search endpoint를 DNS로 노출할 때 rollout 전에 name을 검증한다. “record를 방금 추가했는데도 안 된다”는 현상에서 application cache와 DNS negative cache를 구분한다.


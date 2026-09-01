---
kind: concept
contentKey: network-http.core.dns.dns-failure
topicContentKey: network-http.core.dns
slug: dns-failure
title: "DNS Failure"
summary: "timeout·SERVFAIL·NXDOMAIN과 address 해석 실패의 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1035"
    title: "Domain Names — Implementation and Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS delegation과 service record의 역할을 확인한다."
    displayOrder: 1
---
# DNS Failure

DNS 실패는 response code와 관찰된 단계가 다르므로 하나의 “lookup failed”로 뭉개지 않는다. NXDOMAIN은 authoritative 관점에서 name이 존재하지 않는다는 부정 응답이고, NODATA는 name은 있지만 요청한 type의 RR이 없는 경우다. SERVFAIL은 resolver가 delegation, upstream 응답, DNSSEC 검증 등의 이유로 유효한 answer를 만들지 못했다는 넓은 실패이며, REFUSED는 정책상 query를 처리하지 않았다는 신호일 수 있다. timeout은 응답을 제때 받지 못한 것이므로 server의 명시적 판단과 다르다.

stub-to-resolver timeout, resolver-to-authoritative timeout, malformed response, 잘못된 delegation, no usable A/AAAA는 서로 다른 조사와 retry 가능성을 가진다. transient timeout이나 SERVFAIL에는 제한된 backoff가 의미 있을 수 있지만 NXDOMAIN을 무한 retry해도 name이 생기지는 않는다. resolver가 실패를 cache할 수도 있으므로 retry 횟수만 늘려 해결된다고 가정하지 않는다.

DNS가 성공해도 route·TCP connect·TLS·HTTP authentication이 실패할 수 있고, DNS가 일시적으로 실패해도 이미 열린 connection은 계속 동작할 수 있다. Backend는 hostname·query type·사용 resolver·response code·address family와 각 단계 elapsed time을 기록하고, 전체 request deadline 안에서 DNS retry budget을 분리한다.


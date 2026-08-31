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

NXDOMAIN은 name이 존재하지 않는다는 의미이고, SERVFAIL은 resolver가 답을 완성하지 못했다는 넓은 실패다. timeout·refused·malformed response·no usable A/AAAA도 서로 다른 원인과 retry 가능성을 가진다.

DNS가 성공해도 TCP connect, TLS, HTTP authentication이 실패할 수 있으며 반대도 가능하다. 재시도는 resolver와 application request의 비용을 합산하지 않도록 짧은 deadline과 backoff를 사용한다.

### Backend 연결

예외 메시지에 hostname, resolver, address family, 단계별 elapsed time을 남긴다. 무한 DNS 재시도는 thread pool과 downstream retry budget을 함께 고갈시킨다.


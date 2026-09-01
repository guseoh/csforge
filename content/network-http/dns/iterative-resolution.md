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

iterative query에서 server는 자신이 최종 record를 책임지지 않으면 다음 delegation의 NS 정보를 담은 referral을 반환할 수 있다. recursive resolver는 root에서 시작해 TLD server, delegated authoritative server로 질문을 옮기며, 각 응답에서 얻은 NS와 필요한 glue address를 사용해 다음 destination을 선택한다. 모든 단계가 매번 실행되는 것은 아니며 cache에 남은 delegation이나 answer가 있으면 일부를 건너뛸 수 있다.

authoritative server가 CNAME을 반환하면 resolver는 target name을 다시 해석해야 하고, referral에 포함된 glue가 부족하면 NS name의 address를 별도로 찾아야 할 수 있다. 각 query의 transport, timeout·retry, response size와 DNSSEC 검증이 다르므로 한 단계의 성공이 resolution 전체의 성공을 보장하지 않는다. resolver가 client 대신 이 과정을 수행하는 것과 client가 직접 iterative query를 보내는 것을 구분한다.

DNS latency를 application request latency에 숨기려고 무한 connect retry를 추가하지 않는다. Backend에서는 cache hit/miss, referral 단계, authoritative timeout과 최종 address family를 별도 metric으로 남겨 DNS 실패와 이후 connection 실패를 분리한다.


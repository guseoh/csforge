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
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Stub and Recursive Resolver

application이 직접 모든 DNS hierarchy를 순회하는 대신, stub resolver는 보통 `/etc/resolv.conf`나 OS 설정에 있는 configured recursive resolver로 query를 전달한다. stub은 질문을 구성하고 local name/source policy를 적용하는 쪽에 가깝고, recursive resolver는 recursion을 요청받아 cache를 확인한 뒤 필요하면 root·TLD·authoritative server에 대신 질의한다.

recursive resolver가 이미 fresh한 answer를 가지고 있으면 upstream query 없이 응답할 수 있다. cache miss나 만료가 발생하면 resolver가 여러 referral을 따라가며 수집한 결과를 stub에 돌려주므로, application이 본 하나의 DNS API 호출이 network에서 한 packet 왕복 하나라는 뜻은 아니다. resolver가 forwarder를 다시 사용하는 구성도 있어 실제 경로는 환경별로 다르다.

stub-to-resolver, resolver-to-upstream 각각의 timeout·retry·transport와 cache가 독립적으로 동작한다. 한 계층의 retry를 늘리면 전체 application deadline과 resolver 부하를 잠식할 수 있고, recursive resolver가 답을 반환했다는 사실도 뒤의 TCP connect나 HTTP health를 보장하지 않는다.

Java DNS cache, OS resolver cache, local Docker DNS와 조직 recursive resolver가 서로 다른 수명과 negative-cache policy를 가질 수 있다. Backend 장애에서는 process가 실제로 사용한 resolver, query name/type, answer와 각 단계의 elapsed time을 함께 기록한다.


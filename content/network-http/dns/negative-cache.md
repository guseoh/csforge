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

DNS resolver는 positive answer뿐 아니라 부정 결과도 일정 시간 cache할 수 있다. NXDOMAIN은 해당 name이 존재하지 않는다는 응답이고, NODATA는 name은 존재하지만 요청한 RRtype이 없다는 응답이므로 두 결과의 의미를 구분해야 한다. 이후에 A/AAAA나 zone record를 추가해도 resolver가 보관한 부정 결과가 만료되기 전에는 application이 계속 실패할 수 있다.

negative caching의 수명은 권위 응답의 SOA 관련 정보와 resolver policy에 따라 결정되며, stub·OS·JVM cache가 별도의 관찰 지연을 더할 수 있다. 부정 결과가 있다고 authoritative zone에 실제 record가 없다고 즉시 결론내리지 말고, query name/type, response code, authority section과 각 cache expiry를 비교한다.

임시 name을 삭제·재생성하거나 새 review/search endpoint를 DNS로 노출할 때는 성공 record TTL뿐 아니라 negative cache window도 rollout 계획에 넣는다. 운영에서 “record를 방금 추가했는데도 안 된다”는 현상은 application cache, resolver negative cache, 잘못된 zone delegation을 각각 분리해 진단한다.


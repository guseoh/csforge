---
kind: concept
contentKey: network-http.core.dns.dns-ttl-cache
topicContentKey: network-http.core.dns
slug: dns-ttl-cache
title: "DNS TTL과 캐시"
summary: "TTL이 재귀 리졸버의 캐시 재사용 시간과 DNS 변경 전파 지연을 어떻게 바꾸는지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1035"
    title: "Domain Names — Implementation and Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS delegation과 service record의 역할을 확인한다."
    displayOrder: 1
---
# DNS TTL과 캐시

DNS 레코드의 TTL(Time To Live)은 캐싱 리졸버가 받은 레코드를 재사용할 수 있는 시간의 상한을 나타냅니다. 유효한 캐시가 있다면 매번 권한 서버를 질의하지 않아도 되므로 조회 지연과 권한 서버 부하가 줄어듭니다.

![DNS TTL과 권한 레코드 변경: t=0에 TTL 60초로 저장하고 t=10에 권한 값이 바뀌어도 기존 캐시는 만료까지 재사용할 수 있다. t=60 이후 질의 시 새 값으로 갱신되는 예시.](/learning/network-http/dns-ttl-cache.svg)

위 예시는 t=0에 TTL 60초로 캐시하고 t=10에 권한 서버 값을 바꾼 상황입니다. 기존 응답을 보관한 리졸버는 남은 TTL 동안 이전 값을 반환할 수 있습니다. t=60 이후 새 질의가 발생하면 변경된 데이터를 얻을 수 있습니다. 조기 캐시 제거와 RFC 8767의 제한적 serve-stale 정책은 이 예에서 제외합니다.

### TTL과 변경 계획

TTL이 길면 재조회 부하는 줄지만 변경된 주소가 사용자에게 전달되는 시점이 늦어질 수 있습니다. 반대로 짧으면 더 자주 갱신할 기회가 생기지만 DNS 질의량이 늘어날 수 있습니다.

TTL을 24시간에서 5분으로 낮춰도 이전에 24시간으로 받아 둔 캐시의 남은 시간이 소급하여 줄어들지는 않습니다. 그래서 계획된 IP 전환 전에 TTL을 미리 낮추고 기존의 긴 TTL이 만료될 시간을 확보합니다.

### 이미 열린 연결은 별도 상태입니다

DNS 결과가 새 주소로 바뀌더라도 이미 열린 TCP·QUIC 연결이 자동으로 새 서버 주소로 이동하는 것은 아닙니다. JVM 등의 런타임이 별도 DNS 캐시를 보유할 수도 있습니다.

백엔드 전환 과정에서는 권한 DNS, 재귀 캐시, 런타임 캐시, 커넥션 풀을 차례로 구분해야 합니다. TTL은 DNS 레코드의 재사용 정책이지 연결 수명 전체를 제어하는 설정이 아닙니다.

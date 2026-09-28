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
    recommendation: "DNS 레코드 TTL의 의미와 캐시에서 남은 TTL을 감소시키는 기본 규칙을 확인한다."
    displayOrder: 1
---
# DNS TTL과 캐시

DNS 레코드의 TTL(Time To Live)은 **캐싱 리졸버가 받은 레코드를 얼마 동안 다시 사용할 수 있는지** 나타낸다. TTL이 남아 있으면 같은 이름을 조회할 때 권한 서버까지 다시 가지 않고 저장된 응답을 돌려줄 수 있어 조회 지연과 권한 서버 부하를 줄인다.

| 시점 | 권한 DNS의 현재 값 | 재귀 리졸버의 상태 | 사용자가 볼 수 있는 값 |
| --- | --- | --- | --- |
| t=0 | `api.example.net → 203.0.113.10`, TTL 60초 | 응답을 60초 동안 저장 | `203.0.113.10` |
| t=10초 | 주소를 `203.0.113.20`으로 변경 | 이전 응답 TTL이 약 50초 남음 | 만료 전에는 이전 주소 가능 |
| t=60초 이후 | 새 주소 유지 | 이전 항목 만료 후 재조회 | 새 주소를 받을 수 있음 |

### TTL이 길수록 재조회는 줄지만 변경 반영은 느려질 수 있다

TTL이 길면 반복 DNS 조회를 캐시에서 처리하기 쉬워진다. 대신 권한 레코드를 변경해도 기존 캐시가 오래 남을 수 있다. TTL을 짧게 하면 새 값을 다시 조회할 기회가 빨리 오지만 권한 서버로 향하는 질의는 늘어난다.

즉 TTL은 단순히 `짧을수록 최신` 또는 `길수록 빠름`으로 정할 값이 아니라 **조회 부하와 변경 전파 지연 사이의 절충점**이다.

### 지금 TTL을 낮춰도 이미 받은 응답의 남은 수명은 소급해서 바뀌지 않는다

재귀 리졸버는 레코드를 받았을 당시의 TTL을 기준으로 남은 시간을 줄여 간다. 권한 서버에서 TTL을 24시간에서 5분으로 바꿔도, 변경 전에 24시간 TTL로 응답을 받은 캐시가 즉시 5분으로 줄어드는 것은 아니다.

계획된 IP 전환 전에 TTL을 미리 낮추는 이유가 여기에 있다. 기존의 긴 TTL이 충분히 만료된 뒤 주소를 바꿔야 이전 주소를 보는 사용자를 줄일 수 있다.

### DNS 캐시와 이미 열린 연결은 별도 상태다

DNS TTL이 만료되어 다음 조회에서 새 IP를 받더라도 이미 열려 있는 TCP·QUIC 연결이 자동으로 새 주소로 이동하지는 않는다. 애플리케이션이나 JVM이 DNS 결과를 별도로 캐시하는 경우도 있으므로 `권한 DNS → 재귀 리졸버 → OS/런타임 → 기존 연결`을 단계별로 봐야 한다.

DNS TTL의 핵심은 **DNS 레코드 재사용 시간을 제한해 조회 부하와 변경 전파 속도를 조절하지만, 다른 계층의 캐시와 기존 연결까지 자동으로 갱신하지는 않는다는 점**이다.

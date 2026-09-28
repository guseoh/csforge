---
kind: concept
contentKey: network-http.core.dns.cname
topicContentKey: network-http.core.dns
slug: cname
title: "CNAME 레코드"
summary: "한 DNS 이름을 다른 정식 이름의 별칭으로 연결하고, 최종 주소를 얻기 위해 추가 조회가 이어질 수 있는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# CNAME 레코드

CNAME 레코드는 하나의 DNS 이름을 **다른 정식 이름(canonical name)의 별칭(alias)**으로 연결한다. CNAME 자체가 IPv4·IPv6 주소를 담는 것이 아니라, 리졸버가 가리키는 이름을 다시 해석해 최종 A·AAAA 레코드 등을 찾게 만든다.

```text
service.example. CNAME edge.example.
edge.example.    A     192.0.2.20
```

이 경우 `service.example`을 조회하면 먼저 `edge.example`이라는 정식 이름을 알게 되고, 실제 IPv4 주소는 `edge.example`의 A 레코드를 조회해 얻는다.

### CNAME 연결은 추가 DNS 조회를 만들 수 있다

CNAME이 다시 다른 CNAME을 가리키면 별칭 연결이 여러 단계로 이어질 수 있다. 필요한 응답이 한 DNS 메시지에 함께 들어오는 경우도 있지만, 캐시 상태와 응답 구성에 따라 리졸버가 추가 조회를 수행할 수 있다.

연결이 지나치게 길면 조회 지연과 실패 지점이 늘어나고, 순환 참조가 생기면 정상적으로 최종 이름을 찾을 수 없다. 따라서 별칭 구조도 불필요하게 복잡하게 만들지 않는 편이 좋다.

### CNAME을 둔 이름에는 일반 DNS 데이터를 함께 두기 어렵다

CNAME은 `이 이름은 다른 이름의 별칭이다`라는 의미를 가진다. 그래서 CNAME이 존재하는 이름에는 일반적으로 다른 종류의 DNS 데이터를 함께 둘 수 없다. zone 최상위 이름(apex)은 SOA·NS 레코드가 필요하므로 전통적인 CNAME을 그대로 둘 수 없는 이유도 여기에 있다.

CNAME의 핵심은 **주소를 직접 저장하는 레코드가 아니라 DNS 이름을 다른 DNS 이름으로 연결하는 별칭 레코드이며, 최종 주소는 대상 이름을 추가로 해석해 얻는다는 점**이다.

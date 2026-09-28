---
kind: concept
contentKey: network-http.core.dns.a-aaaa
topicContentKey: network-http.core.dns
slug: a-aaaa
title: "A·AAAA 레코드"
summary: "A 레코드의 IPv4 주소와 AAAA 레코드의 IPv6 주소 의미를 구분하고, DNS 응답과 실제 연결 선택이 다른 단계임을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3596"
    title: "DNS Extensions to Support IP Version 6"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "AAAA 레코드가 IPv6 주소를 표현하는 방식과 IPv4 A 레코드와의 차이를 확인한다."
    displayOrder: 1
---
# A·AAAA 레코드

DNS에서 **A 레코드는 이름을 IPv4 주소에 연결하고, AAAA 레코드는 이름을 IPv6 주소에 연결한다.** 하나의 이름에 여러 A·AAAA 레코드가 함께 존재할 수 있으므로 DNS 조회 결과가 항상 주소 하나인 것은 아니다.

```text
example.com.  A     192.0.2.10
example.com.  AAAA  2001:db8::10
```

### DNS가 주소를 알려 주는 것과 실제 연결 대상 선택은 다르다

리졸버는 이름에 연결된 주소 후보를 반환한다. 그다음 클라이언트 운영체제나 네트워크 라이브러리가 주소 패밀리, 도달 가능성, 연결 정책 등을 고려해 실제로 어느 주소에 먼저 연결할지 정할 수 있다.

따라서 DNS 응답에 AAAA 레코드가 있다고 해서 IPv6 연결이 반드시 먼저 성공하는 것은 아니다. A와 AAAA가 모두 존재하면 IPv4와 IPv6가 각각 연결 후보가 될 수 있다.

### 주소 레코드는 서비스 도달 가능성을 보장하지 않는다

A·AAAA 레코드가 존재한다는 것은 **DNS가 해당 주소를 게시하고 있다**는 뜻이다. 그 주소까지 라우팅 경로가 열려 있는지, 방화벽이 허용하는지, TCP·UDP 포트에 서버가 대기 중인지까지 보장하지 않는다.

즉 DNS 조회 성공 뒤에도 `주소 선택 → 라우팅 → 전송 연결 → TLS/HTTP` 단계는 별도로 실패할 수 있다.

A·AAAA 레코드의 핵심은 **도메인 이름을 각각 IPv4 또는 IPv6 네트워크 주소에 연결하는 DNS 레코드이며, 실제 연결 성공은 그 다음 계층의 책임**이라는 점이다.

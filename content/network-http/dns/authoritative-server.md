---
kind: concept
contentKey: network-http.core.dns.authoritative-server
topicContentKey: network-http.core.dns
slug: authoritative-server
title: "권한 있는 DNS 서버"
summary: "자신이 담당하는 DNS 영역의 데이터에 대해 권한 있는 응답을 제공하는 서버와 재귀 캐시의 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 권한 있는 DNS 서버

권한 있는 DNS 서버(authoritative server)는 자신이 담당하는 DNS 영역(zone)에 대해 권한 있는 데이터를 제공합니다. 재귀 리졸버가 다른 서버로부터 얻은 답을 캐시하여 반환하는 것과 책임이 다릅니다.

### 위임을 따라 권한 서버를 찾습니다

상위 zone은 NS 레코드로 하위 zone의 권한 서버를 안내합니다. 재귀 리졸버는 이 위임을 따라 필요한 레코드를 조회합니다.

```text
상위 zone
   ↓ NS 위임
하위 zone의 권한 서버
   ↓
해당 zone의 DNS 레코드
```

권한 서버는 반드시 한 대의 원본 서버를 의미하지 않습니다. 한 zone은 여러 권한 서버에서 제공할 수 있으며 각 서버의 데이터 반영 시점이 일시적으로 다를 수도 있습니다. 모든 권한 서버의 응답이 정상인지 별도로 확인해야 합니다.

### 권한 데이터와 캐시의 관측 시점

레코드를 수정해도 재귀 리졸버에 이전 응답의 TTL이 남아 있다면 사용자는 이전 주소를 받을 수 있습니다. 따라서 설정 변경 뒤 장애를 조사할 때는 권한 서버별 현재 응답과 사용자가 이용하는 재귀 리졸버의 응답을 비교합니다.

DNS 권한 데이터가 올바르더라도 실제 IP 경로, 전송 연결, TLS, HTTP 애플리케이션 상태까지 보장하지는 않습니다. 각 계층의 성공 여부를 독립적으로 확인하는 것이 중요합니다.

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

**권한 있는 DNS 서버(authoritative server)**는 자신이 담당하는 DNS 영역의 데이터에 근거해 권한 있는 응답을 제공한다. 재귀 리졸버가 과거에 받은 응답을 캐시에 저장해 대신 돌려주는 것과 달리, 권한 서버의 응답은 그 DNS 영역에 대해 권한을 가진 데이터에서 나온다.

### 위임을 따라 권한 서버를 찾는다

상위 DNS 영역은 NS 레코드로 하위 DNS 영역을 어느 네임 서버가 담당하는지 위임할 수 있다. 재귀 리졸버는 이 정보를 따라 하위 영역의 권한 서버를 찾아가고, 필요한 A·AAAA·CNAME·MX 같은 레코드를 조회한다.

```text
상위 zone
   ↓ NS 위임
하위 zone의 권한 서버
   ↓
해당 zone의 DNS 레코드
```

여기서 `권한 서버`는 반드시 한 대의 원본 서버만을 뜻하지 않는다. 한 zone에 여러 권한 서버를 둘 수 있고, 중요한 점은 **그 서버가 해당 zone에 대해 권한 있는 응답을 제공할 수 있다는 것**이다.

### 권한 응답과 캐시 응답은 관측 시점이 다를 수 있다

재귀 리졸버에 이전 레코드가 TTL 동안 남아 있으면 클라이언트 요청이 권한 서버까지 가지 않고 캐시에서 끝날 수 있다. 따라서 권한 DNS 영역의 레코드를 수정한 직후에도 일부 사용자는 캐시가 만료될 때까지 예전 값을 볼 수 있다.

장애를 조사할 때는 `권한 서버의 현재 값`과 `사용자가 이용하는 재귀 리졸버의 캐시 값`을 따로 확인해야 한다.

### DNS 데이터가 맞아도 서비스는 실패할 수 있다

권한 서버가 올바른 IP 주소를 응답했다는 사실은 DNS 단계가 정상이라는 뜻이다. 그 주소까지의 라우팅, 방화벽, TCP 리스너, TLS 인증서, HTTP 애플리케이션 상태까지 보장하지는 않는다.

핵심은 **권한 DNS 서버가 자신이 담당하는 DNS 영역의 데이터에 대해 권한 있는 응답을 제공하며, 재귀 캐시와 실제 서비스 상태는 별도의 계층이라는 점**이다.

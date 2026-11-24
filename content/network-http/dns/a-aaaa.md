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

DNS는 도메인 이름으로 접속하려는 클라이언트에게 주소 후보를 제공합니다. **A 레코드는 32비트 IPv4 주소를, AAAA 레코드는 128비트 IPv6 주소를 담습니다.** 같은 이름에 여러 주소가 등록될 수도 있습니다.

```text
example.com.  A     192.0.2.10
example.com.  AAAA  2001:db8::10
```

### 주소 조회와 연결은 별개입니다

리졸버가 위 두 레코드를 반환하면 운영체제와 네트워크 라이브러리는 주소 선택 정책과 연결 결과를 고려하여 접속을 시도합니다. IPv6 경로가 불안정한 환경에서는 IPv4 연결이 먼저 성공할 수도 있습니다. RFC 8305의 Happy Eyeballs는 이런 이중 스택 환경의 연결 지연을 줄이는 접근법입니다.

주소 레코드는 해당 주소에서 서비스가 정상 동작한다는 보증이 아닙니다. DNS가 정상이어도 라우팅, 방화벽, 포트 리스너, TLS 인증 또는 HTTP 처리에서 실패할 수 있습니다.

백엔드에서 접속 시간 초과를 조사한다면 우선 반환된 주소 후보를 확인하고 실제 어느 주소로 연결을 시도했는지 구분해야 합니다. A·AAAA는 연결에 필요한 주소 정보이지 서비스 상태 확인 결과가 아닙니다.

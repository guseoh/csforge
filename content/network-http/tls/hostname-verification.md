---
kind: concept
contentKey: network-http.core.tls.hostname-verification
topicContentKey: network-http.core.tls
slug: hostname-verification
title: "Hostname Verification"
summary: "client의 reference identity와 certificate의 service identity를 비교해 올바른 TLS 상대인지 검증하는 절차를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9525.html"
    title: "RFC 9525 — Service Identity in TLS"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "reference identity와 certificate의 subjectAltName에 제시된 service identity를 비교하는 현행 검증 규칙을 확인한다."
    displayOrder: 1
---
# Hostname Verification

### 신뢰할 수 있는 인증서와 내가 접속하려던 서버인지는 다른 질문이다

TLS client는 certificate chain이 신뢰할 수 있는 CA로 이어지는지만 확인해서는 안 된다. 그 certificate가 **client가 실제로 접속하려던 application service의 identity를 나타내는지**도 확인해야 한다. RFC 9525는 client가 연결 전에 알고 있던 이름을 `reference identity`, server certificate가 제시한 이름을 `presented identity`로 구분하고 두 identity가 규칙에 맞게 일치하는지 검증하도록 정의한다.

예를 들어 client가 `https://api.example.com`에 접속했다면 `api.example.com`이 reference identity가 된다. 공격자가 신뢰받는 CA가 발급한 `other.example.net`의 정상 certificate를 가지고 있더라도 그 certificate는 `api.example.com`의 identity를 증명하지 못한다. **CA signature 검증과 service identity 검증은 둘 다 성공해야** client가 의도한 상대와 TLS channel을 맺었다고 판단할 수 있다.

### 이름은 certificate의 subjectAltName에서 확인한다

현행 RFC 9525에서는 DNS service identity를 certificate의 `subjectAltName`에 있는 DNS-ID와 비교한다. 과거 관행처럼 certificate의 Common Name(CN)을 hostname 검증의 대체 수단으로 사용하는 방식은 현재 규칙에 포함되지 않는다. IP literal로 접속하는 경우에는 DNS name을 억지로 비교하는 것이 아니라 IP-ID 규칙에 따라 해당 IP address identity가 certificate에 제시되었는지 확인해야 한다.

Wildcard도 임의의 문자열 패턴이 아니다. DNS-ID에서 wildcard가 허용되는 위치와 matching 규칙이 제한되어 있으므로 `*.example.com`을 `a.b.example.com` 같은 모든 하위 이름에 일반적으로 대응한다고 생각하면 안 된다. Internationalized domain name 역시 비교 전에 정해진 표현과 처리 규칙을 따라야 한다.

### SNI와 HTTP Host는 hostname verification 자체가 아니다

TLS의 SNI(Server Name Indication)는 client가 handshake 중 어떤 server name에 접속하려는지 알려 주어 server나 proxy가 적절한 certificate를 선택하는 데 사용할 수 있다. HTTP의 `Host` 또는 HTTP/2·3의 `:authority`는 HTTP request가 어느 authority를 대상으로 하는지 표현한다. 둘 다 deployment에서 같은 서비스 이름과 연결되는 경우가 많지만 **SNI를 보냈다거나 HTTP Host가 일치한다는 사실 자체가 certificate identity 검증을 대신하지는 않는다.**

Reverse proxy에서 TLS를 종료하고 backend와 다시 TLS를 맺는 구조라면 두 구간은 별도의 TLS connection이다. Client→proxy에서는 client가 외부 service identity를 검증하고, proxy→backend에서는 proxy가 backend에 대해 어떤 reference identity를 사용할지 별도로 정해야 한다. 내부 IP로 연결한다는 이유로 hostname verification을 끄면 이 두 번째 trust boundary가 사라질 수 있다.

### 검증을 끄는 것은 암호화만 남기고 상대 확인을 포기하는 것이다

Hostname/service identity 검증을 비활성화하면 traffic 자체는 암호화될 수 있어도 client가 누구와 암호화 channel을 만들었는지 확인하지 못한다. 공격자가 client와 별도 TLS session을 맺을 수 있는 위치에 있고 client가 그 certificate의 service identity를 확인하지 않는다면, 단순히 "certificate가 어떤 신뢰된 CA에서 발급되었다"는 사실만으로는 의도한 server를 인증할 수 없다.

따라서 테스트 환경에서도 전역적인 trust-all 또는 hostname-verification disable을 기본 해결책으로 두지 않는다. 필요한 test CA와 SAN을 구성하고, 불가피한 우회가 있다면 production configuration에서 활성화되지 않도록 명시적인 guard를 둔다.

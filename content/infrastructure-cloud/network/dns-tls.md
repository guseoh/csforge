---
kind: concept
contentKey: infrastructure.core.network.dns-tls
topicContentKey: infrastructure.core.network
slug: dns-tls
title: "DNS 변경과 TLS 인증서 수명주기"
summary: "DNS 레코드 변경이 캐시 TTL을 거쳐 전파되고 TLS 인증서가 발급·배포·교체·만료되는 운영 흐름을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1035"
    title: "Domain Names — Implementation and Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS delegation과 service record의 역할을 확인한다."
    displayOrder: 1
    relationNote: "DNS resolver가 자원 레코드와 TTL을 해석하는 기반 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc2308"
    title: "Negative Caching of DNS Queries"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NXDOMAIN/NODATA negative answer와 SOA 기반 negative TTL을 확인한다."
    displayOrder: 2
    relationNote: "NXDOMAIN·NODATA가 캐시되어 엔드포인트 전환 뒤에도 실패가 남는 경계 확인"
  - url: "https://www.rfc-editor.org/info/rfc9846/"
    title: "RFC 9846: The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현재 TLS 1.3 handshake와 인증된 보안 channel의 protocol contract를 확인한다."
    displayOrder: 3
    relationNote: "TLS 핸드셰이크가 인증된 보호 채널을 설정하는 현재 표준 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc9525.html"
    title: "RFC 9525 — Service Identity in TLS"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "reference identity와 certificate의 subjectAltName에 제시된 service identity를 비교하는 현행 검증 규칙을 확인한다."
    displayOrder: 4
    relationNote: "접속 호스트 이름을 SAN의 DNS-ID와 대조해 엔드포인트 식별자를 검증하는 절차 확인"
---
# DNS 변경과 TLS 인증서 수명주기

인프라에서 도메인과 HTTPS를 운영할 때 중요한 문제는 프로토콜 세부를 다시 구현하는 것이 아니라 **주소와 인증서가 바뀌는 전환 구간을 안전하게 관리하는 것**입니다.

DNS 레코드를 새 부하 분산 장치 주소로 바꿔도 모든 클라이언트가 즉시 새 주소를 사용하는 것은 아닙니다. Resolver와 클라이언트는 TTL이 끝날 때까지 이전의 정상 응답을 캐시할 수 있고, 실패 응답도 부정 캐시 TTL 동안 남을 수 있습니다. 이미 캐시된 값의 남은 TTL은 authoritative record의 TTL을 뒤늦게 낮춰도 짧아지지 않습니다.

```text
이전 엔드포인트 ← 일부 resolver 캐시
        │
DNS 레코드 변경
        │
        └────────▶ 새 엔드포인트 ← 점진적으로 전환
```

따라서 엔드포인트 전환 중에는 일정 시간 이전·새 경로가 함께 사용될 수 있음을 고려해야 합니다. 기존 엔드포인트를 너무 빨리 제거하면 아직 이전 DNS 값을 가진 클라이언트만 실패할 수 있습니다.

### 인증서도 한 번 설치하고 끝나는 설정이 아니다

HTTPS 엔드포인트의 인증서에는 유효 기간이 있고 신뢰 체인이 유효해야 합니다. TLS 클라이언트는 인증서의 subjectAltName에 있는 DNS 식별자가 접속 호스트 이름과 일치하는지도 확인해야 하며 IP 주소로 접속한다면 IP 식별자를 비교합니다. SNI로 적절한 인증서를 고르게 하는 것만으로 클라이언트의 호스트 이름 검증이 완료되지는 않습니다. 만료된 인증서나 식별자 불일치는 애플리케이션 컨트롤러까지 도달하기 전에 연결 실패를 만듭니다.

안전한 인증서 교체는 만료 직전에 파일 하나를 바꾸는 작업이 아니라 다음과 같은 전환 과정입니다.

```text
새 인증서 발급
   │
   ├─ 부하 분산 장치 / Ingress에 배포
   ├─ 실제 엔드포인트에서 새 인증서 확인
   ├─ 이전·새 인스턴스 전환 완료 확인
   └─ 이전 인증서 자료 제거
```

자동 갱신을 사용해도 배포 실패나 Secret 다시 읽기 문제를 관측해야 합니다. 인증서 만료 시점 자체뿐 아니라 **새 인증서가 모든 서비스 엔드포인트에 실제로 적용되었는가**가 중요합니다.

DNS와 TLS의 프로토콜 의미는 Network & HTTP 영역에서 더 깊게 다룰 수 있습니다. Infrastructure 영역에서는 **DNS 캐시와 인증서 수명 때문에 변경이 즉시 원자적으로 적용되지 않으며, 이전·새 상태가 공존하는 기간을 운영해야 한다는 점**이 핵심입니다.

---
kind: concept
contentKey: network-http.core.dns.dns-failure
topicContentKey: network-http.core.dns
slug: dns-failure
title: "DNS 조회 실패"
summary: "NXDOMAIN·NODATA처럼 이름 데이터가 없다는 응답과 SERVFAIL·timeout처럼 조회 과정이 실패한 상태를 구분하고 재시도 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1035"
    title: "Domain Names — Implementation and Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS delegation과 service record의 역할을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc2308"
    title: "Negative Caching of DNS Queries"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NXDOMAIN/NODATA negative answer와 SOA 기반 negative TTL을 확인한다."
    displayOrder: 2
  - url: "https://www.rfc-editor.org/rfc/rfc9520"
    title: "Negative Caching of DNS Resolution Failures"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SERVFAIL 등 DNS 조회 과정의 실패를 이름·레코드 부재에 대한 부정 응답과 구분하는 규칙을 확인한다."
    displayOrder: 3
---
# DNS 조회 실패

애플리케이션이 DNS에서 주소를 얻지 못했다고 해서 이름이 존재하지 않는 것은 아닙니다. DNS 서버가 유효한 부정 응답을 보낸 경우와 리졸버가 정상적인 답을 만들지 못한 경우부터 구분해야 합니다.

### 이름 또는 레코드의 부재

- NXDOMAIN은 질의한 이름이 존재하지 않는다는 응답입니다.
- NODATA는 요청한 레코드 유형에 대한 데이터가 없다는 결과입니다. 일반적인 표현은 이름은 존재하지만 요청 유형의 레코드가 없다는 것입니다.

이 결과는 권한 있는 데이터에 근거할 수 있으며 RFC 2308의 부정 캐시 규칙이 적용됩니다.

### 조회 과정의 실패

- SERVFAIL은 서버가 정상적인 질의 결과를 만들지 못했음을 나타냅니다.
- REFUSED는 서버가 정책 등의 이유로 질의를 거절했음을 나타냅니다.
- 시간 초과는 정해진 시간에 사용할 수 있는 응답을 받지 못한 관찰 결과입니다.
- DNSSEC 검증 실패처럼 받은 데이터를 신뢰할 수 없어 해석이 실패할 수도 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "DNS 조회 실패",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "dns-failure"
}
```

### 재시도와 실패 캐시

RFC 9520 §3.1에 따르면 같은 서버 주소와 DNS 전송 방식에 대한 동일 질의는 응답이 없는 것으로 간주하기 전에 최초 질의 외에 최대 두 번까지 재시도합니다. 다른 전송 방식이 사용 가능하고 보안 정책에 맞으면 별도로 시도할 수 있습니다.

§3.2는 리졸버가 해석 실패를 캐시하도록 요구합니다. 실패 캐시의 유지 시간은 1초 이상 5분 이하이며, 캐시된 실패에 해당하는 질의를 받으면 만료 전 동일한 상위 조회를 반복하지 않습니다. 이 요구사항은 애플리케이션 HTTP 요청의 재시도 횟수를 정의한 것이 아닙니다.

권한 서버 조회가 시간 초과됐다면 NS·주소 정보, 네트워크 경로, UDP/TCP 응답 여부와 리졸버의 실패 캐시를 조사합니다. 서비스 인스턴스가 동시에 무한 재시도하면 장애 부하가 증가하므로 전체 시간 예산과 백오프를 별도로 설계해야 합니다.

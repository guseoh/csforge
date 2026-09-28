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
    recommendation: "DNS 메시지·레코드·응답 코드와 TTL의 기본 규칙을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc2308"
    title: "Negative Caching of DNS Queries"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NXDOMAIN·NODATA 부정 응답과 SOA 정보를 이용한 부정 캐시 수명을 확인한다."
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

애플리케이션이 DNS에서 주소를 얻지 못했다고 해서 원인이 모두 같은 것은 아니다. 먼저 **이름이나 요청한 레코드가 실제로 없다는 부정 응답**과 **리졸버가 정상적인 답을 만들지 못한 조회 과정 실패**를 구분해야 한다.

### 이름·레코드가 없다는 유효한 부정 응답

- `NXDOMAIN`: 질의한 도메인 이름 자체가 존재하지 않는다.
- `NODATA`: 이름은 존재하지만 요청한 레코드 유형의 데이터가 없다.

이 둘은 권한 있는 DNS 데이터에 근거해 `없다`는 정보를 전달하는 결과다. 그래서 일정 시간 부정 캐시로 재사용될 수 있다.

### 조회 과정 자체가 실패한 경우

- `SERVFAIL`: 서버나 리졸버가 오류 때문에 정상적인 답을 만들지 못했다.
- `REFUSED`: 서버가 정책 등의 이유로 질의를 거절했다.
- timeout·도달 불가: 정해진 시간 안에 사용할 수 있는 DNS 응답을 받지 못했다.
- DNSSEC 검증 실패처럼 응답을 신뢰할 수 없어 최종 답을 만들지 못하는 경우도 있다.

```text
DNS 조회 실패
  ├─ NXDOMAIN / NODATA
  │    → 이름·레코드 존재 여부에 대한 부정 응답
  └─ SERVFAIL / timeout / 검증 실패 ...
       → 이름 해석 과정 자체의 실패
```

### 재시도는 실패 종류와 전체 시간 예산을 함께 봐야 한다

일시적인 조회 실패에서는 다른 권한 서버나 전송 경로를 시도하는 재시도가 도움이 될 수 있다. 하지만 수백 개 인스턴스가 같은 장애에 즉시 반복 질의를 보내면 느려진 DNS 서버에 부하를 더해 **재시도 폭주(retry storm)**를 만들 수 있다.

따라서 재시도 횟수와 전체 시간 예산을 제한하고, 필요하면 지수 백오프와 지터를 사용해야 한다. 반대로 NXDOMAIN처럼 이름이 없다는 명시적 응답을 일시적 timeout과 똑같이 무한 재시도해서도 안 된다.

DNS 조회 실패의 핵심은 **`응답이 없다`와 `없다는 응답을 받았다`를 구분하고, 실패 종류에 맞게 캐시·재시도 정책을 결정하는 것**이다.

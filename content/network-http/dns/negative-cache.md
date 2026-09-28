---
kind: concept
contentKey: network-http.core.dns.negative-cache
topicContentKey: network-http.core.dns
slug: negative-cache
title: "부정 응답 캐시"
summary: "NXDOMAIN·NODATA 같은 부정 응답도 일정 시간 캐시되는 이유와 새 레코드 배포가 즉시 보이지 않을 수 있는 원인을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc2308"
    title: "Negative Caching of DNS Queries"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NXDOMAIN·NODATA 부정 응답과 SOA 정보를 이용한 부정 캐시 수명을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc9520"
    title: "Negative Caching of DNS Resolution Failures"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SERVFAIL 등 조회 과정 실패를 이름·레코드 부재에 대한 부정 응답과 구분한다."
    displayOrder: 2
---
# 부정 응답 캐시

DNS 리졸버는 성공한 레코드뿐 아니라 **일부 부정 응답도 제한된 시간 동안 캐시**할 수 있다. 존재하지 않는 이름을 반복해서 묻는 질의가 계속 권한 서버까지 올라가는 것을 줄이기 위해서다.

### NXDOMAIN과 NODATA는 서로 다른 부재를 나타낸다

- `NXDOMAIN`: 질의한 이름 자체가 존재하지 않는다.
- `NODATA`: 이름은 존재하지만 요청한 레코드 유형의 데이터가 없다.

```text
NXDOMAIN
missing.example. → 이름 자체가 없음

NODATA
example.com. AAAA → 이름은 있지만 AAAA 레코드가 없음
```

RFC 2308의 부정 캐시 규칙에서는 권한 응답의 SOA 정보를 이용해 이런 결과를 얼마 동안 기억할지 결정한다. 그래서 방금 권한 zone에 새 레코드를 추가했더라도 재귀 리졸버에 이전 NXDOMAIN·NODATA가 남아 있으면 캐시가 만료될 때까지 예전 실패가 계속 보일 수 있다.

### SERVFAIL·timeout은 `없다`는 응답과 다르다

SERVFAIL이나 timeout은 리졸버가 정상적인 최종 답을 만들지 못한 상태다. 이런 조회 실패도 반복 부하를 줄이기 위해 짧게 기억할 수 있지만, **이름이 존재하지 않는다는 권한 있는 부정 응답과 같은 의미는 아니다.**

장애를 조사할 때는 `권한 zone에 현재 레코드가 있는가 → 문제 재귀 리졸버가 어떤 부정 응답을 얼마나 남겨 두고 있는가 → OS·런타임 캐시에도 실패가 남아 있는가` 순서로 분리해서 보면 원인을 좁히기 쉽다.

부정 응답 캐시의 핵심은 **`없다`는 결과도 캐시될 수 있으므로 원본 DNS를 고친 시점과 사용자가 새 값을 보기 시작하는 시점이 다를 수 있다는 점**이다.

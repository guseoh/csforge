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
    recommendation: "NXDOMAIN/NODATA negative answer와 SOA 기반 negative TTL을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc9520"
    title: "Negative Caching of DNS Resolution Failures"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SERVFAIL 등 DNS 조회 과정의 실패를 이름·레코드 부재에 대한 부정 응답과 구분하는 규칙을 확인한다."
    displayOrder: 2
---
# 부정 응답 캐시

DNS는 존재하는 레코드뿐 아니라 이름이나 레코드가 없다는 결과도 캐시합니다. 존재하지 않는 이름에 대한 반복 질의가 매번 권한 서버로 전달되면 불필요한 부하가 발생하기 때문입니다.

| 결과 | 의미 | 예시 |
| --- | --- | --- |
| NXDOMAIN | 질의한 이름의 부재 | missing.example. |
| NODATA | 요청한 레코드 유형의 데이터 부재 | example.com.의 AAAA 데이터 없음 |

RFC 2308에서 권한 부정 응답의 캐시 수명은 SOA 정보를 이용해 결정합니다. 예를 들어 SOA 레코드의 TTL이 600초이고 MINIMUM이 120초인 권한 부정 응답은 그중 작은 120초를 기준으로 합니다. 이후 캐시에 남은 수명은 감소합니다. 이름을 새로 등록했더라도 기존 부정 캐시가 남아 있다면 이전 결과가 반환될 수 있습니다.

### 해석 실패의 캐시는 별도 규칙입니다

SERVFAIL이나 시간 초과는 이름이 없다는 정보가 아니라 정상 답을 얻지 못했다는 결과입니다. RFC 9520 §3.2는 리졸버의 해석 실패 캐시 구현을 필수로 하고 1초 이상 5분 이하의 유지 시간을 요구합니다. 캐시 항목의 키는 실패 종류와 구현에 따라 다를 수 있습니다.

따라서 새 레코드가 보이지 않을 때는 권한 서버의 현재 데이터와 문제 재귀 리졸버의 응답 종류 및 캐시 상태를 비교합니다. OS·런타임의 별도 캐시도 확인합니다. 부정 응답의 TTL과 해석 실패의 캐시 시간을 혼동하면 원인이 잘못된 DNS 데이터인지 조회 과정의 장애인지 판단하기 어렵습니다.

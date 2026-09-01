---
kind: concept
contentKey: network-http.core.http-cache.freshness
topicContentKey: network-http.core.http-cache
slug: freshness
title: "Freshness"
summary: "response가 fresh인지 stale인지 판단하는 시간 모델을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Freshness

cache가 response를 저장했다고 해서 그 response를 언제까지 그대로 사용할 수 있는지는 별도의 판단이 필요하다. HTTP cache는 response의 freshness lifetime과 현재까지의 age를 비교해 fresh 또는 stale 상태를 결정한다. fresh response는 요청 조건과 다른 cache 지시가 없다면 origin에 다시 묻지 않고 재사용할 수 있지만, stale response는 보통 origin 또는 다음 cache에 재검증을 요청해야 한다.

freshness lifetime은 `Cache-Control: max-age`나 `Expires` 같은 response metadata에서 얻는다. `max-age=N`은 local cache가 response를 받은 뒤 정확히 N초라는 뜻이 아니라, HTTP 규칙으로 계산한 current age가 N초를 초과하면 entry를 stale로 판단하게 하는 freshness lifetime이다. current age에는 response의 `Date`, 전달받은 `Age`, 각 cache에 머문 resident time과 경과 시간이 반영되므로, 여러 intermediary를 거친 response를 단순히 원본 생성 시각과 현재 시각만 비교해서는 안 된다. `no-cache`처럼 저장된 response를 사용하기 전에 validation을 요구하는 지시가 있다면 fresh 여부와 별개로 재검증이 필요하다.

stale이라는 말은 곧바로 폐기되었다는 뜻도 아니다. `stale-while-revalidate`나 장애 시 stale 제공을 허용하는 정책이 있으면 cache가 오래된 body를 먼저 주고 뒤에서 검증할 수 있지만, 이는 명시된 cache policy의 범위 안에서만 가능하다. 반대로 HTTP freshness는 business 데이터가 최신이라는 보장이 아니므로, 가격·권한·개인별 review 상태처럼 별도의 업무 만료 조건이 있는 response를 fresh라는 이유만으로 안전하다고 판단해서는 안 된다.

### Backend 연결

CSForge의 공개 curriculum 조회는 versioned content와 짧은 freshness lifetime을 조합할 수 있지만, 개인별 review 결과는 HTTP cache의 fresh 상태와 업무상 최신 상태가 다르다. 따라서 두 response를 같은 cache 정책으로 묶지 않고, 측정할 때도 cache hit 여부와 origin 데이터의 최신성·업무 만료를 별도로 확인해야 한다.

---
kind: concept
contentKey: network-http.core.http-cache.expires
topicContentKey: network-http.core.http-cache
slug: expires
title: "Expires"
summary: "absolute expiry와 Cache-Control 우선순위를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Expires

`Expires`는 response가 더 이상 fresh하지 않다고 판단할 절대 시각을 HTTP-date로 표현한다. cache는 response의 `Date`와 현재 시각을 비교해 이 시각이 지났는지 판단하므로, header의 날짜 형식과 시계 기준이 중요하다. 응답 생성 후 60초 동안 fresh라는 상대 정책을 표현하려면 `Cache-Control: max-age=60`처럼 상대 lifetime을 쓰는 편이 clock 차이에 덜 민감하다.

같은 response에 `Cache-Control: max-age`가 있으면 freshness 계산에서는 `max-age`가 `Expires`보다 우선한다. 두 값을 서로 다르게 설정해도 하나의 cache가 `Expires`를 먼저 적용하고 다른 cache가 `max-age`를 적용하는 상황을 만들 수 있으므로, 호환성을 위해 함께 보낼 때는 의미를 일치시킨다. 유효하지 않거나 이미 지난 `Expires`는 fresh response를 만들지 못하며, cache는 다른 freshness 정보와 일반적인 재검증 규칙을 적용한다.

절대 시각은 origin, user agent, intermediary의 clock skew와 전송 지연의 영향을 직관적으로 드러내지 못한다. 그렇다고 `Expires`가 HTTP request마다 다시 계산되는 timeout이거나 저장 장치의 만료를 보장하는 것은 아니다. 이는 특정 HTTP response의 cache 재사용 가능 시점을 표현하는 metadata일 뿐이며, 애플리케이션의 업무 만료 시각은 별도로 검증해야 한다.

### Backend 연결

Spring endpoint가 `Expires`와 `Cache-Control`을 함께 생성한다면 의도한 freshness lifetime이 두 header에서 같은지 contract test로 확인한다. CDN과 browser의 동작을 비교할 때는 server clock, `Date`, `Age`와 실제 cache policy를 함께 기록해야 하며, header가 신선해 보여도 canonical content reimport이 모든 edge object를 즉시 갱신한다는 뜻은 아니다.

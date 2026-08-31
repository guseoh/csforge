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

cache response는 freshness lifetime과 current age를 비교해 fresh인지 stale인지 판단한다. fresh response는 origin validation 없이 재사용할 수 있지만 stale response는 재검증하거나 policy가 허용하는 경우에만 사용한다.

Date, Age, Cache-Control과 intermediary clock이 판단에 관여한다. fresh라는 말은 데이터가 business-wise 최신이라는 보장이 아니라 HTTP cache policy 안에서 재사용 가능하다는 뜻이다.

### Backend 연결

concept 목록과 개인별 review 결과를 같은 freshness 정책으로 cache하지 않는다. 사용자별 state와 public immutable content의 cache scope를 분리한다.

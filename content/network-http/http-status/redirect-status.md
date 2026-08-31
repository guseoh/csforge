---
kind: concept
contentKey: network-http.core.http-status.redirect-status
topicContentKey: network-http.core.http-status
slug: redirect-status
title: "Redirect Status"
summary: "redirect code가 다음 request location과 method 처리에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Redirect Status

3xx response는 client가 다른 location을 조회하거나 cache를 사용할 수 있음을 나타낸다. 301·302·303·307·308은 method 보존과 cache·permanent 의미가 달라 client가 다음 request를 어떻게 만들지 명시해야 한다.

redirect를 따라가는 client는 최대 횟수, scheme downgrade, host 변경, Authorization 전달을 검증해야 한다. redirect response 자체가 최종 resource의 성공을 의미하지 않는다.

### Backend 연결

reverse proxy 뒤 HTTPS redirect를 만들 때 external scheme을 정확히 판정한다. POST 뒤 PRG에는 303을 검토하고, method 보존이 필요하면 307/308과 retry effect를 함께 검증한다.

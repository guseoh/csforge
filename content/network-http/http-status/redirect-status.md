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

3xx response는 client가 `Location`의 다른 URI로 request를 이어가거나 cached representation을 사용할 수 있음을 알린다. `301`과 `308`은 permanent 이동 의미가 있고, `302`와 `303`은 다음 request method를 user agent가 처리하는 관행/규칙이 다르며, `307`과 `308`은 original method와 content를 보존하는 redirect다. redirect 자체가 최종 resource의 성공 response는 아니다.

특히 POST 뒤의 302는 오래된 user-agent 관행으로 GET으로 바뀔 수 있지만, method 보존이 필요하면 307/308을 사용하고 body replay를 감당할 수 있는지 확인한다. PRG처럼 결과 조회로 전환하려면 303을 검토한다. client는 redirect 횟수, scheme downgrade, host/origin 변경과 Authorization·cookie 전달을 검증하고, redirect target을 무조건 신뢰하지 않는다.

reverse proxy 뒤 HTTPS redirect를 만들 때 external scheme과 trusted forwarded header를 정확히 판정한다. POST·payment·import command의 redirect에서는 method 변경과 retry effect를 함께 검증하고, permanent redirect cache가 오래 남을 수 있음을 rollout에 반영한다.

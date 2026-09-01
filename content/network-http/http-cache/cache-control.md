---
kind: concept
contentKey: network-http.core.http-cache.cache-control
topicContentKey: network-http.core.http-cache
slug: cache-control
title: "Cache-Control"
summary: "max-age·no-cache·no-store 등 cache directive를 해석한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Cache-Control

`Cache-Control`은 cache가 response를 저장할 수 있는지, 얼마나 오래 fresh로 볼지, stale response를 재검증해야 하는지를 표현하는 HTTP 지시다. `max-age=60`은 HTTP 규칙으로 계산한 response의 current age가 60초를 초과하면 stale로 판단하게 하는 freshness lifetime을 제공한다. 이는 local cache가 response를 받은 뒤 단순히 60초만 세라는 뜻도, 60초 뒤 반드시 body를 폐기하라는 뜻도 아니며, stale response를 재검증하거나 정책에 따라 처리할 수 있는지는 다른 directive와 cache 종류가 함께 결정한다.

`no-cache`는 저장 자체를 금지하는 말이 아니라 저장한 response를 재사용하기 전에 origin 검증을 요구한다. `no-store`는 cache가 response를 저장하지 않도록 하는 지시다. 따라서 `max-age=0`은 freshness lifetime이 0인 저장 가능한 response일 수 있지만 `no-store`와 동일하지 않다. `must-revalidate`는 stale response를 임의로 계속 제공하지 말고 필요한 경우 origin에 재검증하라는 제약이며, `s-maxage`는 shared cache에 적용할 별도의 lifetime을 지정한다.

request의 `Cache-Control`은 client가 오래된 응답을 허용하지 않거나 재검증을 요구하는 등 요청 의도를 전달하고, response의 directive는 cache가 보관·재사용할 때 따라야 할 정책을 전달한다. `private`, `public`, `Vary`처럼 cache 범위나 representation 선택을 조정하는 지시는 뒤의 private/shared cache와 함께 해석해야 한다. header 하나를 애플리케이션 cache의 만료 설정이나 DB transaction의 일관성 보장으로 확대해석해서도 안 된다.

### Backend 연결

개인화된 review response에는 `no-store` 또는 적절한 `private` 정책을 선택하고, 공개 curriculum처럼 versioned representation만 shared cache 후보로 삼는다. canonical content를 reimport한 직후에도 이미 저장된 HTTP response가 `max-age` 동안 남을 수 있으므로, import 완료와 HTTP cache freshness·purge 정책을 같은 완료 상태로 표시하지 않는다.

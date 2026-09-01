---
kind: concept
contentKey: network-http.core.http-methods.safe-method
topicContentKey: network-http.core.http-methods
slug: safe-method
title: "Safe Method"
summary: "safe가 의도된 state change가 없다는 의미를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Safe Method

safe method는 client가 request를 수행할 때 origin resource의 state change를 의도하지 않는 method다. 이것은 server process가 access log, metrics, cache metadata나 rate-limit counter를 전혀 바꾸지 않는다는 뜻이 아니라, resource에 대한 본질적인 변경을 client가 요청하지 않는다는 protocol semantics다.

GET과 HEAD 같은 safe method는 crawler·prefetch·link checker·자동 retry가 실행할 수 있는 전제에서 설계되므로 읽기 경로가 destructive action을 일으키면 안 된다. query parameter에 `delete=true` 같은 flag를 숨겨도 method가 GET인 사실이 실제 effect를 safe하게 만들지 않는다. safe는 authentication이나 authorization을 생략하라는 뜻도 아니다.

Backend 조회 endpoint에서 삭제·상태변경을 query string으로 숨기지 않고 명시적인 non-safe method와 CSRF·authorization 정책을 사용한다. read path에 부수적인 업무 변경이 있다면 cache와 retry가 resource invariant를 깨뜨리지 않는지 별도로 검토한다.

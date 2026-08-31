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

safe method는 client가 request를 보낼 때 origin resource의 state change를 의도하지 않는 method다. server가 access log, analytics, cache metadata를 바꾸는 부수 효과까지 없다는 뜻은 아니다.

GET과 HEAD 같은 safe method는 crawler·prefetch·retry가 상대적으로 안전하지만, query parameter가 destructive action을 트리거하면 protocol contract를 위반한다. method 이름과 실제 route effect를 일치시킨다.

### Backend 연결

조회 endpoint에서 삭제·상태변경을 query string으로 숨기지 않는다. safe request의 retry와 cache를 허용하려면 read path에 side effect를 두지 않는다.

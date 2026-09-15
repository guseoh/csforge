---
kind: concept
contentKey: network-http.core.http-methods.safe-method
topicContentKey: network-http.core.http-methods
slug: safe-method
title: "Safe Method와 Read-Only Semantics"
summary: "HTTP safe method가 client가 resource state change를 의도하지 않는 read-only semantics라는 의미를 설명한다."
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
# Safe Method와 Read-Only Semantics

HTTP method가 **safe**하다는 것은 client가 그 request를 통해 origin server의 resource state를 변경하도록 요청하거나 기대하지 않는다는 뜻이다. RFC 9110이 정의하는 GET, HEAD, OPTIONS, TRACE가 safe method에 해당한다.

여기서 `safe = server에서 아무 상태도 바뀌지 않는다`고 해석하면 지나치다. server는 GET을 처리하면서 access log를 기록하거나 metric counter를 증가시킬 수 있다. 이런 부수 효과는 client가 요청한 resource 변경의 의미가 아니므로 safe semantics와 모순되지 않는다.

### Safe method에 destructive action을 숨기면 안 된다

예를 들어 다음 URI를 GET으로 호출했을 때 실제 삭제가 실행되도록 설계했다고 하자.

```text
GET /posts/42?do=delete
```

method 이름이 GET이라고 실제 effect가 safe해지는 것은 아니다. crawler, prefetcher나 link checker는 safe method를 자동 실행할 수 있다는 전제에서 동작하기 때문에, GET에 resource state 변경을 숨기면 의도하지 않은 작업이 실행될 수 있다.

safe semantics는 authorization이 필요 없다는 뜻도 아니다. private resource 조회처럼 state를 변경하지 않아도 접근 권한 검사는 필요할 수 있다.

핵심은 **safe가 server implementation의 모든 side effect를 금지하는 속성이 아니라, client가 target resource의 state change를 요청하지 않는다는 HTTP-level contract**라는 점이다.

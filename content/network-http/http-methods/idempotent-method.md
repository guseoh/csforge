---
kind: concept
contentKey: network-http.core.http-methods.idempotent-method
topicContentKey: network-http.core.http-methods
slug: idempotent-method
title: "Idempotent Method와 반복 요청"
summary: "같은 요청을 여러 번 수행했을 때 intended effect가 한 번 수행한 것과 같다는 HTTP idempotency를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Idempotent Method와 반복 요청

HTTP에서 method가 **idempotent**하다는 것은 동일한 request를 여러 번 수행했을 때 client가 의도한 server effect가 한 번 수행했을 때와 같도록 method semantics가 정의되어 있다는 뜻이다. safe method와 PUT, DELETE가 idempotent method에 해당한다.

예를 들어 특정 resource를 원하는 상태로 대체하는 동일 PUT request를 두 번 보내더라도 두 번째 요청이 `한 번 더 누적 변경`을 의미하지 않는다. DELETE도 이미 association이 제거된 target에 같은 삭제 의도를 반복한다고 해서 삭제 effect가 계속 누적되는 method가 아니다.

### Idempotent는 response가 항상 같다는 뜻이 아니다

두 PUT 사이에 다른 client가 resource를 수정할 수도 있고, server는 매 request마다 새로운 Date header나 audit log를 만들 수 있다. 첫 DELETE가 `204`, 반복 DELETE가 resource 상태에 따라 다른 status를 반환할 수도 있다. 이런 차이가 있다고 method의 intended effect가 곧바로 non-idempotent가 되는 것은 아니다.

이 속성은 communication failure 뒤 retry를 판단할 때 중요하다. client가 request를 보냈지만 response를 받기 전에 connection이 끊겼다면, idempotent method는 원래 요청이 이미 적용되었을 가능성이 있어도 같은 intended effect를 다시 요청할 수 있도록 정의되어 있다.

하지만 idempotent가 `network가 exactly once 실행한다`는 뜻은 아니다. 요청은 실제로 여러 번 server에 도착할 수 있다. **HTTP idempotency는 반복 요청의 intended effect에 관한 semantics**이며, 특정 업무 side effect의 중복 방지는 별도의 application contract가 필요할 수 있다.

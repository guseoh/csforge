---
kind: concept
contentKey: network-http.core.http-state-intermediary.gateway
topicContentKey: network-http.core.http-state-intermediary
slug: gateway
title: "Gateway"
summary: "protocol·routing·policy를 경계에서 중계하는 gateway의 역할을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Gateway

gateway는 client와 upstream 사이의 경계에서 protocol·routing·identity·policy를 중계하는 역할 이름이다. HTTP를 gRPC나 내부 command로 변환하거나, route 선택·authentication 연계·quota·audit·observability를 수행할 수 있다. reverse proxy와 같은 제품으로 구현될 수 있지만, gateway라는 명칭 자체가 특정 protocol이나 모든 authorization 책임을 표준화하는 것은 아니다.

gateway가 request body를 buffer하면 streaming과 backpressure가 달라지고, upstream retry를 수행하면 이미 처리된 side effect가 중복될 수 있다. 따라서 request body의 재시도 가능성, timeout budget을 client-to-gateway와 gateway-to-upstream으로 나누는 방법, response status·error mapping, 전달할 header allowlist와 upstream identity를 contract로 정한다. gateway가 성공적으로 전달했다는 사실과 domain transaction이 commit되었다는 사실도 분리한다.

gateway의 authentication 결과는 backend가 신뢰할 수 있는 channel과 형식으로 전달되어야 한다. 외부 client가 같은 이름의 identity header를 먼저 넣을 수 있다면 client 주장과 gateway 검증 결과가 섞이므로, gateway가 기존 값을 제거하고 canonical context를 다시 만들며 backend는 허용된 gateway에서 온 요청만 받도록 한다. domain-level authorization과 resource invariant은 여전히 backend/application 책임으로 남는다.

### Backend 연결

CSForge에 API gateway가 있더라도 request shape validation의 일부와 edge quota를 gateway에 둘 수 있을 뿐 application validation과 domain authorization을 모두 옮기지 않는다. canonical PostgreSQL transaction commit, gateway delivery status, asynchronous indexing status를 별도 상태로 기록해 gateway timeout 뒤에도 결과를 조회·복구할 수 있게 한다.

---
kind: concept
contentKey: network-http.core.http-status.status-class
topicContentKey: network-http.core.http-status
slug: status-class
title: "HTTP Status Code Classes"
summary: "1xx~5xx class가 response의 큰 의미 범위를 분류하고 구체적인 code가 실제 상태를 설명하는 방식을 설명한다."
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
# HTTP Status Code Classes

HTTP status code의 첫 번째 숫자는 response가 속한 큰 의미 범위를 나타낸다. client는 이 class를 통해 결과의 성격을 빠르게 분류할 수 있지만, 실제 다음 행동은 구체적인 status code와 response fields를 함께 봐야 판단할 수 있다.

- `1xx Informational`: 요청 처리 중 전달하는 중간 정보다. 최종 response가 별도로 이어질 수 있다.
- `2xx Successful`: 요청을 성공적으로 수신·이해·처리했다는 범위다.
- `3xx Redirection`: 요청을 완료하기 위해 다른 resource를 조회하거나 cached result를 사용하는 등 추가 동작이 필요할 수 있다.
- `4xx Client Error`: request에 문제가 있거나 현재 요청을 수행할 수 없는 이유가 client 요청 측 조건과 연결된다.
- `5xx Server Error`: server가 유효해 보이는 request를 처리하는 과정에서 실패했거나 처리할 수 없는 상태다.

### Class만으로 retry나 업무 결과를 정할 수는 없다

같은 4xx라도 `401`은 authentication challenge와 연결되고 `404`는 target resource를 찾지 못한 경우다. 같은 5xx라도 `500`은 server 내부 오류이고 `504`는 gateway가 upstream response를 제때 받지 못한 상태다. 따라서 `4xx는 절대 retry하지 않는다`, `5xx는 무조건 retry한다`처럼 class 하나만으로 복구 정책을 결정하면 안 된다.

status code는 **현재 HTTP interaction의 결과를 표현하는 protocol signal**이다. application-specific error reason이나 장기 workflow 상태까지 하나의 숫자에 모두 담는 것이 아니므로, 필요한 세부 정보는 response representation과 header fields가 보완한다.

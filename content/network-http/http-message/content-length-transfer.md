---
kind: concept
contentKey: network-http.core.http-message.content-length-transfer
topicContentKey: network-http.core.http-message
slug: content-length-transfer
title: "Content-Length와 HTTP/1.1 Message Framing"
summary: "HTTP/1.1에서 Content-Length와 Transfer-Encoding이 message body 경계를 결정하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 message framing과 body 경계를 확인한다."
    displayOrder: 1
---
# Content-Length와 HTTP/1.1 Message Framing

HTTP/1.1은 하나의 connection에서 여러 message를 주고받을 수 있으므로 receiver가 **현재 message body가 어디에서 끝나는지** 정확히 알아야 한다. `Content-Length`는 content가 포함된 일반적인 message에서 body의 예상 octet 수를 알려 주어 그 경계를 결정하는 데 사용할 수 있다.

예를 들어 `Content-Length: 120`이면 framing 규칙상 receiver는 해당 body에서 120 octet을 읽어야 한다. 이 숫자는 JSON object의 field 수나 TCP segment 수를 뜻하지 않는다. HTTP message를 구성하는 body의 byte 길이에 관한 정보다.

### Transfer-Encoding은 HTTP/1.1 message 전송 방식이다

body 크기를 미리 알 수 없는 경우 HTTP/1.1에서는 `Transfer-Encoding: chunked`를 사용해 content를 여러 chunk로 나누고 마지막 chunk로 끝을 표시할 수 있다. transfer coding은 representation 자체의 형식인 `Content-Encoding`과 다르며, HTTP message를 connection 위에 전달하는 과정의 속성이다.

`Content-Length`와 `Transfer-Encoding`이 충돌하는 message는 매우 조심해서 처리해야 한다. RFC 9112에서 Transfer-Encoding이 framing precedence를 가지지만, 둘을 동시에 받은 상황 자체가 request smuggling 같은 parser disagreement 위험과 연결될 수 있으므로 정상적인 sender는 함께 보내지 않아야 한다. citeturn741558search0

HTTP/2와 HTTP/3은 HTTP/1.1의 chunked transfer coding을 그대로 사용하지 않고 stream/frame 구조로 content를 운반한다. 따라서 `Content-Length`와 chunked를 HTTP 전체의 유일한 framing 방식으로 일반화하면 안 된다.

핵심은 **representation이 무엇을 의미하는가**와 **wire에서 이번 HTTP message의 bytes가 어디까지인가**를 분리하는 것이다. `Content-Type`은 전자를, HTTP version별 framing은 후자를 다룬다.

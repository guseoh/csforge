---
kind: concept
contentKey: network-http.core.http-message.accept
topicContentKey: network-http.core.http-message
slug: accept
title: "Accept와 선호 Representation"
summary: "Accept가 client가 처리할 수 있거나 선호하는 response media type을 표현하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Accept와 선호 Representation

`Accept` request header는 client가 response로 받을 수 있거나 선호하는 media type을 server에 알려 준다. 예를 들어 client가 JSON을 원한다면 `Accept: application/json`을 보낼 수 있고, 여러 형식을 허용하면서 quality value로 선호도를 표현할 수도 있다.

```text
Accept: application/json, text/html;q=0.8
```

이 값은 `현재 request content가 JSON이다`라는 뜻이 아니다. request body의 형식은 `Content-Type`이 설명한다. `Accept`는 앞으로 받을 response representation에 대한 선호를 전달한다.

### Accept가 결과를 일방적으로 명령하는 것은 아니다

server는 client가 보낸 preference와 자신이 실제로 제공할 수 있는 representation을 함께 고려해 response를 선택한다. 요청한 형식을 제공할 수 없을 때 다른 default representation을 반환할지, `406 Not Acceptable`로 응답할지는 HTTP semantics와 application policy에 따라 결정된다.

wildcard도 사용할 수 있어 `application/*`이나 `*/*`처럼 더 넓은 범위를 허용할 수 있다. 하지만 범위가 넓을수록 client가 정확히 어떤 representation을 받게 될지는 server 선택에 더 많이 의존한다.

따라서 `Accept`의 핵심은 **response representation 선택에 사용할 client preference를 표현하는 협상 입력**이라는 점이다.

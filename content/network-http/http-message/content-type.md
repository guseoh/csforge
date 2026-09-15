---
kind: concept
contentKey: network-http.core.http-message.content-type
topicContentKey: network-http.core.http-message
slug: content-type
title: "Content-Type"
summary: "Content-Type이 현재 message content에 적용된 representation media type을 선언하는 역할을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Content-Type

`Content-Type`은 현재 HTTP message에 포함된 content가 어떤 media type의 representation인지 설명한다. 예를 들어 request body가 JSON representation이라면 `Content-Type: application/json`으로 선언할 수 있고, receiver는 이 metadata를 바탕으로 적절한 parser를 선택한다.

이 field는 `client가 어떤 응답을 받고 싶은가`를 말하지 않는다. 그 역할은 `Accept`가 담당한다. 요청에서 `Content-Type`은 **지금 보내는 content의 형식**, `Accept`는 **응답에서 선호하는 형식**이라는 방향 차이를 기억하면 구분하기 쉽다.

```text
Content-Type: application/json
             ↑
       현재 content의 형식
```

### 선언과 실제 content는 일치해야 한다

header에 `application/json`이라고 적었다고 bytes가 자동으로 valid JSON이 되는 것은 아니다. receiver는 media type을 확인한 뒤 실제 content를 parse해야 하며, syntax나 schema가 잘못되면 별도의 validation failure가 발생할 수 있다.

또한 `Content-Type`은 representation format을 설명하는 metadata이지 HTTP message의 길이나 transport framing을 정하는 field가 아니다. content의 byte 경계는 해당 HTTP version의 framing 규칙으로 결정한다.

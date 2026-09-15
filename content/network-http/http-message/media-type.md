---
kind: concept
contentKey: network-http.core.http-message.media-type
topicContentKey: network-http.core.http-message
slug: media-type
title: "Media Type과 Representation 형식"
summary: "media type이 representation data의 format과 processing model을 type/subtype으로 표현하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Media Type과 Representation 형식

media type은 representation data가 어떤 형식이며 어떻게 처리되어야 하는지를 `type/subtype` 형태로 표현한다. 대표적으로 `application/json`, `text/html`, `image/png` 같은 값이 있다. 필요하면 `charset` 같은 parameter가 media type에 추가될 수 있다.

두 payload가 모두 사람이 보면 text처럼 보여도 media type이 다르면 처리 방식은 달라질 수 있다. `application/json`은 JSON parser가 해석할 data를 나타내고, `text/html`은 HTML processing model을 가진 representation을 나타낸다. 따라서 media type은 단순한 파일 확장자나 character encoding 이름이 아니다.

### Media Type과 Content Coding은 다른 축이다

`Content-Encoding: gzip`처럼 content coding이 적용되어도 원래 representation의 media type이 `application/json`이었다면 그 의미가 다른 resource format으로 바뀌는 것은 아니다. receiver는 coding을 해제한 뒤 media type에 따라 representation data를 해석한다.

```text
representation format: application/json
        ↓ gzip content coding
wire content: compressed bytes
```

media type을 이해할 때 핵심은 **data가 무엇을 표현하고 어떤 parser/processing model로 해석되어야 하는지 알려 주는 metadata**라는 점이다. 실제 HTTP message에서 그 media type을 선언하는 역할은 `Content-Type` field가 담당한다.

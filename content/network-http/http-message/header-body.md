---
kind: concept
contentKey: network-http.core.http-message.header-body
topicContentKey: network-http.core.http-message
slug: header-body
title: "Header and Body"
summary: "metadata header와 content body의 parsing·framing 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Header and Body

header field는 content의 길이·형식·조건·cache·authorization 같은 metadata를 표현하고 body는 실제 content bytes를 운반한다. header parsing과 body framing이 먼저 완료되어야 application serializer가 body를 해석한다.

Content-Length, transfer coding, HTTP/2 frame은 서로 다른 framing layer다. body를 JSON으로 parse할 수 있다는 사실이 request가 안전하거나 semantic validation을 통과했다는 뜻은 아니다.

### Backend 연결

multipart와 JSON upload의 size·content type·boundary를 서버에서 제한한다. body를 모두 memory에 모으지 않고 streaming할 때도 validation과 cancellation 경계를 유지한다.

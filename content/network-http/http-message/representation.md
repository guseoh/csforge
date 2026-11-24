---
kind: concept
contentKey: network-http.core.http-message.representation
topicContentKey: network-http.core.http-message
slug: representation
title: "표현 데이터(Representation)"
summary: "URI가 식별하는 리소스와 HTTP 메시지로 전달되는 표현 데이터를 구분하고, 같은 리소스도 여러 형식으로 표현될 수 있는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 표현 데이터(Representation)

리소스는 URI가 식별하는 대상이며 표현은 그 리소스의 상태에 관한 데이터와 메타데이터입니다. 예를 들어 /users/42를 JSON 문서 또는 HTML 문서로 제공할 수 있습니다. 전달되는 바이트가 다르더라도 동일한 리소스의 다른 표현일 수 있습니다.

| 대상 | 표현 | 관련 메타데이터 |
| --- | --- | --- |
| /users/42 | JSON | Content-Type: application/json |
| /users/42 | HTML | Content-Type: text/html |
| /users/42 | gzip으로 코딩한 JSON | Content-Type 및 Content-Encoding |

### 표현의 선택과 검증자

GET은 단순히 서버의 JSON 파일을 읽는다는 뜻이 아닙니다. 서버는 요청 조건에 맞는 표현을 선택할 수 있습니다. 표현 데이터의 코딩과 유형을 설명하는 메타데이터를 함께 해석해야 합니다. 리소스와 선택된 표현을 구분하면 ETag가 DB 엔티티 전체나 URI의 영구 ID가 아니라 표현의 검증자라는 점도 이해할 수 있습니다.

### 캐시에서의 변형

언어·미디어 유형·콘텐츠 코딩이 달라질 수 있다면 Vary 및 실제 캐시 키를 그 선택 조건과 맞춰야 합니다. 같은 리소스라는 이유로 다른 변형이나 사용자별 표현을 무조건 재사용해서는 안 됩니다.

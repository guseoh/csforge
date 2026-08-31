---
kind: concept
contentKey: network-http.core.request-journey.url-components
topicContentKey: network-http.core.request-journey
slug: url-components
title: "URL Components"
summary: "scheme·authority·path·query·fragment의 처리 주체를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3986"
    title: "Uniform Resource Identifier (URI): Generic Syntax"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "URL 구성 요소와 HTTP request target을 확인한다."
    displayOrder: 1
---
# URL Components

URL은 scheme, authority(host와 optional port), path, query, fragment 같은 구성 요소로 해석된다. scheme과 authority는 connection 대상 선택에 관여하고 path·query는 HTTP request target에 전달되며 fragment는 보통 client가 처리해 server로 보내지 않는다.

percent-encoding과 path normalization을 임의로 바꾸면 resource identity와 signature가 달라질 수 있다. URL parsing과 business route matching을 분리해 canonicalization 규칙을 하나로 둔다.

### Backend 연결

Spring controller의 path variable, query parameter, fragment를 같은 입력으로 취급하지 않는다. redirect와 cache key를 만들 때 host·scheme 신뢰 경계를 검증한다.


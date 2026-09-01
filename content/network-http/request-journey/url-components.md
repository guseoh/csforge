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

URL은 보통 scheme, authority(host와 optional port), path, query, fragment를 서로 다른 의미의 구성 요소로 나눈다. scheme은 어떤 application protocol과 처리 규칙을 사용할지 선택하는 입력이고 authority는 connection 후보인 host·port를 표현한다. path와 query는 server로 보낼 HTTP request target의 일부가 될 수 있지만, fragment는 user agent가 문서 내부 위치나 client state로 처리하므로 일반적인 HTTP request에는 포함되지 않는다.

상대 URL은 기준 URL에서 path와 authority를 해석하고, default port·percent-encoding·dot segment·path normalization을 어느 계층에서 적용할지 결정해야 한다. 문자열을 임의로 decode하거나 normalize하면 cache key, signature와 resource identity가 달라질 수 있으므로 URL parsing, HTTP target parsing과 business route matching을 섞지 않는다. 같은 문자열이더라도 scheme/authority와 request target의 처리 주체는 다르다.

Spring controller에서 path variable, query parameter, fragment를 같은 입력으로 취급하지 않는다. redirect·absolute URL·cache key를 만들 때 external scheme/host의 신뢰 경계를 검증하고, client가 보낸 fragment에 의존하는 server route를 설계하지 않는다.


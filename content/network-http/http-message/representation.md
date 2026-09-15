---
kind: concept
contentKey: network-http.core.http-message.representation
topicContentKey: network-http.core.http-message
slug: representation
title: "Resource와 Representation"
summary: "URI로 식별되는 resource와 HTTP message로 전달되는 representation을 구분한다."
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
# Resource와 Representation

HTTP에서 resource는 URI로 식별되는 개념적 대상이고, representation은 그 resource의 현재 또는 과거 상태를 특정 형식의 data와 metadata로 표현한 것이다. 둘을 구분하면 `resource = JSON 문서`처럼 wire format과 대상 자체를 동일시하는 오해를 피할 수 있다.

예를 들어 `/users/42`라는 하나의 resource가 있다고 하자. server는 같은 resource를 JSON으로 표현할 수도 있고, HTML이나 다른 media type으로 표현할 수도 있다. resource identity는 같더라도 client preference와 server policy에 따라 전달되는 representation은 달라질 수 있다.

### Representation은 data와 metadata를 함께 본다

representation을 해석하려면 bytes만으로는 충분하지 않을 수 있다. `Content-Type` 같은 representation metadata가 format을 알려 주고, `Content-Encoding`은 data에 적용된 coding을 설명할 수 있다. validator나 cache metadata 역시 어떤 representation state를 재사용할 수 있는지 판단하는 데 관여한다.

content negotiation이 있다면 같은 resource에 여러 representation variant가 존재할 수 있다. 이때 cache는 요청의 어떤 조건에 따라 variant가 선택됐는지 구분해야 한다.

핵심은 HTTP API의 resource를 특정 serializer 결과와 묶지 않는 것이다. **resource는 무엇을 가리키는가의 문제이고, representation은 그 resource를 이번 HTTP interaction에서 어떤 data 형태로 표현하는가의 문제**다.

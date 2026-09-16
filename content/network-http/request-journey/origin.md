---
kind: concept
contentKey: network-http.core.request-journey.origin
topicContentKey: network-http.core.request-journey
slug: origin
title: "Origin과 Scheme·Host·Port"
summary: "scheme·host·port tuple로 web origin을 정의하고 URL·DNS·connection과 구분한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6454"
    title: "The Web Origin Concept"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "origin과 URL authority의 경계를 확인한다."
    displayOrder: 1
---
# Origin과 Scheme·Host·Port

web origin은 일반적으로 **scheme, host, port**의 조합으로 구분한다. host 문자열만 같다고 같은 origin이 되는 것은 아니다. 예를 들어 `http://example.com`과 `https://example.com`은 scheme이 다르고, `https://example.com`과 `https://example.com:8443`은 port가 다르므로 서로 다른 origin이다.

URL에 port가 생략되면 scheme에 대응하는 기본 port를 적용해 비교한다. 그래서 `https://example.com`과 `https://example.com:443`은 origin을 판단할 때 같은 조합으로 취급될 수 있다.

### Origin과 실제 network connection은 같은 값이 아니다

하나의 host name은 DNS에서 여러 IP address로 해석될 수 있고, reverse proxy나 load balancer를 거치면 실제 backend connection의 destination도 달라질 수 있다. 그럼에도 browser가 다루는 origin은 원래 URL의 scheme·host·port를 기준으로 한다.

이 차이는 web security policy를 이해할 때 중요하다. same-origin policy나 CORS는 단순히 `같은 IP인가`를 묻지 않는다. 반대로 같은 IP와 port에서 여러 hostname을 서비스할 수 있으므로 network endpoint가 같다는 이유만으로 같은 origin이라고 할 수도 없다.

따라서 origin은 **web application이 resource의 출처를 구분하는 논리적 기준**이고, DNS address나 TCP connection tuple은 실제 전달을 위한 network state라는 점을 분리해 이해해야 한다.

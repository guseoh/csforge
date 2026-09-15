---
kind: concept
contentKey: network-http.core.http-state-intermediary.cdn-http-intermediary
topicContentKey: network-http.core.http-state-intermediary
slug: cdn-http-intermediary
title: "CDN HTTP Intermediary"
summary: "CDN edge가 reverse proxy와 shared cache로서 origin 앞에 별도 HTTP hop을 만드는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# CDN HTTP Intermediary

CDN은 여러 edge location에 HTTP intermediary를 배치해 client 가까이에서 request를 받고 response를 전달하는 구조다. HTTP 관점에서는 origin 앞의 분산 reverse proxy이자, cache 기능을 사용할 경우 shared cache가 될 수 있다.

edge가 request에 대해 fresh한 cached response를 가지고 있다면 origin까지 새 request를 보내지 않고 client에게 바로 응답할 수 있다. Cache miss나 revalidation이 필요하면 edge가 origin 쪽에 별도의 HTTP request를 만들기 때문에 client→edge와 edge→origin은 서로 다른 connection과 hop이다.

```text
client → CDN edge
          ├─ fresh cache hit → response
          └─ miss / revalidation → origin
```

CDN은 TLS termination, compression, header transformation 같은 기능을 추가할 수 있지만, 이런 기능이 CDN의 모든 배포에서 동일하게 사용되는 것은 아니다. 또한 edge cache는 origin application의 database나 별도 application cache와 같은 state를 공유하는 것이 아니다.

따라서 client가 받은 response가 언제나 현재 origin request에서 만들어졌다고 가정하면 안 된다. **CDN은 origin 앞에서 request를 중계하거나 cached response를 직접 반환할 수 있는 HTTP intermediary**이며, freshness와 validator 같은 구체적인 cache semantics는 HTTP Cache Topic에서 다룬다.

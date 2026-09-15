---
kind: concept
contentKey: network-http.core.http-cache.intermediary-cache
topicContentKey: network-http.core.http-cache
slug: intermediary-cache
title: "Intermediary Cache"
summary: "proxy·CDN shared cache가 client와 origin 사이에서 hit·miss·revalidation을 처리하는 흐름을 설명한다."
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
# Intermediary Cache

Intermediary cache는 client와 origin 사이의 proxy나 CDN이 HTTP response를 저장하고 여러 request에 재사용하는 shared cache다. Request가 들어오면 cache는 사용할 수 있는 stored response가 있는지 확인하고 freshness와 request 조건을 평가한다.

Fresh entry가 있으면 origin까지 request를 보내지 않고 바로 response를 반환할 수 있다. Entry가 없으면 origin에서 response를 가져와 저장할 수 있고, stale entry라면 ETag나 Last-Modified validator를 사용해 revalidation할 수 있다.

```text
request → intermediary cache
             ├─ fresh hit → cached response
             ├─ stale → conditional request → 304 또는 new response
             └─ miss → origin fetch → optional store
```

Browser cache와 CDN edge처럼 여러 cache가 연속으로 존재하면 각 cache는 별도의 stored response와 age를 가질 수 있다. Origin data가 변경되었다고 모든 intermediary cache가 같은 순간 새 representation으로 바뀌는 것은 아니다.

또한 HTTP intermediary cache는 application 내부 cache와 다른 계층이다. 한쪽의 entry를 제거했다고 다른 cache까지 자동으로 제거되는 것은 아니다. **Intermediary cache는 HTTP request path 안에서 response reuse와 revalidation을 담당하는 shared cache**라는 경계를 유지해야 한다.

---
kind: concept
contentKey: network-http.core.http-cache.last-modified
topicContentKey: network-http.core.http-cache
slug: last-modified
title: "Last-Modified"
summary: "selected representation의 수정 시각을 HTTP-date로 제공하는 시간 기반 validator의 의미와 한계를 설명한다."
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
# Last-Modified

`Last-Modified`는 selected representation이 마지막으로 변경되었다고 server가 판단한 시각을 HTTP-date로 제공하는 validator다. Client는 이 값을 다음 request의 `If-Modified-Since`에 넣어 representation이 그 이후 변경되었는지 조건부로 확인할 수 있다.

시간 기반 validator는 이해하기 쉽지만 정밀도와 clock에 한계가 있다. HTTP-date는 초 단위 정밀도를 사용하므로 같은 초 안에서 여러 번 바뀐 representation을 구분하지 못할 수 있고, server clock이 부정확하면 실제 변경 순서를 완전히 표현하지 못할 수도 있다.

그래서 representation version을 더 정확하게 구분할 수 있다면 ETag가 더 적합한 validator가 될 수 있다. `Last-Modified`와 ETag가 함께 제공될 수도 있으며 conditional request에서는 각 header의 우선순위 규칙을 따라야 한다.

```text
Last-Modified: Tue, 15 Sep 2026 09:30:00 GMT
        ↓
If-Modified-Since: Tue, 15 Sep 2026 09:30:00 GMT
```

중요한 점은 Last-Modified가 database row의 `updatedAt`이나 file mtime과 반드시 동일해야 하는 field가 아니라는 것이다. **HTTP representation의 변경 시각을 나타내는 validator**로서 server가 일관된 의미를 제공해야 한다.

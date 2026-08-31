---
kind: concept
contentKey: network-http.core.http-cache.last-modified
topicContentKey: network-http.core.http-cache
slug: last-modified
title: "Last-Modified"
summary: "수정 시각 validator의 정밀도와 clock 경계를 설명한다."
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

Last-Modified는 representation이 마지막으로 변경된 시각을 나타내며 If-Modified-Since와 함께 conditional GET에 사용된다. timestamp 정밀도가 낮거나 clock이 skew되면 짧은 시간 안의 변경을 놓칠 수 있어 ETag보다 약한 validator가 될 수 있다.

server는 실제 representation version과 수정 시각의 의미를 일관되게 유지해야 한다. file mtime을 그대로 public validator로 쓰는 경우 deploy·copy·timezone 변화를 고려한다.

### Backend 연결

DB content updatedAt과 export file mtime을 혼동하지 않는다. 초 단위 반올림으로 두 변경이 같은 시각이 될 수 있으므로 중요한 update에는 ETag를 함께 제공한다.

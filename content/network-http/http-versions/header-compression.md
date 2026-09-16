---
kind: concept
contentKey: network-http.core.http-versions.header-compression
topicContentKey: network-http.core.http-versions
slug: header-compression
title: "Header Compression"
summary: "HTTP/2 HPACK과 HTTP/3 QPACK이 반복 header field를 connection-level state로 압축하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7541"
    title: "HPACK: Header Compression for HTTP/2"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP header compression state와 privacy 경계를 확인한다."
    displayOrder: 1
---
# Header Compression

HTTP request와 response에는 같은 header field name과 value가 반복해서 나타날 수 있다. HTTP/2의 HPACK과 HTTP/3의 QPACK은 이런 반복을 그대로 매번 전송하지 않고 static table, dynamic table과 compact encoding을 사용해 header overhead를 줄인다.

Dynamic table은 connection의 encoder와 decoder가 공유하는 compression state다. Sender가 table entry를 index로 참조하면 receiver도 같은 state를 알고 있어야 원래 header를 복원할 수 있다.

```text
repeated header field
   ↓ dynamic/static table
small index / encoded form
   ↓
receiver reconstructs header
```

HTTP/3의 QPACK은 QUIC의 independent streams 환경에서 header decoding이 불필요하게 전체 request stream을 막지 않도록 HPACK과 다른 synchronization 구조를 사용한다.

Header compression은 encryption이나 authorization mechanism이 아니다. 민감한 값의 indexing은 compression side channel 같은 별도 위험과 연결될 수 있다. **Header compression의 목적은 HTTP semantics를 바꾸는 것이 아니라 반복되는 metadata의 wire overhead를 줄이는 것**이다.

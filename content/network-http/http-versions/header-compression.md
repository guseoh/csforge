---
kind: concept
contentKey: network-http.core.http-versions.header-compression
topicContentKey: network-http.core.http-versions
slug: header-compression
title: "Header Compression"
summary: "반복 header 전송을 줄이는 compression state와 위험 경계를 설명한다."
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

HPACK과 QPACK 같은 방식은 반복 header를 static/dynamic table과 encoding으로 표현해 request overhead를 줄인다. compression context가 connection이나 encoder/decoder state에 묶이므로 단순히 각 header를 독립적으로 압축하는 것이 아니다.

민감한 header와 attacker-controlled 입력이 같은 compression context에 섞이면 길이 관측을 통한 정보 노출 위험이 생길 수 있다. dynamic table size와 indexing policy, protocol version을 함께 설정한다.

### Backend 연결

Authorization·Cookie를 compression과 logging에서 다루는 정책을 분리한다. proxy가 HTTP/2를 종료하고 HTTP/1.1로 연결하면 header framing과 connection semantics가 다시 달라진다.


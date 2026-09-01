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

HPACK(HTTP/2)과 QPACK(HTTP/3)은 자주 반복되는 header field를 static/dynamic table의 index와 literal encoding으로 표현해 header overhead를 줄인다. dynamic table은 connection과 encoder/decoder state에 묶이므로 각 header를 독립적으로 압축하는 방식이 아니며, table context가 맞지 않으면 decoder가 같은 값을 복원할 수 없다. QPACK은 HTTP/3의 별도 encoder/decoder stream과 blocking 제약을 사용한다.

header compression은 TLS encryption이나 authorization이 아니다. 민감한 header와 attacker-controlled 입력이 같은 compression context에 섞이면 response/request length 관측으로 secret을 추론하는 side-channel 위험이 생길 수 있어 dynamic table size, indexing policy와 민감 field 취급을 protocol·deployment별로 정한다.

Backend에서 Authorization·Cookie의 compression, forwarding과 logging 정책을 분리한다. proxy가 HTTP/2를 종료하고 HTTP/1.1로 연결하면 HPACK/QPACK state가 사라지고 header syntax, framing과 connection semantics가 다음 hop에서 다시 달라진다.


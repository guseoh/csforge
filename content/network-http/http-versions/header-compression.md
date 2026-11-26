---
kind: concept
contentKey: network-http.core.http-versions.header-compression
topicContentKey: network-http.core.http-versions
slug: header-compression
title: "HTTP 헤더 압축과 HPACK"
summary: "HTTP/2의 HPACK과 HTTP/3의 QPACK이 반복되는 헤더 필드를 연결 단위 상태로 압축하는 이유를 설명한다."
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
  - url: "https://www.rfc-editor.org/rfc/rfc9204.html#section-2.1.2"
    title: "RFC 9204 §2.1.2: QPACK Blocked Streams"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QPACK의 Required Insert Count·encoder stream·blocked decoding을 확인한다."
    displayOrder: 2
    relationNote: "QPACK은 HPACK과 달리 독립 스트림의 갱신 도착 순서에 따라 일시적으로 block될 수 있는 이유를 읽는다."
---
# HTTP 헤더 압축과 HPACK

같은 서비스에 요청을 반복하면 :method, :authority, content-type처럼 유사한 필드가 계속 등장합니다. HTTP/2의 HPACK은 이러한 필드를 압축해 전송하는 표현 방식입니다. HTTP/3에서는 QUIC의 스트림 구조에 맞춘 QPACK을 사용합니다. 두 방식 모두 헤더의 의미 자체를 변경하지 않습니다.

### 정적 테이블과 동적 테이블

정적 테이블은 프로토콜이 미리 정한 필드 이름 또는 이름·값 조합입니다. 동적 테이블은 인코더가 연결의 압축 상태에 항목을 추가하고 디코더가 이를 동일하게 해석하도록 관리하는 테이블입니다. 송신자와 수신자의 압축 상태는 방향별로 구분됩니다.

예를 들어 처음 등장한 필드를 리터럴로 보내면서 동적 테이블에 등록하면 이후에는 해당 항목을 색인으로 표현할 수 있습니다. 테이블 용량이 제한되므로 이전 항목이 제거될 수 있으며, 모든 필드를 반드시 색인에 등록하는 것은 아닙니다. HPACK은 문자열의 Huffman 코딩도 지원합니다.

### HTTP/3에서 QPACK이 필요한 이유

HTTP/2는 TCP의 순서 있는 전달을 사용합니다. 반면 QUIC의 요청 스트림은 독립적으로 전달될 수 있으므로 다른 스트림에서 아직 전달되지 않은 동적 테이블 항목을 참조하면 헤더를 바로 복원하지 못할 수 있습니다.

QPACK은 별도의 인코더·디코더 스트림과 동적 테이블 참조 정보를 사용하여 이 의존성을 관리합니다. 참조하는 항목이 아직 도착하지 않았다면 해당 필드 섹션은 제한적으로 대기할 수 있습니다. 즉 QPACK은 모든 차단을 없애는 기능이 아니라 압축률과 스트림 차단 사이의 균형을 개선합니다.

### 보안과 압축의 경계

헤더 압축은 암호화나 인증을 제공하지 않습니다. 민감한 값이 압축 상태에 남거나 관측 가능한 크기에 영향을 주는 위험도 있으므로 인코더는 필요한 경우 색인 등록을 피하는 등 별도의 정책을 적용해야 합니다.

관련 명세는 HPACK RFC 7541의 테이블·표현 규칙과 QPACK RFC 9204의 동적 테이블 및 차단 관리입니다.

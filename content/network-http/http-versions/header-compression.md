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
---
# HTTP 헤더 압축과 HPACK

HTTP 요청과 응답에는 같은 헤더 필드 이름과 값이 반복해서 나타날 수 있다. HTTP/2의 HPACK과 HTTP/3의 QPACK은 반복되는 필드를 매번 그대로 보내는 대신 정적·동적 테이블과 압축 표현을 사용해 헤더 전송량을 줄인다.

동적 테이블은 연결 양쪽의 인코더와 디코더가 함께 관리하는 압축 상태다. 송신자가 테이블 항목을 색인으로 참조하면 수신자도 같은 상태를 알아야 원래 헤더를 복원할 수 있다.

```text
반복되는 헤더 필드
   ↓ 정적·동적 테이블
작은 색인 또는 압축 표현
   ↓
수신 측에서 헤더 복원
```

HTTP/3의 QPACK은 QUIC의 독립 스트림 환경에서 헤더를 해독하기 위해 모든 요청 스트림이 불필요하게 막히지 않도록 HPACK과 다른 동기화 구조를 사용한다.

헤더 압축은 암호화나 인가 기능이 아니다. 민감한 값의 색인 등록은 압축 부채널 같은 별도 위험을 만들 수 있다. **헤더 압축의 목적은 HTTP 의미를 바꾸는 것이 아니라 반복되는 메타데이터의 전송 오버헤드를 줄이는 것**이다.

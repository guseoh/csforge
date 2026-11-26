---
kind: concept
contentKey: network-http.core.tls.symmetric-session-key
topicContentKey: network-http.core.tls
slug: symmetric-session-key
title: "대칭 세션 키"
summary: "TLS 1.3이 핸드셰이크에서 만든 비밀 값으로 방향별 트래픽 키를 파생해 애플리케이션 데이터를 효율적으로 보호하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "RFC 8446은 RFC 9846(2026년)에 의해 대체되었다. TLS 1.3 기존 모델의 역사적 설명 근거로 읽는다."
  - url: "https://www.rfc-editor.org/rfc/rfc9846"
    title: "RFC 9846: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현행 TLS 1.3 표준의 핸드셰이크·키·보안 요구사항을 확인한다."
    displayOrder: 2
    relationNote: "RFC 9846 §1.2의 8446 대비 변경 요약과 현재 개념에 해당하는 본문 절을 읽는다."
---
# 대칭 세션 키

TLS는 공개 키 기반 서명과 키 합의 등을 활용해 보호 상태를 구성하지만 실제 애플리케이션 데이터를 매번 공개 키 연산으로 암호화하지 않습니다. TLS 1.3은 키 스케줄로 트래픽 키를 도출하고 AEAD로 기밀성과 무결성을 보호합니다.

```text
키 스케줄
  ├─ 핸드셰이크 트래픽 보호 상태
  ├─ 클라이언트 → 서버 애플리케이션 키
  └─ 서버 → 클라이언트 애플리케이션 키
```

한 연결에 고정된 키 하나만 존재하는 것이 아닙니다. 연결 방향과 단계에 따라 별도 트래픽 비밀 및 키를 사용하며 TLS 레코드 계층에서는 KeyUpdate로 이후 키 상태를 갱신할 수 있습니다. QUIC은 TLS 키 도출을 활용하지만 패킷 보호 및 키 갱신 규칙은 QUIC의 계약을 따릅니다.

### 보호 범위

트래픽 키와 순서 상태는 연결의 암호 문맥에 속합니다. 독립적인 연결에서 같은 보호 상태를 그대로 재사용한다고 가정하지 않습니다.

수신 TLS 종단점이 복호화한 뒤에는 앱 메모리, 로그, 데이터베이스에 평문이 존재할 수 있습니다. 네트워크 보호와 저장 데이터 암호화, 로그 보호는 별도의 책임입니다.

---
kind: concept
contentKey: network-http.core.tls.tls-handshake
topicContentKey: network-http.core.tls
slug: tls-handshake
title: "TLS 핸드셰이크"
summary: "TLS 1.3 핸드셰이크가 통신 조건과 키 재료를 합의하고 서버 인증과 핸드셰이크 무결성을 확인한 뒤 애플리케이션 데이터용 키를 준비하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
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
# TLS 핸드셰이크

새로운 보호 채널을 구성하기 위해 TLS의 통신 조건, 키 재료와 상대 인증 상태를 준비해야 합니다. 핸드셰이크는 이를 양 끝에서 협상하고 검증하는 과정입니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "TLS 핸드셰이크",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "tls-handshake"
}
```

그림은 일반적인 TLS 1.3 인증서 기반 서버 인증 흐름입니다. ClientHello에서 지원 버전, cipher suite, key share 등을 제안하고 ServerHello에서 사용할 조건을 선택합니다. 일반적인 ECDHE 연결에서 양 끝은 공유 비밀을 계산하여 이후 핸드셰이크 메시지를 보호할 키를 도출합니다.

TLS 1.3의 cipher suite는 AEAD 알고리즘 및 해시를 나타냅니다. 키 교환 그룹과 서명 방식은 별도의 협상 조건입니다.

| 메시지 | 역할 |
| --- | --- |
| Certificate | 인증서와 서비스 식별 정보 제공 |
| CertificateVerify | 인증서와 대응하는 개인 키에 대한 제어 증명 |
| Finished | transcript와 파생된 키 상태 검증 |

### 애플리케이션 데이터

핸드셰이크에서 도출한 트래픽 키로 데이터를 보호합니다. 서버와 클라이언트의 전송 가능 시점은 명세 조건에 따르며 그림은 일반적인 클라이언트 요청 흐름을 단순화한 것입니다. PSK, HelloRetryRequest, 클라이언트 인증 및 0-RTT를 포함하면 메시지 흐름이 달라질 수 있습니다.

TLS의 성공은 HTTP 파싱, 인가 또는 DB 트랜잭션 성공을 의미하지 않습니다.

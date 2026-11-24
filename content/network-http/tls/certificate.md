---
kind: concept
contentKey: network-http.core.tls.certificate
topicContentKey: network-http.core.tls
slug: certificate
title: "서버 인증서"
summary: "서버 인증서가 공개 키와 서비스 식별 정보를 서명된 형태로 연결하고, 개인 키 보유 증명과 호스트 이름 검증이 별도 단계인 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
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
# 서버 인증서

TLS 서버 인증서는 공개 키와 서비스 식별 정보 등을 발급자의 서명으로 연결한 데이터입니다. 인증서를 신뢰할 수 있는 발급 경로에서 검증하고 접속하려는 서비스 이름과 일치하는지 확인해야 합니다.

| 확인 대상 | 확인하는 내용 |
| --- | --- |
| 인증 경로·유효성 | 신뢰 기준점까지 유효한 경로인가 |
| Subject Alternative Name(SAN) | 기대하는 DNS 이름 또는 IP 주소와 맞는가 |
| CertificateVerify | 현재 핸드셰이크에서 대응 개인 키의 제어를 증명하는가 |

### 인증서와 개인 키

공개 인증서에는 개인 키가 들어 있지 않습니다. TLS 1.3의 인증서 기반 연결에서 서버는 현재 핸드셰이크 내용에 서명하여 인증 키에 대한 제어를 증명합니다. 인증서만 복사한 것으로는 해당 서버처럼 인증할 수 없습니다.

신뢰받는 CA가 발급한 other.example.net 인증서라도 api.example.com에 접속하는 클라이언트의 기대 서비스 이름과 일치하지 않으면 인증에 실패해야 합니다. 반대로 이름이 맞아도 유효 기간이나 인증 경로에 문제가 있으면 실패할 수 있습니다.

### 실제 데이터 보호

TLS 1.3의 일반적인 흐름에서 키 합의와 키 스케줄을 통해 트래픽 키를 도출하고 실제 데이터를 대칭 AEAD로 보호합니다. 인증서의 공개 키로 모든 HTTP 데이터를 직접 암호화하는 것이 아닙니다.

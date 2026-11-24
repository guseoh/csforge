---
kind: concept
contentKey: network-http.core.tls.pki
topicContentKey: network-http.core.tls
slug: pki
title: "공개 키 기반 구조(PKI)"
summary: "클라이언트가 신뢰 기준점에서 서버 인증서까지 이어지는 인증서 체인을 검증하고, 이 검증과 서비스 이름 검증을 구분하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
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
  - url: "https://www.rfc-editor.org/rfc/rfc5280.html#section-6.1"
    title: "RFC 5280 §6.1: Certificate Path Validation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인증서 경로 검증과 클라이언트 trust anchor의 역할을 확인한다."
    displayOrder: 3
---
# 공개 키 기반 구조(PKI)

PKI는 인증서를 발급하고 검증할 신뢰 체계를 구성합니다. 일반적인 웹 PKI에서는 서버의 최종 인증서가 중간 CA와 연결되고, 클라이언트는 이미 설정한 신뢰 기준점까지 유효한 인증 경로를 검증합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "공개 키 기반 구조(PKI)",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "pki"
}
```

서버가 루트 인증서를 보내기만 하면 신뢰가 생기는 것이 아닙니다. 신뢰 기준점은 클라이언트의 정책과 trust store에서 결정됩니다. 인증 경로를 만들 때 서명, 유효 기간, CA 제약, 키 사용 조건 등을 확인합니다. 폐기 상태의 확인은 실제 검증 정책과 환경에 따라 적용됩니다.

### 경로 검증과 서비스 이름 검증

신뢰받는 CA에서 발급된 other.example.net 인증서라도 api.example.com의 인증서로 받아들여서는 안 됩니다. 경로 검증은 발급 체계의 신뢰에 관한 것이고 서비스 이름 검증은 접속 대상의 일치 여부에 관한 것입니다. 인증 키 제어 증명도 별도로 필요합니다.

서버 배포에서 인증 실패가 발생하면 leaf 인증서와 중간 인증서 구성, 유효 기간, 클라이언트의 trust store, 서비스 이름을 구분하여 확인해야 합니다.

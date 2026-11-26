---
kind: concept
contentKey: network-http.core.tls.key-agreement
topicContentKey: network-http.core.tls
slug: key-agreement
title: "키 합의(Key Agreement)"
summary: "TLS 1.3에서 임시 키를 교환해 공통 비밀을 만들고, 이 과정과 인증서 기반 서버 인증이 서로 다른 책임을 가진다는 점을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
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
# 키 합의(Key Agreement)

키 합의는 공통 비밀을 네트워크로 직접 보내지 않고 양쪽에서 계산하게 하는 방식입니다. TLS 1.3의 일반적인 ECDHE에서는 각자 임시 개인 키를 유지하고 공개 키 공유 정보를 교환합니다.

![ECDHE 키 합의: 공개점 A=aG와 B=bG를 교환하고 양 끝에서 aB=bA=abG라는 동일한 점을 얻는다. 개인 스칼라와 공통 비밀을 전송하지 않는다.](/learning/network-http/tls-key-agreement.svg)

타원곡선 설명용 모델에서 공개 생성점은 G, 개인 스칼라는 a와 b입니다. 공개점 A=aG와 B=bG를 교환한 뒤 각자 aB와 bA를 계산하면 같은 점 abG를 얻습니다. 이는 스칼라 곱이며 단순 덧셈이 아닙니다. 실제 공유 비밀 인코딩은 선택된 그룹의 규칙을 따르며 TLS 키 스케줄의 입력이 됩니다.

### 키 합의와 인증은 다릅니다

ECDHE로 같은 비밀을 만들었다고 상대 신원이 증명되지는 않습니다. 인증서 기반 TLS에서는 인증서 경로와 서비스 이름을 검증하고 CertificateVerify로 인증 키의 제어를 현재 핸드셰이크에 연결합니다. Finished는 파생 키와 핸드셰이크 transcript를 확인합니다.

인증서의 공개 키와 ECDHE 임시 공개 키는 역할이 다릅니다. 임시 개인 키가 안전하게 폐기된 일반적인 ECDHE 연결에서는 장기 인증 개인 키가 나중에 노출되어도 그것만으로 이전 트래픽 키를 복원할 수 없다는 전방향 안전성이 있습니다. 또한 현행 TLS 1.3 명세인 RFC 9846 §4.3.8에 따라 송신 측은 서로 다른 TLS 연결에 같은 키 공유 정보(KeyShare)를 재사용해서는 안 되며(MUST NOT), 다만 기존 RFC 8446 구현과의 상호운용성을 위해 수신 측은 상대의 재사용 자체는 허용해야 합니다(MUST permit). PSK 및 재개 모드 등은 별도의 조건을 갖습니다.

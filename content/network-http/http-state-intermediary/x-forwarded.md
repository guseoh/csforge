---
kind: concept
contentKey: network-http.core.http-state-intermediary.x-forwarded
topicContentKey: network-http.core.http-state-intermediary
slug: x-forwarded
title: "X-Forwarded-* 헤더"
summary: "`X-Forwarded-For`·`X-Forwarded-Proto`·`X-Forwarded-Host`가 프록시 환경에서 원래 요청 정보를 전달하는 관행과 제품별 해석 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7239"
    title: "Forwarded HTTP Extension"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "forwarded identity와 trusted intermediary 경계를 확인한다."
    displayOrder: 1
---
# X-Forwarded-* 헤더

X-Forwarded 계열은 원래 요청의 네트워크 메타데이터를 다음 HTTP 홉으로 전달하는 관행적인 필드입니다. 표준 Forwarded와 역할이 유사하지만 구체적인 목록 구성과 처리 방식은 제품 및 설정에 따라 달라질 수 있습니다.

| 필드 | 주된 목적 |
| --- | --- |
| X-Forwarded-For | 관찰한 클라이언트 또는 이전 홉 주소 전달 |
| X-Forwarded-Proto | 원래 요청의 스킴 전달 |
| X-Forwarded-Host | 원래 요청의 호스트 정보 전달 |

프록시 A와 B를 경유하는 경우 X-Forwarded-For 목록이 늘어날 수 있습니다. 실제 프록시가 기존 값을 제거하는지, 뒤에 추가하는지, 어떤 주소를 관찰하는지 알아야 정확히 해석할 수 있습니다.

### 백엔드에서의 사용

외부 URL 생성, 리다이렉션 및 접속 로그에 전달 헤더를 활용할 수 있습니다. 하지만 외부 사용자가 직접 만든 값도 문법상 유효할 수 있으므로 문법 검증만으로 신뢰하지 않습니다.

허용된 진입 경로와 프록시 재작성 정책, 백엔드의 신뢰 설정을 함께 구성합니다. 전달 메타데이터는 사용자 인증·인가 또는 뒤쪽 TLS 연결 상태를 증명하는 값이 아닙니다.

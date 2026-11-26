---
kind: concept
contentKey: network-http.core.http-state-intermediary.trusted-proxy-boundary
topicContentKey: network-http.core.http-state-intermediary
slug: trusted-proxy-boundary
title: "신뢰하는 프록시 경계"
summary: "백엔드가 전달 메타데이터를 신뢰할 수 있는 프록시를 실제 연결 상대와 경로 정책으로 제한하는 경계를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7239"
    title: "Forwarded HTTP Extension"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "forwarded identity와 trusted intermediary 경계를 확인한다."
    displayOrder: 1
---
# 신뢰하는 프록시 경계

Forwarded와 X-Forwarded 계열 필드는 프록시가 관찰한 주소, 스킴, 호스트 등을 전달합니다. 그러나 헤더 값만으로 작성자가 누구인지 인증할 수 없습니다. 외부 입력을 그대로 신뢰하면 네트워크 메타데이터를 잘못 판단할 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "신뢰하는 프록시 경계",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "trusted-proxy-boundary"
}
```

단일 신뢰 프록시 구성에서는 외부 전달 필드를 제거하거나 정해진 정책으로 재작성하고 백엔드에 실제 관찰값을 전달할 수 있습니다. 백엔드는 연결 상대가 허용된 프록시인지 확인하고 직접 공개 경로도 제한해야 합니다.

### 여러 중개자가 존재하는 경우

각 홉에서 필드를 추가하는 구성은 알려진 신뢰 프록시의 위치와 목록 해석 규칙을 함께 관리해야 합니다. 첫 번째 또는 마지막 IP를 무조건 사용하는 정책은 모든 구성에서 안전하지 않습니다. 형식 오류, IPv6 표현, 중복 헤더 및 직접 요청도 고려합니다.

전달된 IP는 관찰된 네트워크 정보이며 사용자 신원이나 자원 접근 권한을 대신하지 않습니다. 프록시 배치와 전달 정책 변경은 같은 신뢰 계약으로 관리합니다.

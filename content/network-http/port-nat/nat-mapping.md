---
kind: concept
contentKey: network-http.core.port-nat.nat-mapping
topicContentKey: network-http.core.port-nat
slug: nat-mapping
title: "NAT 매핑과 만료"
summary: "상태 기반 NAT 매핑이 만들어지고 트래픽·전송 상태에 따라 유지·만료되며 애플리케이션 세션과 다른 수명을 갖는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "전통적인 IPv4 NAT/NAPT의 주소·포트 변환과 상태 관리 규칙을 확인한다."
    displayOrder: 1
---
# NAT 매핑과 만료

상태 기반 NAT는 내부 종단점과 변환된 외부 종단점의 관계를 보관합니다. 외부 응답이 들어오면 매핑과 필터 정책을 이용해 적절한 내부 목적지를 찾아 전달합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "NAT 매핑과 만료",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "nat-mapping"
}
```

### 매핑의 생명주기

동적 매핑은 트래픽 활동, 전송 프로토콜, 연결 상태 및 장비 정책에 따라 유지되거나 만료됩니다. TCP의 FIN 등 연결 상태는 참고할 수 있지만 UDP에는 같은 종료 신호가 없으므로 비활성 시간 제한이 중요합니다.

매핑이 제거되면 이전 외부 주소·포트로 도착한 패킷을 원래 흐름으로 전달하지 못할 수 있습니다. 같은 포트가 다른 흐름에 재사용되더라도 과거 애플리케이션 세션이 이어지는 것은 아닙니다.

### 장시간 연결

로그인 세션과 WebSocket의 상태, TCP 연결, NAT 매핑은 서로 다른 계층에 존재합니다. 장시간 조용한 연결에서 장애가 반복된다면 NAT·로드 밸런서의 idle timeout, 전송 계층 및 애플리케이션의 연결 유지 정책을 비교합니다. 불필요한 keepalive를 무제한 늘리는 대신 실제 경계에 맞춰 결정합니다.

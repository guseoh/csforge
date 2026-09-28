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
    recommendation: "주소·포트 변환 상태가 반환 패킷을 원래 내부 흐름으로 연결하는 기본 NAT 동작을 확인한다."
    displayOrder: 1
---
# NAT 매핑과 만료

상태 기반 NAT는 내부 주소·포트와 외부에 노출한 변환 주소·포트의 관계를 **매핑 상태**로 보관한다. 내부에서 처음 패킷이 나갈 때 매핑을 만들고, 이후 돌아오는 패킷의 변환 목적지를 조회해 원래 내부 종단점으로 되돌릴 수 있다.

```text
내부
10.0.0.5:40000
      ↓ NAT 매핑 생성
외부에 보이는 값
203.0.113.9:62000
      ↓ 응답 도착
매핑 조회
      ↓
10.0.0.5:40000
```

### NAT 매핑에는 수명이 있다

매핑은 영구 주소 소유권이 아니다. 트래픽 활동과 전송 프로토콜 상태에 따라 일정 시간 유지되고 사용되지 않으면 제거될 수 있다.

TCP는 연결 수립·종료 상태가 있어 NAT가 상태 판단에 참고할 수 있지만, UDP는 TCP 같은 연결 종료 신호가 없으므로 비활성 시간 제한이 특히 중요하다. 구현마다 구체적인 유지 시간과 상태 추적 정책은 다를 수 있다.

### 매핑이 사라지면 늦게 도착한 패킷을 원래 흐름에 연결하지 못할 수 있다

NAT 장치가 매핑을 삭제한 뒤 이전 외부 주소·포트로 패킷이 늦게 도착하면 어느 내부 종단점으로 보내야 하는지 알 수 없을 수 있다. 나중에 같은 외부 포트를 다른 연결에 재사용한다고 과거 애플리케이션 세션이 이어지는 것도 아니다.

### NAT 매핑 수명과 애플리케이션 세션 수명은 다르다

로그인 세션, WebSocket 상태, 데이터베이스 트랜잭션은 애플리케이션·데이터베이스 계층 상태다. NAT 매핑은 네트워크 경계에서 패킷을 되돌리기 위한 변환 상태다.

장시간 조용한 연결이 NAT를 지나야 한다면 애플리케이션·전송 계층의 keepalive 정책과 NAT 비활성 시간 제한을 함께 고려해야 한다. 한 계층의 세션이 살아 있다고 다른 계층 상태도 자동으로 유지되는 것은 아니다.

핵심은 **NAT 매핑이 생성·사용·갱신·만료되는 상태를 가지며, 그 수명은 애플리케이션 세션과 별도로 관리된다는 점**이다.

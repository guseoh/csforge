---
kind: concept
contentKey: network-http.core.layering.decapsulation
topicContentKey: network-http.core.layering
slug: decapsulation
title: "역캡슐화(Decapsulation)"
summary: "수신 경로에서 각 계층이 자신의 헤더와 상태를 해석한 뒤 상위 계층 데이터만 넘기는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 호스트가 계층별로 수신 데이터를 처리하는 책임 경계를 확인한다."
    displayOrder: 1
---
# 역캡슐화(Decapsulation)

역캡슐화는 수신 측에서 **각 계층이 자신에게 해당하는 헤더와 상태를 확인하고, 그 안의 데이터를 상위 계층으로 넘기는 과정**이다. 송신 측에서 계층마다 헤더를 붙이는 캡슐화를 반대 방향으로 따라간다고 생각하면 된다.

```text
링크 프레임
  ↓ 링크 헤더/트레일러 확인
IP 패킷
  ↓ IP 헤더와 목적지 확인
TCP 세그먼트 또는 UDP 데이터그램
  ↓ 포트·연결 상태 처리
애플리케이션에 전달할 데이터
```

각 단계는 자기 계층의 조건만 판단한다. 예를 들어 링크 계층 검증에서 버려진 프레임은 IP 계층까지 올라가지 않고, 목적지 IP가 현재 호스트가 처리할 대상이 아니면 전송 계층으로 넘기지 않는다.

### 라우터와 최종 목적지 호스트의 처리는 다르다

라우터는 프레임을 받은 뒤 IP 패킷을 꺼내 다음 홉을 정하지만 TCP나 HTTP까지 해석해 최종 애플리케이션에 전달하지는 않는다. 다음 링크로 보낼 때는 그 링크에 맞는 새 프레임으로 다시 캡슐화한다.

```text
들어온 프레임
   ↓
IP 패킷 확인 → 다음 홉 선택
   ↓
새 링크의 프레임으로 다시 캡슐화
```

최종 목적지 호스트에서는 IP 위의 TCP·UDP까지 처리해 올바른 포트로 데이터를 넘긴다. TCP라면 IP 패킷 하나가 도착했다고 HTTP 메시지 하나가 완성되는 것이 아니다. TCP가 순서 있는 바이트 스트림을 복원한 뒤 HTTP의 프레이밍 규칙이 요청·응답 경계를 다시 판단한다.

역캡슐화의 핵심은 **각 계층이 자신의 헤더와 상태만 책임지고, 그 단계의 조건을 통과한 데이터만 상위 계층으로 전달한다는 점**이다.

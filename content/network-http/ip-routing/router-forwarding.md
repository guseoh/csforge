---
kind: concept
contentKey: network-http.core.ip-routing.router-forwarding
topicContentKey: network-http.core.ip-routing
slug: router-forwarding
title: "라우터의 패킷 전달"
summary: "라우터가 들어온 프레임에서 IP 패킷을 꺼내 목적지 경로를 찾고 수명 정보를 갱신한 뒤 다음 링크로 전달하는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 라우터의 경로 선택과 다음 홉 전달 규칙을 확인한다."
    displayOrder: 1
---
# 라우터의 패킷 전달

라우터는 한 링크에서 받은 프레임을 그대로 다음 링크로 복사하는 장비가 아니다. 먼저 링크 계층 프레임에서 IP 패킷을 꺼내 **목적지 IP 주소를 기준으로 다음 경로를 결정**하고, 그 다음 링크에 맞는 새 프레임을 만들어 패킷을 전달한다.

```text
들어온 링크 프레임
        ↓
IP 패킷과 목적지 주소 확인
        ↓
라우팅 테이블 조회
        ↓
TTL/Hop Limit 등 수명 처리
        ↓
다음 홉 + 출력 인터페이스 선택
        ↓
다음 링크용 새 프레임 생성
```

### 링크 계층 주소는 홉마다 바뀔 수 있다

라우터를 통과하면 이전 프레임은 끝나고 다음 링크를 위한 새 프레임이 만들어진다. 그래서 출발지·목적지 MAC 주소는 홉마다 달라질 수 있다.

반면 일반적인 IP 전달에서는 패킷의 최종 출발지·목적지 IP 주소를 유지한 채 라우팅한다. NAT나 터널처럼 별도 기능이 개입하면 주소나 패킷 구조가 바뀔 수 있지만, 이를 일반적인 라우팅 자체와 혼동해서는 안 된다.

### 라우터는 기본적으로 HTTP 요청 의미를 판단하지 않는다

IP 라우터의 핵심 책임은 네트워크 계층 패킷 전달이다. `GET`, `POST`, HTTP 상태 코드, 사용자 로그인 여부 같은 애플리케이션 의미를 알아야 패킷을 전달하는 것은 아니다.

HTTP 요청을 읽고 백엔드를 고르는 역방향 프록시·API 게이트웨이는 네트워크 계층 라우터와 다른 역할이다. 이름에 모두 `route`가 등장하더라도 어떤 계층의 정보를 보고 결정하는지 구분해야 한다.

### 한 홉의 전달 성공은 종단 간 성공이 아니다

현재 라우터가 다음 홉으로 패킷을 보냈어도 이후 링크에서 손실되거나 MTU 문제·필터링·잘못된 반환 경로 때문에 최종 통신이 실패할 수 있다. 장애 분석에서는 각 홉의 라우팅과 종단 간 전송 상태를 함께 봐야 한다.

핵심은 **라우터가 목적지 IP로 경로를 선택하고 패킷 수명을 처리한 뒤, 다음 링크에 맞는 새 프레임으로 패킷을 넘긴다는 점**이다.

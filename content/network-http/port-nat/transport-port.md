---
kind: concept
contentKey: network-http.core.port-nat.transport-port
topicContentKey: network-http.core.port-nat
slug: transport-port
title: "전송 계층 포트"
summary: "하나의 호스트 안에서 여러 TCP·UDP 통신 종단점을 포트 번호로 구분하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6335"
    title: "Service Name and Transport Protocol Port Number Registry"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "전송 프로토콜의 서비스 이름과 포트 번호 공간을 확인한다."
    displayOrder: 1
---
# 전송 계층 포트

포트(port)는 **하나의 호스트 안에서 어느 전송 계층 종단점으로 데이터를 전달할지 구분하는 번호**다. IP 주소가 네트워크에서 호스트·인터페이스 쪽으로 패킷을 전달하는 데 쓰인다면, 포트 번호는 그 호스트 안에서 TCP·UDP 통신 대상을 더 세분화한다.

```text
IP 주소 198.51.100.20
   ├─ TCP 443  → HTTPS 서버
   ├─ TCP 22   → SSH 서버
   └─ UDP 53   → DNS 서버
```

TCP와 UDP는 서로 다른 전송 프로토콜이므로 같은 숫자의 포트를 각각 독립적으로 사용할 수 있다. TCP 53과 UDP 53은 포트 번호는 같지만 같은 종단점이 아니다.

### 서버 포트와 클라이언트 임시 포트

서버는 보통 잘 알려진 포트나 설정된 포트에 소켓을 바인딩하고 연결·데이터를 기다린다. 클라이언트는 외부 서버에 연결할 때 운영체제가 선택한 임시 로컬 포트(ephemeral port)를 사용하는 경우가 많다.

```text
클라이언트 192.0.2.10:53124
              ↓ TCP 연결
서버       198.51.100.20:443
```

서버가 TCP 443 하나에서 연결을 기다린다고 클라이언트 한 명만 받을 수 있는 것은 아니다. 연결마다 상대 IP·포트 조합이 다르기 때문에 운영체제는 여러 연결을 별도 상태로 관리할 수 있다.

### 포트 번호는 프로세스 ID가 아니다

포트는 운영체제 프로세스의 영구 신원이 아니다. 실제로 어느 프로세스가 해당 포트의 소켓을 소유하는지는 현재 운영체제 상태에 달려 있고, 프로세스가 종료된 뒤 다른 프로세스가 같은 포트를 사용할 수도 있다.

또한 `443이면 항상 HTTPS`처럼 포트 번호만 보고 애플리케이션 프로토콜을 확정할 수도 없다. 관례와 등록 정보는 중요한 힌트지만 실제 프로토콜은 통신 당사자의 설정이 결정한다.

핵심은 **포트가 IP 주소보다 한 단계 안쪽에서 TCP·UDP 통신 종단점을 구분하는 전송 계층 식별자라는 점**이다.

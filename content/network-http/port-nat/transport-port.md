---
kind: concept
contentKey: network-http.core.port-nat.transport-port
topicContentKey: network-http.core.port-nat
slug: transport-port
title: "Transport Port"
summary: "한 host의 여러 transport endpoint를 port가 구분하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6335"
    title: "Service Name and Transport Protocol Port Number Registry"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport port와 endpoint 식별 규칙을 확인한다."
    displayOrder: 1
---
# Transport Port

Port는 transport layer에서 한 host 안의 여러 communication endpoint를 구분하기 위한 숫자다. IP address가 destination host/interface를 찾는 데 쓰인다면 port는 그 host 안에서 **어느 transport endpoint로 data를 전달할지** 구분하는 데 사용된다.

TCP와 UDP는 서로 다른 transport protocol이므로 같은 port number를 각각 독립적으로 사용할 수 있다. 예를 들어 TCP 53과 UDP 53은 숫자는 같지만 서로 다른 protocol endpoint다.

### Server port와 client ephemeral port

Server는 보통 미리 정한 port에 bind/listen하고 client는 connection을 만들 때 temporary local port를 선택한다. 이 client-side port를 흔히 ephemeral port라고 부른다.

```text
client 192.0.2.10:53124
          ↓
server 198.51.100.20:443
```

Server port 443 하나가 client 하나만 받을 수 있다는 뜻은 아니다. TCP에서는 각 connection이 local/remote address와 port 조합으로 구분되므로 하나의 listening port가 여러 client connection을 동시에 수용할 수 있다.

### Port는 process ID가 아니다

Port 자체가 특정 process의 영구 identity는 아니다. Socket을 어떤 process가 소유하는지는 OS state에 달려 있고, process가 종료한 뒤 같은 port를 다른 process가 사용할 수도 있다.

Transport port의 핵심은 **host 내부 transport endpoint를 demultiplex하는 식별자이며, IP address와 함께 communication endpoint를 구성한다는 것**이다.

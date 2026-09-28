---
kind: concept
contentKey: network-http.core.layering.link-network-transport-application
topicContentKey: network-http.core.layering
slug: link-network-transport-application
title: "링크·네트워크·전송·애플리케이션 계층"
summary: "링크·네트워크·전송·애플리케이션 계층이 각각 어느 범위의 전달과 상태를 책임지는지 비교한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 호스트의 계층별 책임과 상하위 계층 사이의 경계를 확인한다."
    displayOrder: 1
---
# 링크·네트워크·전송·애플리케이션 계층

인터넷 통신을 단순화하면 링크, 네트워크, 전송, 애플리케이션 계층이 서로 다른 범위의 전달을 맡는다. 중요한 것은 계층 이름을 외우는 것이 아니라 **각 계층이 어떤 정보를 보고 어디까지 책임지는지** 이해하는 것이다.

| 계층 | 주된 책임 | 대표 정보 |
| --- | --- | --- |
| 링크 | 하나의 로컬 링크에서 다음 장비까지 프레임 전달 | MAC 주소 등 링크 주소 |
| 네트워크 | 여러 네트워크를 지나 목적지까지 IP 패킷 전달 | IP 주소, 라우팅 정보 |
| 전송 | 호스트 안의 통신 종단점 구분과 전달 특성 제공 | 포트, 연결·시퀀스 상태 |
| 애플리케이션 | 전달된 바이트를 프로토콜 메시지와 의미로 해석 | HTTP 메서드·헤더, DNS 질의 유형 등 |

### 링크 계층은 현재 홉의 전달을 다룬다

이더넷 같은 링크 계층은 현재 네트워크 구간에서 다음 장비까지 프레임을 전달한다. 라우터를 지나 다른 링크로 넘어가면 MAC 주소와 프레임은 다음 구간에 맞게 다시 만들어질 수 있다.

### IP는 목적지까지의 최선형 전달을 제공한다

IP는 목적지 주소를 기준으로 여러 네트워크 사이에서 패킷을 전달하지만, 패킷이 반드시 도착하거나 순서대로 도착한다고 보장하지 않는다. 손실·중복·순서 변경이 발생할 수 있다는 전제에서 상위 계층이 필요한 보장을 추가한다.

### TCP와 UDP도 제공하는 계약이 다르다

TCP는 순서 있는 바이트 스트림과 손실 복구·흐름 제어 등을 제공하지만 애플리케이션 메시지 경계는 보존하지 않는다. UDP는 데이터그램 경계를 보존하지만 전달 성공·순서·중복 제거를 기본 보장하지 않는다.

### 애플리케이션 계층은 바이트에 의미를 부여한다

HTTP는 바이트를 메서드·헤더·상태 코드·본문으로 해석하고, DNS는 질의와 레코드 응답으로 해석한다. 따라서 TCP 연결이 성공했다는 사실만으로 HTTP 요청이 유효하거나 업무 처리가 성공했다고 볼 수 없다.

핵심은 **각 계층의 성공 조건은 그 계층이 소유한 계약 안에서만 해석해야 하며, 하위 계층의 성공을 상위 계층의 성공으로 확대해서는 안 된다는 점**이다.

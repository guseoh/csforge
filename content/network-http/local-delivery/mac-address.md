---
kind: concept
contentKey: network-http.core.local-delivery.mac-address
topicContentKey: network-http.core.local-delivery
slug: mac-address
title: "MAC 주소"
summary: "같은 로컬 링크에서 프레임을 전달할 때 사용하는 MAC 주소의 역할과 IP 주소와의 책임 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "로컬 링크에서 IPv4 주소와 이더넷 주소를 대응시키는 ARP 동작을 확인한다."
    displayOrder: 1
---
# MAC 주소

이더넷에서 MAC 주소는 현재 링크의 프레임 전달을 위해 사용하는 주소입니다. 스위치는 목적지 MAC 주소와 자신의 전달 테이블을 이용해 출력 포트를 결정합니다.

원격 서버에 접속하는 경우 첫 프레임의 목적지 MAC은 보통 게이트웨이의 MAC입니다. 반면 IP 헤더에는 최종 서버의 주소가 들어 있습니다.

```text
첫 링크: 클라이언트 MAC → 게이트웨이 MAC
다음 링크: 라우터 출력 MAC → 다음 홉 MAC
```

라우터는 다음 링크에 맞는 새 프레임을 만듭니다. 따라서 일반적인 IP 전달에서는 최종 IP 목적지가 유지되더라도 링크 주소는 홉마다 바뀔 수 있습니다.

### 영구 신원으로 사용할 수 없습니다

MAC 주소는 가상 인터페이스, 관리자 설정, 주소 무작위화 등으로 변경될 수 있습니다. 현재 링크의 주소를 사용자 인증이나 서버 신원 확인의 근거로 사용하면 안 됩니다. 브로드캐스트나 멀티캐스트 주소는 단일 인터페이스를 가리키는 유니캐스트 주소와도 구분합니다.

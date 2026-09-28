---
kind: concept
contentKey: network-http.core.local-delivery.switch-forwarding
topicContentKey: network-http.core.local-delivery
slug: switch-forwarding
title: "스위치의 프레임 전달"
summary: "이더넷 스위치가 출발지 MAC을 학습하고 목적지 MAC에 따라 출력 포트를 선택하는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "ARP로 얻은 이더넷 주소가 같은 로컬 링크의 프레임 전달에 사용되는 맥락을 확인한다."
    displayOrder: 1
---
# 스위치의 프레임 전달

이더넷 스위치는 같은 링크 계층 영역 안에서 **목적지 MAC 주소를 어느 포트로 보내야 하는지** 판단한다. 이를 위해 들어온 프레임의 출발지 MAC 주소와 들어온 포트를 관찰해 MAC 주소 테이블을 학습한다.

예를 들어 포트 1에서 출발지 MAC `A`의 프레임이 들어오면 스위치는 `A는 포트 1 뒤에 있다`고 학습할 수 있다. 이후 목적지 MAC이 `A`인 프레임을 받으면 모든 포트로 보낼 필요 없이 학습한 포트로 전달할 수 있다.

```text
포트 1에서 프레임 수신
출발지 MAC = A
        ↓
MAC 주소 테이블: A → 포트 1

목적지 MAC = B
        ↓
B를 알고 있음 → 해당 포트로 전달
B를 모름     → 같은 전달 영역 안에서 필요한 포트로 flood
```

### 목적지를 모른다고 프레임을 버리는 것만이 답은 아니다

목적지 MAC이 테이블에 아직 없으면 스위치는 알 수 없는 유니캐스트 프레임을 같은 전달 영역의 여러 포트로 flood할 수 있다. 브로드캐스트 프레임도 해당 브로드캐스트 도메인 안에서 여러 포트로 전달된다.

MAC 주소 테이블 항목은 영구적인 진실이 아니다. 장비 이동이나 토폴로지 변화가 생길 수 있으므로 일정 시간이 지나면 만료되고 실제 트래픽을 통해 다시 학습될 수 있다.

### 스위치와 라우터는 보는 주소와 전달 범위가 다르다

스위치는 같은 링크 계층 전달 영역 안에서 MAC 주소를 기준으로 프레임을 전달한다. 라우터는 목적지 IP 주소와 라우팅 테이블을 보고 다른 네트워크로 패킷을 전달한다.

VLAN을 사용하면 하나의 물리 스위치에서도 링크 계층 전달 영역을 논리적으로 나눌 수 있다. 따라서 `같은 물리 스위치에 연결됨 = 모두 같은 브로드캐스트 도메인`이라고 단정할 수 없다.

핵심은 **스위치가 들어오는 프레임의 출발지 MAC을 학습하고, 목적지 MAC과 현재 테이블 상태를 바탕으로 로컬 프레임의 출력 포트를 선택한다는 점**이다.

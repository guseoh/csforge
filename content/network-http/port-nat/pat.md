---
kind: concept
contentKey: network-http.core.port-nat.pat
topicContentKey: network-http.core.port-nat
slug: pat
title: "주소·포트 변환(PAT)"
summary: "IP 주소와 전송 포트를 함께 변환해 여러 내부 연결이 하나의 공인 IP를 공유하는 방식과 포트 자원 한계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAPT가 주소와 TCP·UDP 포트를 함께 변환해 여러 내부 세션을 구분하는 방식을 확인한다."
    displayOrder: 1
---
# 주소·포트 변환(PAT)

PAT(Port Address Translation)는 IP 주소뿐 아니라 **TCP·UDP 포트도 함께 변환**해 여러 내부 통신 흐름이 하나의 공인 IP를 공유할 수 있게 한다. 흔히 NAPT라고도 부른다.

```text
내부
10.0.0.5:40000 ──┐
10.0.0.6:40000 ──┼─> 공인 203.0.113.9
10.0.0.7:51000 ──┘       :62001, :62002, :62003 ...
```

두 내부 호스트가 같은 출발지 포트 `40000`을 사용해도 NAT 장치는 외부 쪽에 서로 다른 변환 포트를 할당해 응답을 어느 내부 흐름으로 돌려보낼지 구분할 수 있다.

### 포트 공간도 유한한 자원이다

공인 IP 하나에서 사용할 수 있는 TCP·UDP 포트 번호 공간은 유한하다. 매우 많은 동시 연결이 생기면 사용할 수 있는 주소·포트 조합이 부족해져 새 연결 생성이 실패하거나 추가 공인 주소가 필요할 수 있다.

따라서 PAT가 `공인 IP 하나로 무제한 연결 가능`을 의미하지는 않는다. 동시 연결 수, 매핑 유지 시간, 대상별 매핑 정책이 실제 수용량에 영향을 준다.

### TCP와 UDP의 같은 숫자 포트는 서로 다른 공간이다

TCP와 UDP는 서로 다른 전송 프로토콜이므로 `203.0.113.9:62001/TCP`와 `203.0.113.9:62001/UDP`는 같은 매핑이라고 단정할 수 없다. 실제 포트 할당·재사용 정책은 NAT 구현에 따라 달라질 수 있다.

핵심은 **PAT가 공인 IP 하나를 여러 내부 흐름이 공유하도록 주소와 전송 포트를 함께 변환하고, 그만큼 변환 포트라는 유한한 상태 자원을 사용한다는 점**이다.

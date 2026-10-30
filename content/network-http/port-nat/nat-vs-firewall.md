---
kind: concept
contentKey: network-http.core.port-nat.nat-vs-firewall
topicContentKey: network-http.core.port-nat
slug: nat-vs-firewall
title: "NAT와 방화벽의 차이"
summary: "NAT의 주소·포트 변환과 방화벽의 명시적 트래픽 허용·차단 정책을 분리해 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "전통적인 IPv4 NAT/NAPT의 주소·포트 변환과 상태 관리 규칙을 확인한다."
    displayOrder: 1
---
# NAT와 방화벽의 차이

NAT와 방화벽은 가정용 공유기나 클라우드 네트워크 장비에서 함께 동작하는 경우가 많아 같은 기능처럼 보이기 쉽다. 하지만 **NAT는 주소·포트를 변환하고, 방화벽은 트래픽을 허용할지 차단할지 판단한다.**

```text
NAT      : 이 패킷의 주소·포트를 무엇으로 바꿀까?
방화벽   : 이 패킷을 통과시켜도 되는가?
라우팅   : 이 패킷을 어느 다음 홉으로 보낼까?
```

세 기능이 한 장비에 있어도 판단 기준과 상태는 다르다.

### NAT 매핑이 있다고 통신이 허용된 것은 아니다

NAT 매핑이 있어 응답 패킷을 어느 내부 종단점으로 돌려보낼 수 있더라도 방화벽 규칙이 트래픽을 거부하면 전달되지 않을 수 있다.

반대로 방화벽이 허용해도 라우팅이 없거나 필요한 NAT 목적지 매핑이 없거나 서버 리스너가 없다면 연결은 성립하지 않는다.

### NAT가 보안 장치처럼 보이는 이유

일반적인 외부로 나가는(outbound) NAT에서는 내부에서 먼저 만든 매핑이 없으면 외부에서 시작한 패킷의 내부 목적지를 알 수 없어 전달하지 못할 수 있다. 결과만 보면 외부 접속을 막은 것처럼 보인다.

하지만 정적 NAT·포트 포워딩을 추가하면 내부 목적지가 정의되어 도달 가능성이 달라진다. 이때 실제 접근을 허용할지는 방화벽 정책이 별도로 판단해야 한다.

따라서 `NAT 뒤에 있으니 안전하다`를 보안 정책으로 삼으면 안 된다. **변환 관계와 허용 정책을 명시적으로 분리**해야 구성 변경 때 예상치 못한 노출을 줄일 수 있다.

핵심은 **NAT는 네트워크 주소·포트의 변환 관계를, 방화벽은 트래픽의 명시적 허용·차단 정책을 담당하며 둘은 서로 대체하지 않는다는 점**이다.

---
kind: concept
contentKey: network-http.core.request-journey.dns-to-route
topicContentKey: network-http.core.request-journey
slug: dns-to-route
title: "DNS 조회에서 라우팅까지"
summary: "호스트 이름이 IP 주소 후보로 해석되고, 선택한 목적지 주소가 로컬 라우팅 테이블의 출력 인터페이스와 다음 홉 결정으로 이어지는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# DNS 조회에서 라우팅까지

URL에 `api.example.com` 같은 호스트 이름이 들어 있다면 실제 IP 패킷을 보내기 전에 **어느 IP 주소로 연결할지** 알아야 한다. DNS는 이 호스트 이름을 A·AAAA 레코드 같은 IP 주소 후보로 해석한다.

```text
api.example.com
      ↓ DNS
203.0.113.10
2001:db8::10
```

DNS가 여러 주소를 반환하면 클라이언트와 운영체제는 주소 패밀리, 연결 정책, 실제 연결 성공 여부 등을 고려해 사용할 목적지를 선택할 수 있다. 따라서 `DNS 응답 하나 = 항상 실제 연결 주소 하나`라고 단순화하면 안 된다.

### IP 주소를 알게 된 다음에는 라우팅이 필요하다

목적지 IP 주소가 정해지면 운영체제는 로컬 라우팅 테이블을 조회해 그 주소로 패킷을 어느 방향으로 내보낼지 결정한다.

```text
목적지 IP 주소
      ↓
라우팅 테이블 조회
      ↓
출력 인터페이스 + 다음 홉
      ↓
로컬 링크 전달
```

라우팅 테이블은 목적지와 일치하는 prefix 중 적절한 경로를 선택하고 출력 인터페이스와 다음 홉을 결정한다. 목적지가 같은 로컬 네트워크에 있으면 직접 전달할 수 있고, 다른 네트워크라면 기본 게이트웨이 같은 라우터가 다음 홉이 될 수 있다.

이더넷 환경이라면 IPv4에서는 ARP, IPv6에서는 NDP를 이용해 **현재 링크에서 그 다음 홉으로 프레임을 보낼 링크 계층 주소**를 추가로 알아내야 할 수 있다.

### DNS 성공과 네트워크 도달 가능성은 다른 상태다

DNS가 올바른 주소를 반환했다고 해서 그 주소까지 실제로 패킷을 보낼 수 있다는 뜻은 아니다.

```text
DNS 성공
203.0.113.10을 얻음
      ↓
하지만 일치하는 route 없음
      ↓
연결 시작 불가
```

반대로 라우팅 자체는 정상이어도 DNS가 잘못된 주소를 알려 주면 의도한 서비스가 아닌 다른 목적지로 연결을 시도할 수 있다. 장애를 볼 때 `이름을 주소로 바꿨는가`와 `그 주소까지 경로가 있는가`를 분리해야 하는 이유다.

### 매 HTTP 요청마다 DNS와 라우팅을 처음부터 반복하는 것은 아니다

DNS 캐시가 남아 있거나 이미 열린 TCP·QUIC 연결을 재사용한다면 새 요청마다 DNS부터 다시 수행하지 않을 수 있다. 라우팅 상태 역시 운영체제가 연결과 패킷 전송 과정에서 사용하지만, 애플리케이션 입장에서 매 요청마다 똑같은 눈에 보이는 순서를 반복한다고 볼 수는 없다.

핵심은 **DNS가 호스트 이름을 IP 주소 후보로 바꾸고, 라우팅이 선택된 IP 주소를 어느 인터페이스와 다음 홉으로 보낼지 결정한다는 책임의 연결 관계**다.

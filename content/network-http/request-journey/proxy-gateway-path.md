---
kind: concept
contentKey: network-http.core.request-journey.proxy-gateway-path
topicContentKey: network-http.core.request-journey
slug: proxy-gateway-path
title: "Proxy와 Gateway 경유"
summary: "정방향 프록시·리버스 프록시·게이트웨이가 클라이언트와 원본 서버 사이에 별도의 HTTP 홉과 연결을 만드는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Proxy와 Gateway 경유

HTTP 프록시나 게이트웨이는 클라이언트가 보낸 요청을 받아 직접 처리하거나 **다음 HTTP 홉으로 새로운 요청을 전달하는 중개자**가 될 수 있다. 이때 `클라이언트 → 중개자` 연결과 `중개자 → 다음 서버` 연결은 서로 다른 네트워크·전송 상태를 가질 수 있다.

```text
클라이언트 ── 연결 A ──> 리버스 프록시 ── 연결 B ──> 백엔드
```

두 연결은 상대 IP, 포트, TLS 인증서, 타임아웃, 연결 재사용 상태가 서로 다를 수 있다. 따라서 사용자가 하나의 HTTP 요청을 보냈다고 해서 모든 구간이 하나의 소켓이나 하나의 TLS 연결로 이어지는 것은 아니다.

### 정방향 프록시와 리버스 프록시는 누구 쪽을 대신하는지가 다르다

정방향 프록시(forward proxy)는 주로 클라이언트 쪽에서 외부 서버로 나가는 요청을 대신 전달한다. 회사 네트워크의 인터넷 접근 제어나 클라이언트 익명화 같은 경우가 예다.

리버스 프록시(reverse proxy)는 서버 쪽 경계에서 외부 요청을 받아 내부의 적절한 백엔드로 전달한다. TLS 종료, 로드 밸런싱, 캐싱, 인증 전처리 같은 역할을 함께 맡을 수 있다.

```text
정방향 프록시
Client → Forward Proxy → 여러 외부 서버

리버스 프록시
여러 Client → Reverse Proxy → 내부 백엔드
```

`gateway`라는 이름은 제품마다 범위가 넓지만, HTTP 관점에서는 프로토콜 변환·라우팅·정책 적용 같은 경계 기능을 수행하며 다음 시스템으로 요청을 전달하는 구성에 자주 사용된다. 이름 자체보다 **어느 연결을 종료하고, 어떤 요청을 새로 만들며, 어떤 정책을 적용하는지**를 보는 것이 중요하다.

### 중개자는 투명한 전선이 아니다

프록시는 요청과 응답을 그대로 복사만 하는 장비가 아니다. 설정과 HTTP 규칙에 따라 다음과 같은 동작을 할 수 있다.

- `Host`·`:authority`를 기준으로 백엔드 선택
- TLS 종료와 백엔드 TLS 재수립
- 헤더 필드 추가·삭제·정규화
- 요청·응답 본문 버퍼링
- 캐시 응답 반환
- 백엔드 재시도
- 자체 오류 응답 생성

따라서 다음 두 요청은 같은 사용자 동작에서 비롯됐어도 네트워크상 완전히 같은 메시지일 필요가 없다.

```text
Client ── 요청 A ──> Reverse Proxy
                       │
                       └── 요청 B ──> Backend
```

### 장애도 홉별로 나눠서 봐야 한다

클라이언트와 프록시 사이 연결이 정상이어도 프록시와 백엔드 연결에서 타임아웃이 날 수 있다. 클라이언트가 `502 Bad Gateway`를 받았다면 원본 애플리케이션이 직접 그 응답을 만든 것이 아니라 중개자가 백엔드 통신 실패를 해석해 응답했을 가능성도 있다.

따라서 다음 정보를 함께 연결해야 한다.

```text
클라이언트 요청 ID
   ↓
프록시 access/error log
   ↓
선택된 backend와 upstream 연결 상태
   ↓
백엔드 애플리케이션 로그
```

핵심은 **프록시와 게이트웨이가 클라이언트와 서버 사이에서 별도의 HTTP 참가자이자 연결 경계를 만들 수 있으므로, 요청·TLS·타임아웃·오류가 어느 홉에서 발생했는지 분리해서 봐야 한다는 점**이다.

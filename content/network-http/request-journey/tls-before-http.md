---
kind: concept
contentKey: network-http.core.request-journey.tls-before-http
topicContentKey: network-http.core.request-journey
slug: tls-before-http
title: "HTTP 전 TLS 연결"
summary: "새 HTTPS 통신에서 보호된 HTTP 데이터를 보내기 전에 TLS 보안 상태가 준비되는 일반 흐름과 연결 재사용·0-RTT 같은 예외를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# HTTP 전 TLS 연결

`https` URL은 HTTP 데이터를 보호된 채널로 전달한다는 의미를 포함한다. 새로운 HTTPS 연결을 만드는 일반적인 흐름에서는 **HTTP 요청을 보내기 전에 상대를 인증하고 암호 키 상태를 준비**해야 한다.

HTTP/1.1이나 HTTP/2를 TCP 위에서 사용할 때의 대표적인 흐름은 다음과 같다.

```text
DNS 조회·라우팅
      ↓
TCP 연결 수립
      ↓
TLS 핸드셰이크
      ↓
보호된 HTTP 요청·응답
```

TCP 연결이 성립했다고 HTTP 요청을 바로 평문으로 보내는 것은 아니다. HTTPS에서는 그 위에서 TLS 핸드셰이크를 수행해 서버 인증과 키 합의를 끝내고, 이후 HTTP 바이트를 TLS가 보호하는 애플리케이션 데이터로 전달한다.

### HTTP/3에서는 QUIC과 TLS의 관계가 더 밀접하다

HTTP/3는 TCP가 아니라 QUIC 위에서 동작한다. QUIC은 연결 수립 과정에 TLS 1.3 핸드셰이크를 통합해 키와 보안 상태를 만든다. 따라서 HTTP/1.1·2처럼 `TCP 연결 완료 → 그 위에서 별도의 TLS 레코드 계층 연결`이라는 모양을 그대로 적용하면 안 된다.

```text
HTTP/1.1·HTTP/2 over TCP
TCP 연결 → TLS 1.3 → HTTP

HTTP/3
QUIC 연결 수립 + TLS 1.3 키 협상
            ↓
        HTTP/3 스트림
```

중요한 공통점은 구현 모양이 아니라 **보호된 HTTP 데이터를 보내기 위해 필요한 암호 상태를 먼저 준비한다는 점**이다.

### 기존 연결을 재사용하면 새 요청마다 TLS 핸드셰이크를 하지 않는다

이미 사용 가능한 TLS·QUIC 연결이 있다면 다음 HTTP 요청이 그 연결을 재사용할 수 있다. 따라서 실제 서비스에서 요청 하나마다 `DNS → TCP → TLS → HTTP`가 모두 반복되는 것은 아니다.

```text
첫 요청
연결 수립 + TLS 핸드셰이크 + HTTP

다음 요청
기존 보호 연결 재사용 → HTTP
```

연결 재사용은 지연과 핸드셰이크 비용을 줄이는 중요한 이유 중 하나다.

### TLS 1.3의 0-RTT는 일반 흐름의 예외다

TLS 1.3 세션 재개에서는 조건에 따라 0-RTT 조기 데이터(early data)를 사용해 핸드셰이크가 최종 완료되기 전에 애플리케이션 데이터를 보낼 수 있다. 하지만 조기 데이터(early data)에는 **재전송 공격(replay)**과 관련된 별도 위험이 있으므로 일반적인 1-RTT 요청과 같은 안전성을 가정해서는 안 된다.

특히 결제·주문 생성처럼 반복 실행이 위험한 요청을 0-RTT로 허용하려면 서버와 애플리케이션의 재실행 안전성까지 함께 검토해야 한다.

핵심은 **새로운 HTTPS 보호 채널이 필요한 일반적인 경우 TLS가 상대 인증과 키 상태를 준비한 뒤 HTTP 데이터를 보호하며, 연결 재사용과 0-RTT 같은 최적화에서는 실제 순서가 달라질 수 있다는 점**이다.

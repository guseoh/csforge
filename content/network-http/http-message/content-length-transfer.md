---
kind: concept
contentKey: network-http.core.http-message.content-length-transfer
topicContentKey: network-http.core.http-message
slug: content-length-transfer
title: "Content-Length와 전송 프레이밍"
summary: "HTTP/1.1에서 Content-Length와 Transfer-Encoding이 메시지 본문 경계를 결정하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 메시지 프레이밍과 본문 길이 결정 규칙을 확인한다."
    displayOrder: 1
---
# Content-Length와 전송 프레이밍

HTTP/1.1은 하나의 연결에서 여러 메시지를 연속해서 주고받을 수 있다. 따라서 수신자는 **현재 메시지의 본문이 어디에서 끝나고 다음 메시지가 어디에서 시작하는지** 정확히 알아야 한다.

`Content-Length`는 적용 가능한 메시지에서 콘텐츠의 octet 수를 알려 본문 경계를 결정하는 데 사용된다. 예를 들어 `Content-Length: 120`이면 수신자는 본문에서 120 octet을 읽어야 한다. 이 값은 JSON 필드 수나 TCP 세그먼트 수가 아니다.

| 프레이밍 방식 | 적용 범위 | 본문 끝을 판단하는 방법 |
| --- | --- | --- |
| `Content-Length: 120` | HTTP/1.1에서 길이를 알고 있는 콘텐츠 | 지정한 120 octet을 읽음 |
| `Transfer-Encoding: chunked` | HTTP/1.1에서 transfer coding으로 전송 | 각 chunk를 읽고 마지막 zero-size chunk에서 종료 |
| DATA frame과 stream 종료 | HTTP/2·HTTP/3 | 버전별 프레임·스트림 종료 규칙으로 판단 |

### Transfer-Encoding은 HTTP/1.1 전송 프레이밍 규칙이다

HTTP/1.1에서는 `Transfer-Encoding: chunked`를 사용해 콘텐츠를 여러 chunk로 나누고 마지막 chunk로 끝을 표시할 수 있다. 이것은 representation 자체의 압축·형식을 설명하는 `Content-Encoding`과 역할이 다르다.

`Content-Length`와 `Transfer-Encoding`이 함께 나타나거나 여러 길이 값이 충돌하는 메시지는 특히 조심해야 한다. RFC 9112의 메시지 길이 결정 규칙을 일관되게 적용해야 하며, 정상적인 송신자는 모호한 조합을 만들지 않아야 한다.

### 프록시와 원본 서버가 경계를 다르게 읽으면 보안 문제가 된다

앞단 프록시가 요청이 끝났다고 판단한 위치를 원본 서버가 여전히 본문으로 보거나, 반대로 원본 서버가 남은 바이트를 다음 요청의 시작으로 해석하면 하나의 바이트열을 두 홉이 서로 다른 HTTP 메시지로 나누게 된다. 이 parser disagreement가 request smuggling의 핵심 원리다.

HTTP/2와 HTTP/3은 HTTP/1.1의 chunked transfer coding을 그대로 사용하지 않고 자체 프레임·스트림 구조를 사용한다. 따라서 `Content-Length + chunked`만을 HTTP 전체의 유일한 프레이밍 모델로 일반화하면 안 된다.

핵심은 **콘텐츠가 무엇을 의미하는가**와 **이번 HTTP 메시지의 바이트가 어디까지인가**를 분리하는 것이다. `Content-Type`은 전자를 설명하고, HTTP 버전별 프레이밍은 후자를 결정한다.

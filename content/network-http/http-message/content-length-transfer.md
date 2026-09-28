---
kind: concept
contentKey: network-http.core.http-message.content-length-transfer
topicContentKey: network-http.core.http-message
slug: content-length-transfer
title: "Content-Length와 전송 프레이밍"
summary: "HTTP/1.1에서 Content-Length와 Transfer-Encoding을 포함한 메시지 길이 결정 규칙이 본문 경계를 만들고, 해석 차이가 request smuggling으로 이어질 수 있는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 메시지 구문, 프레이밍과 연결 재사용 규칙을 확인한다."
    displayOrder: 1
---
# Content-Length와 전송 프레이밍

HTTP/1.1 지속 연결에서는 하나의 TCP 연결 위에 여러 HTTP 메시지가 연속해서 놓일 수 있다. 따라서 수신자는 **현재 메시지의 본문이 정확히 어디에서 끝나고 다음 메시지가 어디에서 시작하는지** 알아야 한다. 이 경계를 정하는 규칙이 메시지 프레이밍이다.

```text
하나의 TCP 바이트 스트림

[HTTP 요청 1][HTTP 요청 2][HTTP 요청 3]...
        ↑
각 메시지 경계를 정확히 복원해야 함
```

경계를 잘못 판단하면 단순한 파싱 오류로 끝나지 않고, 프록시와 원본 서버가 같은 바이트열을 서로 다른 요청으로 나누어 해석하는 보안 문제가 생길 수 있다.

### Content-Length는 콘텐츠의 octet 수를 나타낸다

`Content-Length`가 메시지 프레이밍에 사용되는 경우 그 값은 콘텐츠의 **octet 수**, 즉 바이트 길이를 나타낸다.

```http
Content-Length: 120
```

수신자는 해당 규칙이 적용되는 메시지에서 콘텐츠 120 octet을 읽어 본문 경계를 판단한다. 이 값은 JSON 필드 수, 문자 수, TCP 세그먼트 수가 아니다.

UTF-8처럼 문자마다 바이트 수가 달라질 수 있는 인코딩에서는 특히 `문자 수 = Content-Length`라고 계산하면 안 된다.

### Transfer-Encoding: chunked는 HTTP/1.1 메시지 본문을 청크로 프레이밍한다

HTTP/1.1에서는 콘텐츠 길이를 미리 하나의 숫자로 보내기 어려운 경우 `Transfer-Encoding: chunked`를 사용할 수 있다. 각 청크의 크기를 표시하고 마지막 0 크기 청크로 메시지 본문 종료를 나타낸다.

```text
chunk size
   ↓
chunk data
   ↓
chunk size
   ↓
chunk data
   ↓
0-size chunk → 종료
```

`Transfer-Encoding`은 **메시지를 연결 위에서 어떻게 전송·프레이밍하는가**에 관한 정보다. 표현 데이터 자체의 압축·변환을 설명하는 `Content-Encoding`과는 책임이 다르다.

### Content-Length와 Transfer-Encoding을 동시에 보내면 안 된다

RFC 9112에서 송신자는 `Transfer-Encoding`이 있는 메시지에 `Content-Length`를 함께 보내면 안 된다. 수신 메시지에 둘이 모두 존재하면 `Transfer-Encoding`이 메시지 길이 결정에서 우선하지만, 이런 조합 자체가 request smuggling 같은 공격을 나타낼 수 있어 오류로 취급할 이유가 크다. citeturn785911search0

```text
Content-Length: 5
Transfer-Encoding: chunked

→ 정상적인 송신자가 만들 조합이 아님
→ 홉마다 다르게 해석하면 위험
```

프록시가 `Content-Length`를 기준으로 요청 끝을 정하고 원본 서버가 `Transfer-Encoding`을 기준으로 다르게 판단한다면, 뒤의 바이트가 한쪽에서는 첫 요청의 본문이고 다른 쪽에서는 **다음 요청의 시작**으로 보일 수 있다.

### Request Smuggling은 ‘같은 바이트열을 다르게 자르는’ 문제다

예를 들어 앞단 프록시와 원본 서버가 요청 경계를 다르게 해석하면 공격자가 프록시가 하나의 정상 요청으로 본 바이트 안에 원본 서버가 다음 요청으로 해석할 내용을 숨길 수 있다.

```text
같은 바이트열
      │
      ├─ 프록시 해석: [요청 A 전체            ]
      │
      └─ 원본 해석  : [요청 A][숨겨진 요청 B]
```

그래서 HTTP 프레이밍 파서는 모호한 입력을 느슨하게 각각 다른 방식으로 받아들이기보다 RFC 규칙에 따라 일관되게 처리해야 한다. 중개자가 메시지를 전달한다면 다음 홉과의 해석 차이가 생기지 않도록 정규화·거부 정책을 명확히 해야 한다.

### 요청에서 길이 정보가 전혀 없으면 본문 길이는 0으로 해석된다

HTTP/1.1 요청에서 `Transfer-Encoding`도 유효한 `Content-Length`도 없고 다른 우선 규칙이 적용되지 않으면 메시지 본문 길이는 0이다. 따라서 헤더 뒤에 JSON 바이트를 그냥 이어 붙인다고 자동으로 요청 본문이 되지 않는다. RFC 9112는 요청 메시지가 길이나 transfer coding으로 명시적으로 프레이밍되며 둘 다 없으면 요청이 헤더 영역 뒤에서 끝난다고 설명한다. citeturn785911search0

### HTTP/2와 HTTP/3은 HTTP/1.1 chunked 프레이밍을 그대로 사용하지 않는다

HTTP/2와 HTTP/3은 각각의 프레임·스트림 구조를 사용해 콘텐츠 데이터를 운반한다. 따라서 `Content-Length 또는 chunked 중 하나로 모든 HTTP 버전의 본문 경계를 찾는다`고 일반화하면 안 된다.

```text
HTTP/1.1
→ 메시지 길이 결정 규칙, Content-Length, Transfer-Encoding 등

HTTP/2·HTTP/3
→ 버전별 프레임과 스트림 경계
```

핵심은 **`Content-Type`처럼 콘텐츠가 무엇을 의미하는지 설명하는 메타데이터와, 이번 메시지의 바이트가 어디까지인지 결정하는 프레이밍을 분리하고, HTTP/1.1에서는 모든 홉이 동일한 메시지 길이 규칙을 적용해야 한다는 점**이다.

---
kind: concept
contentKey: network-http.core.http-message.content-length-transfer
topicContentKey: network-http.core.http-message
slug: content-length-transfer
title: "Content-Length와 전송 프레이밍"
summary: "HTTP/1.1에서 Content-Length와 Transfer-Encoding을 포함한 메시지 길이 결정 규칙이 본문 경계를 만들고, 해석 차이가 요청 스머글링(request smuggling)으로 이어질 수 있는 이유를 설명한다."
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

HTTP/1.1 지속 연결에서는 하나의 TCP 바이트 스트림에 여러 HTTP 메시지가 이어질 수 있습니다. 프레이밍은 현재 메시지의 끝과 다음 메시지의 시작을 판단하는 규칙입니다.

### Content-Length와 옥텟

```http
Content-Length: 120
```

이 필드가 프레이밍에 적용되면 120옥텟의 콘텐츠를 읽습니다. UTF-8 문자 수나 JSON 필드 수를 세는 것이 아닙니다. HEAD 응답이나 304처럼 콘텐츠가 없는 메시지에서는 허용된 Content-Length가 표현 크기 정보를 나타낼 수도 있으므로 메시지의 메서드와 상태 코드부터 고려해야 합니다.

### Chunked 전송 코딩

HTTP/1.1의 Transfer-Encoding: chunked는 청크의 크기와 데이터, 마지막 0 크기 청크 및 뒤따르는 trailer 영역과 종료 경계로 본문을 프레이밍합니다. 콘텐츠의 압축을 나타내는 Content-Encoding과는 책임이 다릅니다.

### 모호한 프레이밍의 처리

RFC 9112 §6.1과 §6.3에서 송신자는 Transfer-Encoding과 Content-Length를 함께 보내면 안 됩니다. 둘이 존재하는 요청을 받은 서버는 요청을 거부하거나 Transfer-Encoding에 따라 처리할 수 있지만 어느 경우든 응답 후 연결을 닫아야 합니다. 중개자가 전달하기로 했다면 수신한 Content-Length를 제거하고 전송 코딩에 따라 처리해야 합니다.

서로 다른 홉에서 같은 바이트의 메시지 경계를 다르게 해석하면 요청 스머글링 위험이 생깁니다. 모호한 입력을 각각 다른 방식으로 복구하기보다 명세와 일치하는 검증 및 오류 처리 계약이 필요합니다.

HTTP/1.1 요청에서 Transfer-Encoding 및 유효한 Content-Length가 없고 다른 우선 규칙이 적용되지 않으면 본문 길이는 0입니다. 잘못된 길이 선언을 단순히 없는 필드로 취급해서는 안 됩니다. 길이가 선언된 응답에서 실제 수신량이 부족하다면 연결이 정상 종료되었더라도 불완전한 메시지입니다.

### HTTP/2·3과의 차이

HTTP/2와 HTTP/3은 해당 버전의 프레임과 스트림 종료로 메시지 경계를 관리합니다. HTTP/1.1 chunked 전송 코딩을 그대로 사용하지 않습니다. Content-Length를 사용할 수 있는 조건과 실제 콘텐츠 길이의 정합성은 버전별 규칙에 따릅니다.

프레이밍은 어디까지가 메시지인지 결정하고 Content-Type은 그 데이터를 어떤 형식으로 해석할지 나타냅니다.

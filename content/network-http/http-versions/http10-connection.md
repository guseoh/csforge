---
kind: concept
contentKey: network-http.core.http-versions.http10-connection
topicContentKey: network-http.core.http-versions
slug: http10-connection
title: "HTTP/1.0 연결"
summary: "HTTP/1.0의 기본 연결당 한 번의 요청·응답 교환(connection-per-exchange) 모델과 연결 종료로 본문 끝을 판단하는 방식(connection-close framing)의 관계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1945"
    title: "Hypertext Transfer Protocol — HTTP/1.0"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP connection reuse와 version framing을 확인한다."
    displayOrder: 1
---
# HTTP/1.0 연결

웹 페이지를 열면 HTML뿐 아니라 이미지, CSS, JavaScript 등 여러 리소스를 요청하게 됩니다. HTTP/1.0의 일반적인 비지속 연결에서는 요청과 응답의 교환이 끝날 때 TCP 연결을 닫았기 때문에 리소스마다 연결 설정 비용이 반복될 수 있었습니다.

```text
TCP 연결 → 요청 1 → 응답 1 → 연결 종료
TCP 연결 → 요청 2 → 응답 2 → 연결 종료
```

예를 들어 같은 서버의 리소스를 순차적으로 요청하고 연결 수립에 왕복 지연(RTT)이 필요하다면, 새 연결을 만드는 횟수만큼 그 지연이 반복됩니다. 실제 시간은 병렬 연결 수, 혼잡 제어, 캐시, 연결 설정에 따라 달라집니다. 연결마다 서버 소켓과 TCP 상태도 관리해야 합니다.

### 연결 종료와 메시지 경계

일부 HTTP/1.0 응답은 연결이 닫히는 시점을 본문 끝으로 사용했습니다. 이 방식에서는 정상적인 본문 종료와 도중에 끊긴 연결을 길이 정보 없이 완전히 구별하기 어렵습니다. Content-Length처럼 길이가 명시된 경우에는 그 길이를 기준으로 수신 완료를 판단할 수 있습니다.

HTTP/1.0에도 Keep-Alive 확장을 이용한 재사용 사례가 있었습니다. 그러나 지속 연결이 기본인 HTTP/1.1과 같은 계약은 아닙니다. HTTP/1.1에서 연결을 재사용하려면 메시지 경계를 정확히 해석해야 하며 Connection: close와 같은 종료 지시도 고려해야 합니다.

연결 수명은 HTTP 메시지의 논리적 경계와 다른 개념입니다. HTTP 버전을 개선한다고 모든 요청 지연이 사라지는 것은 아니지만 연결 설정을 반복하는 비용은 줄일 수 있습니다.

---
kind: concept
contentKey: network-http.core.http-state-intermediary.forwarded-header
topicContentKey: network-http.core.http-state-intermediary
slug: forwarded-header
title: "Forwarded 헤더"
summary: "`Forwarded` 필드가 중개자가 관찰한 클라이언트 주소·호스트·스킴·요청 경로 정보를 다음 구간에 전달하는 표준 형식임을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7239"
    title: "Forwarded HTTP Extension"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "forwarded identity와 trusted intermediary 경계를 확인한다."
    displayOrder: 1
---
# Forwarded 헤더

HTTP 프록시를 거치면 백엔드에서 관찰하는 연결 상대 주소와 원래 클라이언트의 주소 또는 URL 스킴이 달라질 수 있습니다. RFC 7239의 Forwarded는 중개자가 관찰한 정보를 전달하는 표준 필드입니다.

| 매개변수 | 의미 |
| --- | --- |
| for | 중개자에 요청을 보낸 노드 정보 |
| by | 중개자의 수신 인터페이스에 관한 정보 |
| host | 수신 요청의 호스트 정보 |
| proto | 수신 요청의 프로토콜 |

```http
Forwarded: for=192.0.2.10;proto=https;host=api.example.com
```

위 예는 신뢰된 프록시가 관찰값으로 구성한 경우를 가정합니다. 중개자가 여러 개면 항목을 추가할 수 있습니다. 주소 표현에는 IPv6나 인용 문자열 등의 문법도 적용됩니다.

### 신뢰는 별도 정책입니다

Forwarded 자체에는 작성자 인증이나 무결성 보호 기능이 없습니다. 외부 클라이언트도 동일한 이름의 필드를 입력할 수 있습니다. 따라서 허용된 중개자와 기존 필드의 제거·정리·추가 정책을 명시해야 합니다.

원래 HTTPS였다는 메타데이터가 백엔드 구간의 암호화를 증명하는 것도 아닙니다. 각각의 TLS 연결과 전달 정보의 신뢰를 구분합니다.

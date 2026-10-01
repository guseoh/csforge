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

프록시가 HTTP 요청을 다음 구간으로 전달하면 백엔드가 보는 연결 상대나 호스트·스킴은 원래 클라이언트가 사용한 값과 달라질 수 있다. 표준 `Forwarded` 필드는 중개자가 관찰한 정보를 `for`, `by`, `host`, `proto` 같은 매개변수로 다음 구간에 전달하는 형식이다.

TLS를 경계 프록시에서 종료한 뒤 백엔드로 일반 HTTP 요청을 보내면 백엔드는 자기 연결만 보고 클라이언트가 원래 HTTPS를 사용했는지 알기 어렵다. 프록시는 관찰한 스킴을 `proto=https`로 전달할 수 있다.

```text
클라이언트 ── HTTPS ──> 프록시 ── HTTP ──> 백엔드
                         │
                         └─ Forwarded: proto=https; ...
```

중개자가 여러 개면 각 구간에서 `Forwarded` 항목이 덧붙을 수 있다. 특정 항목 하나가 항상 최초 클라이언트 정보를 가리킨다고 가정해서는 안 된다.

**`Forwarded` 필드가 있다는 사실만으로 값의 작성자를 신뢰할 수는 없다.** 외부 클라이언트도 같은 이름의 필드를 보낼 수 있다. 어떤 프록시가 외부 입력을 제거·정리·추가하는지, 백엔드가 어느 구간의 값을 신뢰하는지는 신뢰 프록시 정책으로 정해야 한다.

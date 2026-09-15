---
kind: concept
contentKey: network-http.core.http-state-intermediary.forwarded-header
topicContentKey: network-http.core.http-state-intermediary
slug: forwarded-header
title: "Forwarded Header"
summary: "proxy가 자신이 관찰한 client·host·scheme·hop 정보를 표준 Forwarded field로 전달하는 방식을 설명한다."
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
# Forwarded Header

HTTP proxy가 request를 다음 hop으로 전달하면 backend가 보는 socket peer나 host·scheme은 원래 client가 사용한 값과 달라질 수 있다. `Forwarded` field는 intermediary가 자신이 관찰한 정보를 `for`, `by`, `host`, `proto` 같은 parameter로 다음 hop에 전달하기 위한 표준 형식이다.

예를 들어 TLS를 edge proxy에서 종료한 뒤 backend에 HTTP로 전달하면 backend의 local connection만 보고는 client가 원래 HTTPS를 사용했는지 알기 어렵다. Proxy는 `proto=https` 같은 정보를 전달할 수 있다.

```text
client ── HTTPS ──> proxy ── HTTP ──> backend
                    │
                    └─ Forwarded: proto=https; ...
```

여러 intermediary가 존재하면 hop마다 Forwarded element가 추가될 수 있다. 따라서 하나의 값만 보고 항상 최초 client를 의미한다고 가정하면 안 된다.

더 중요한 점은 **Forwarded field가 존재한다는 사실 자체가 그 값을 신뢰할 수 있다는 증거가 아니라는 것**이다. External client도 같은 이름의 field를 보낼 수 있으므로, 어떤 intermediary가 값을 제거·정규화·추가하며 backend가 어느 hop을 신뢰할지는 별도의 trusted-proxy policy가 결정해야 한다.

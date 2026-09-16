---
kind: concept
contentKey: network-http.core.http-state-intermediary.trusted-proxy-boundary
topicContentKey: network-http.core.http-state-intermediary
slug: trusted-proxy-boundary
title: "Trusted Proxy Boundary"
summary: "backend가 어떤 proxy가 추가한 forwarded metadata를 신뢰할 수 있는지 결정하는 boundary를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7239"
    title: "Forwarded HTTP Extension"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "forwarded identity와 trusted intermediary 경계를 확인한다."
    displayOrder: 1
---
# Trusted Proxy Boundary

Forwarded 또는 X-Forwarded field는 proxy가 관찰한 request metadata를 전달할 수 있지만, HTTP field 자체에는 누가 그 값을 썼는지를 증명하는 기능이 없다. External client가 임의의 `X-Forwarded-For`나 `Forwarded`를 보낼 수도 있기 때문에 backend가 모든 값을 그대로 신뢰하면 client address, scheme이나 host를 위조할 수 있다.

Trusted proxy boundary는 **어느 intermediary가 값을 정규화해 추가했다고 믿을 것인지**를 정하는 정책이다. 일반적인 구성에서는 외부 request가 trusted edge에 도달하면 기존 forwarded field를 제거하거나 규칙에 맞게 재작성하고, backend는 실제 connection peer가 허용된 proxy인지 확인한 뒤 해당 metadata를 사용한다.

```text
untrusted client
      ↓
trusted edge / proxy
  - incoming forwarded metadata 정리
  - 자신이 관찰한 metadata 추가
      ↓
backend
  - trusted source에서 온 값만 해석
```

Proxy가 하나 더 추가되거나 topology 순서가 바뀌면 어느 hop의 값이 원래 client를 나타내는지도 달라질 수 있다. 그래서 단순히 `첫 번째 IP` 또는 `마지막 IP`를 항상 신뢰하는 규칙은 안전하지 않다.

또한 trusted proxy가 전달한 client address는 network observation에 관한 신뢰일 뿐 application user identity나 authorization을 대신하지 않는다. **Forwarded metadata의 신뢰는 proxy topology에 대한 trust contract이고, 사용자 인증은 별도의 application security contract**다.

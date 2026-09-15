---
kind: concept
contentKey: network-http.core.http-state-intermediary.x-forwarded
topicContentKey: network-http.core.http-state-intermediary
slug: x-forwarded
title: "X-Forwarded Headers"
summary: "X-Forwarded-For·Proto·Host가 proxy 환경에서 원래 request 정보를 전달하는 관행과 해석 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7239"
    title: "Forwarded HTTP Extension"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "forwarded identity와 trusted intermediary 경계를 확인한다."
    displayOrder: 1
---
# X-Forwarded Headers

`X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`는 proxy가 원래 request의 client address, scheme, host 정보를 다음 hop에 전달할 때 널리 쓰이는 관행적 field다. 표준화된 `Forwarded` field보다 오래 사용되어 왔기 때문에 실제 배포 환경에서 흔히 볼 수 있다.

`X-Forwarded-For`는 여러 proxy를 거치면서 address 목록으로 확장될 수 있다. 다만 값을 append하는지 overwrite하는지, 목록의 어느 쪽이 어느 hop인지에 대한 세부 규칙은 제품과 설정에 따라 달라질 수 있다. 따라서 field 이름만 보고 chain 해석 규칙을 고정해서는 안 된다.

```text
client → proxy A → proxy B → backend
          │          │
          └── X-Forwarded-* chain ──>
```

`X-Forwarded-Proto`나 `X-Forwarded-Host`도 backend가 external URL이나 original authority를 복원하는 데 사용할 수 있지만, client가 직접 같은 field를 주입할 수도 있다. 그래서 **X-Forwarded 값의 형식과 그 값을 신뢰할 수 있는가는 별도의 문제**다.

결국 backend가 사용할 값은 실제 proxy topology와 trusted hop 정책에 따라 결정해야 한다. X-Forwarded field는 original request metadata를 전달하는 관행이지, 그 자체로 authenticated client identity를 증명하는 mechanism은 아니다.

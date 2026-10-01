---
kind: concept
contentKey: network-http.core.http-state-intermediary.x-forwarded
topicContentKey: network-http.core.http-state-intermediary
slug: x-forwarded
title: "X-Forwarded-* 헤더"
summary: "`X-Forwarded-For`·`X-Forwarded-Proto`·`X-Forwarded-Host`가 프록시 환경에서 원래 요청 정보를 전달하는 관행과 제품별 해석 차이를 설명한다."
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
# X-Forwarded-* 헤더

`X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`는 프록시가 원래 요청의 클라이언트 주소, 스킴, 호스트를 다음 구간에 전달할 때 널리 쓰는 관행적 필드다. 표준 `Forwarded` 필드보다 먼저 사용된 방식이라 실제 배포 환경에서 흔히 볼 수 있다.

요청이 여러 프록시를 지나면 `X-Forwarded-For`가 주소 목록으로 늘어날 수 있다. 다만 프록시가 값을 뒤에 추가하는지 기존 값을 덮어쓰는지, 목록의 어느 쪽이 어느 구간인지는 제품과 설정마다 다를 수 있다. 필드 이름만으로 목록 해석 방법을 정해서는 안 된다.

```text
클라이언트 → 프록시 A → 프록시 B → 백엔드
              │           │
              └── X-Forwarded-* 전달 목록 ──>
```

`X-Forwarded-Proto`와 `X-Forwarded-Host`는 백엔드가 외부 URL이나 원래 authority 정보를 복원하는 데 쓰일 수 있다. 하지만 클라이언트가 같은 필드를 직접 넣을 수도 있다. 따라서 **값의 형식이 올바른지와 그 값을 신뢰할 수 있는지는 별개의 문제**다.

백엔드가 사용할 값은 실제 프록시 배치와 신뢰할 구간 정책을 기준으로 정해야 한다. X-Forwarded 필드는 원래 요청 메타데이터를 전달하는 관행일 뿐, 인증된 클라이언트 신원을 증명하지 않는다.

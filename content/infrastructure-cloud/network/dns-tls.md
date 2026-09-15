---
kind: concept
contentKey: infrastructure.core.network.dns-tls
topicContentKey: infrastructure.core.network
slug: dns-tls
title: "DNS 변경과 TLS 인증서 수명주기"
summary: "DNS record 변경이 cache TTL을 거쳐 점진적으로 전파되고 TLS certificate가 발급·배포·rotation·expiry되는 운영 흐름을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "DNS name resolution의 기본 모델 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "TLS server authentication과 certificate 사용의 기반 확인"
---
# DNS 변경과 TLS 인증서 수명주기

인프라에서 도메인과 HTTPS를 운영할 때 중요한 문제는 protocol 세부를 다시 구현하는 것이 아니라 **주소와 인증서가 바뀌는 transition을 안전하게 관리하는 것**입니다.

DNS record를 새 load balancer 주소로 바꿔도 모든 client가 즉시 새 주소를 사용하는 것은 아닙니다. Resolver와 client는 TTL 동안 이전 결과를 cache할 수 있습니다.

```text
old endpoint ← 일부 resolver cache
        │
DNS record 변경
        │
        └────────▶ new endpoint ← 점진적으로 전환
```

따라서 endpoint migration 중에는 일정 시간 old/new 경로가 함께 사용될 수 있음을 고려해야 합니다. 기존 endpoint를 너무 빨리 제거하면 아직 old DNS 값을 가진 client만 실패할 수 있습니다.

### Certificate도 한 번 설치하고 끝나는 설정이 아니다

HTTPS endpoint의 certificate에는 유효 기간이 있고 hostname과 trust chain이 맞아야 합니다. 만료된 certificate나 잘못된 hostname은 application controller까지 도달하기 전에 연결 실패를 만들 수 있습니다.

안전한 rotation은 만료 직전에 파일 하나를 바꾸는 작업이 아니라 다음과 같은 transition입니다.

```text
새 certificate 발급
   │
   ├─ load balancer / ingress에 배포
   ├─ 실제 endpoint에서 새 certificate 확인
   ├─ old/new instance 전환 완료 확인
   └─ 이전 material 제거
```

자동 갱신을 사용해도 배포 실패나 secret reload 문제를 관측해야 합니다. Certificate expiry 자체뿐 아니라 "새 certificate가 모든 serving endpoint에 실제로 적용되었는가"가 중요합니다.

DNS와 TLS의 protocol semantics는 Network & HTTP 영역에서 더 깊게 다룰 수 있습니다. Infrastructure 영역에서는 **DNS cache와 certificate lifetime 때문에 변경이 즉시 원자적으로 적용되지 않으며, old/new 상태가 공존하는 기간을 운영해야 한다는 점**이 핵심입니다.

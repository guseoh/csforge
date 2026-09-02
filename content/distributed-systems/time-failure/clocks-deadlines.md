---
kind: concept
contentKey: distributed.core.time-failure.clocks-deadlines
topicContentKey: distributed.core.time-failure
slug: clocks-deadlines
title: "clocks와 deadlines"
summary: "wall clock·monotonic time·clock skew를 구분하고 end-to-end deadline을 전파한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/info/rfc5905"
    title: "RFC 5905: Network Time Protocol Version 4"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "분산 node clock 동기화의 protocol 배경 확인"
  - url: "https://grpc.io/docs/guides/deadlines/"
    title: "gRPC Documentation: Deadlines"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "deadline propagation과 clock skew 보호 확인"
---
# clocks와 deadlines

분산 시스템에는 서로 완전히 같은 시계를 가진 node가 없습니다. Wall clock은 실제 시각과의 관계를 표현하는 데 유용하지만 조정될 수 있고, monotonic clock은 한 process 안에서 경과 시간을 재는 데 적합합니다. clock sync가 잘 되어도 network delay와 skew의 상한을 무시할 수는 없습니다.

### timestamp와 elapsed time을 분리한다

```text
wall clock ─▶ event ordering·사용자 시각·expiry 후보
monotonic ─▶ local timeout·duration·retry backoff
```

두 host의 wall-clock timestamp만 비교해 event의 causal order를 단정하면 skew와 delay 때문에 잘못된 결론을 낼 수 있습니다. ordering이 중요하면 sequence·revision·logical clock 같은 명시적 metadata를 함께 사용합니다.

### timeout보다 deadline을 전파한다

상위 request가 가진 전체 deadline을 downstream call에 전달하면 이미 소비한 시간을 빼고 남은 budget만 사용할 수 있습니다. 각 hop에서 새 timeout을 더하면 serial call 수만큼 전체 대기가 늘어나 caller가 포기한 뒤에도 작업이 계속될 수 있습니다. deadline 도달 시 server가 expensive work를 취소할 수 있는지도 확인합니다.

### expiry는 안전 여유가 필요하다

lease나 token 만료 판단을 wall clock 하나에 의존하면 clock jump·skew가 safety를 깨뜨릴 수 있습니다. 만료를 사용하는 protocol은 authoritative clock, monotonic elapsed time, renew margin과 fencing 또는 version check를 함께 정의합니다.

### 문제를 풀 때 확인할 것

1. 시각 표시인지 경과 시간인지 구분합니다.
2. 서로 다른 host timestamp를 직접 비교해도 되는지 확인합니다.
3. end-to-end deadline과 hop별 remaining budget을 계산합니다.
4. cancellation이 실제 작업·connection·lock까지 전파되는지 봅니다.
5. clock skew·jump와 expiry safety margin을 검토합니다.

### 면접에서 설명한다면

Wall clock은 시각, monotonic clock은 한 process의 elapsed time에 쓰며 서로 다른 host의 timestamp로 순서를 보장하지 않습니다. 분산 호출은 상위 deadline에서 이미 쓴 시간을 뺀 remaining budget을 전파하고, lease·expiry는 clock skew와 stale actor를 견디는 별도 fencing/version 계약이 필요합니다.

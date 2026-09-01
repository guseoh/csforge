---
kind: concept
contentKey: distributed.core.consistency.quorum-conflict
topicContentKey: distributed.core.consistency
slug: quorum-conflict
title: "quorum과 conflict resolution"
summary: "read/write quorum, stale data와 concurrent conflict를 data semantics에 맞게 해결한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://etcd.io/docs/v3.5/learning/api_guarantees/"
    title: "etcd Documentation: API guarantees"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "quorum consensus와 linearizable/serializable read cost 확인"
---
# quorum과 conflict resolution

Quorum은 여러 replica 중 일정 수의 응답을 요구해 read/write가 겹치도록 만드는 조정 방법입니다. 단순히 `N`, `R`, `W` 숫자를 적는 것만으로 consistency가 보장되지는 않습니다. replica membership, failure domain, hinted handoff, read repair와 conflict semantics까지 protocol의 일부입니다.

### quorum intersection의 의미

일반적인 모델에서 `R + W > N`이면 한 read quorum과 write quorum이 적어도 하나의 replica에서 만날 가능성을 만들 수 있습니다. 하지만 concurrent write, stale replica, 네트워크 partition과 구현의 version ordering이 남아 있으므로 “최신”의 정의와 conflict resolution을 따로 정해야 합니다.

### conflict는 business semantics로 해결한다

last-write-wins는 clock skew와 동시 update의 lost write를 만들 수 있습니다. counter는 merge, set은 add/remove semantics, 주문 상태는 monotonic transition 또는 version compare처럼 데이터 유형별 규칙이 필요합니다. 자동 merge가 불가능한 결제·권한 state는 reject와 수동 reconciliation을 선택할 수 있습니다.

```text
replica A: balance = 90 (v5)
replica B: balance = 80 (v5)
      └─ timestamp 하나로 덮기보다 invariant 위반 여부를 확인
```

### quorum은 failure domain과 함께 본다

세 응답이 같은 rack에 있으면 network partition을 견디는 의미가 약해집니다. quorum latency와 availability, read repair traffic, slow replica가 전체 요청을 지연시키는지, degraded mode에서 어떤 write를 거부할지 함께 계산합니다.

### 문제를 풀 때 확인할 것

1. N/R/W와 membership·failure domain을 정합니다.
2. read/write quorum이 어떤 보장을 만드는지 설명합니다.
3. concurrent write와 version ordering을 처리합니다.
4. data type·business invariant별 conflict 규칙을 둡니다.
5. degraded quorum, repair와 운영 비용을 검증합니다.

### 면접에서 설명한다면

Quorum 숫자는 replica 교집합을 만드는 수단일 뿐 “최신값”의 정의를 대신하지 않습니다. N/R/W, failure domain과 lag를 계산하고 concurrent update는 timestamp 무조건 승자가 아니라 data semantics·version·business invariant에 맞춰 merge 또는 reject합니다.

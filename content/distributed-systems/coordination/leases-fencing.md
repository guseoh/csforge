---
kind: concept
contentKey: distributed.core.coordination.leases-fencing
topicContentKey: distributed.core.coordination
slug: leases-fencing
title: "임대(Lease)와 펜싱 토큰(Fencing Token)"
summary: "임대가 일정 시간 소유권을 나타낼 뿐 이전 소유자의 부수 효과를 자동으로 막지는 못하며, 실제 자원이 펜싱 세대를 검증해야 하는 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://kubernetes.io/docs/concepts/architecture/leases/"
    title: "Kubernetes Documentation: Leases"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Lease가 생존성 판단과 리더 선출에 사용되는 방식 확인"
  - url: "https://etcd.io/docs/v3.7/learning/api/"
    title: "etcd Documentation: etcd API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "Lease의 TTL·keep-alive·만료 계약과 키 연결 방식 확인"
  - url: "https://static.usenix.org/events/osdi06/tech/full_papers/burrows/burrows_html/"
    title: "The Chubby lock service for loosely-coupled distributed systems"
    referenceType: PAPER
    language: en
    depth: section
    recommendation: "2.4절에서 잠금 세대를 담은 sequencer를 실제 자원이 검사해 지연된 요청을 막는 설계를 확인한다."
    displayOrder: 3
    relationNote: "잠금 세대를 나타내는 sequencer를 보호 대상 자원이 검증하는 방법 확인"
---
# 임대(Lease)와 펜싱 토큰(Fencing Token)

임대(Lease)는 어떤 워커나 리더를 일정 시간 동안 자원의 소유자로 간주할 수 있게 하는 조정 방식입니다. 소유자가 주기적으로 임대를 갱신하지 못하면 임대가 만료되고 다른 실행 주체가 소유권을 가져갈 수 있습니다.

문제는 이전 소유자가 자신의 임대 만료를 즉시 알지 못할 수 있다는 점입니다. 긴 GC 일시 정지나 네트워크 분할 뒤에 다시 실행된 주체는 여전히 자신이 소유자라고 믿고 늦은 부수 효과를 보낼 수 있습니다.

```text
A: 임대 획득
   │
   ├─ 긴 일시 정지
   │
   └─ 임대 만료

B: 새 임대 획득 → 현재 소유자

A: 뒤늦게 깨어나 쓰기 시도
```

임대의 시간 초과만으로는 이 오래된 실행 주체의 쓰기를 항상 막을 수 없습니다. 그래서 실제 자원이 비교할 수 있는 **펜싱 토큰(fencing token) 또는 세대(generation)**를 함께 사용할 수 있습니다.

```text
A → token 41
B → token 42

저장소가 마지막 token 42를 기억
→ A의 token 41 쓰기는 거부
```

Chubby의 sequencer는 잠금 세대를 요청에 담아 보내고 보호 대상 서버가 유효성을 검사하는 한 가지 예입니다. 중요한 점은 펜싱 토큰이 모든 Lease API에서 자동으로 제공되는 기능이 아니라는 것입니다. 조정 권한을 가진 시스템이 비교 가능한 세대를 발급해야 하고, 실제 DB·저장소 같은 부수 효과 대상이 더 오래된 값을 거부해야 펜싱이 완성됩니다.

외부 API처럼 펜싱 세대를 검증할 수 없는 대상도 있습니다. 이 경우 외부 제공자의 멱등성 키(idempotency key), 단일 쓰기 주체 경계, 작업 상태 조회와 정합성 보정(reconciliation)처럼 그 시스템이 실제로 제공하는 계약으로 중복되거나 오래된 부수 효과의 위험을 줄여야 합니다.

Lease는 **누가 현재 소유자라고 판단할지**를 돕고, 펜싱은 **이전 소유자가 늦게 보낸 작업을 실제 자원에서 차단하는 방법**입니다. 두 역할을 분리해서 이해해야 합니다.

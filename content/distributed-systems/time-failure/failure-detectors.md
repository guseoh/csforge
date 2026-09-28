---
kind: concept
contentKey: distributed.core.time-failure.failure-detectors
topicContentKey: distributed.core.time-failure
slug: failure-detectors
title: "장애 감지와 의심 판단"
summary: "heartbeat와 시간 초과는 노드의 실제 종료를 증명하지 않고 일정 시간 응답하지 않았다는 의심만 만든다는 점을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://etcd.io/docs/v3.7/op-guide/failures/"
    title: "etcd Documentation: Failure modes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "시간 초과 기반 리더 장애 감지와 선출 지연 확인"
  - url: "https://kubernetes.io/docs/concepts/architecture/leases/"
    title: "Kubernetes Documentation: Leases"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "하트비트와 생존성 판단에 Lease가 사용되는 방식 확인"
---
# 장애 감지와 의심 판단

분산 시스템에서는 다른 노드가 실제로 종료됐는지 즉시 확인할 방법이 없습니다. 하트비트(heartbeat)가 오지 않거나 요청이 시간 초과되면 알 수 있는 것은 **일정 시간 동안 상대의 응답을 관찰하지 못했다는 사실**뿐입니다. 그래서 장애 감지기(failure detector)는 죽음을 증명하기보다 현재 노드를 의심(suspect)하는 장치로 이해하는 편이 정확합니다.

```text
하트비트 정상 수신  → 도달 가능하다고 관찰
하트비트 지연       → 느린 것인지 장애인지 아직 모름
시간 초과            → 장애로 의심
```

시간 초과 기준을 짧게 잡으면 실제 장애를 빨리 감지할 수 있지만 순간적인 네트워크 지연이나 긴 GC 일시 정지도 장애로 오인할 수 있습니다. 반대로 기준을 길게 잡으면 오탐(false positive)은 줄어들 수 있지만 실제로 종료된 노드를 오래 기다려 복구가 늦어집니다.

하트비트 역시 “서비스가 정상적으로 요청을 처리할 수 있다”는 보장은 아닙니다. 프로세스가 하트비트는 보내지만 DB 연결이 고갈돼 실제 요청은 처리하지 못할 수도 있습니다. 따라서 생존성(liveness) 신호와 준비 상태(readiness), 의존 시스템 상태, 사용자 지연 시간처럼 실제 요청을 처리할 수 있는 상태를 구분해야 합니다.

```text
프로세스 하트비트 정상
        │
        ├─ DB 정상 → 요청 처리 가능
        └─ DB 장애 → 하트비트는 살아 있어도 요청 처리 실패
```

장애 감지기의 판단을 곧바로 위험한 부수 효과를 실행할 권한으로 사용해서도 안 됩니다. 살아 있는 노드를 잘못 의심하더라도 데이터가 깨지지 않도록 리더 세대(term), 정족수, 임대·펜싱 같은 별도의 안전 장치가 필요할 수 있습니다.

즉 장애 감지는 **다른 노드의 상태를 불완전한 관찰로 추정하는 문제**이고, 그 추정이 틀렸을 때도 정확성을 지키는 것은 조정 프로토콜의 별도 책임입니다.

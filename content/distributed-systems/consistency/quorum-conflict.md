---
kind: concept
contentKey: distributed.core.consistency.quorum-conflict
topicContentKey: distributed.core.consistency
slug: quorum-conflict
title: "정족수 교집합과 충돌 해결"
summary: "Dynamo 방식의 N/R/W 정족수 교집합이 보장하는 것과 보장하지 않는 것을 구분하고 합의 프로토콜의 다수결 정족수와 비교한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cdn.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf"
    title: "Amazon Dynamo: Highly Available Key-value Store"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "N/R/W, sloppy quorum, hinted handoff와 충돌 조정을 사용하는 Dynamo 계열 모델 확인"
  - url: "https://etcd.io/docs/v3.7/learning/api_guarantees/"
    title: "etcd Documentation: API guarantees"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "합의 기반 선형화 가능 연산을 Dynamo 방식의 N/R/W 모델과 구분해 확인"
---
# 정족수 교집합과 충돌 해결

정족수(quorum)라는 단어는 여러 분산 시스템에서 사용되지만 모두 같은 프로토콜을 뜻하지는 않습니다. 먼저 Dynamo 방식의 복제 저장소에서 사용하는 `N`, `R`, `W` 모델과 Raft 같은 합의 프로토콜의 다수결 정족수를 구분해야 합니다.

고정된 N개의 복제본 중 읽기에 R개, 쓰기에 W개의 응답을 사용한다고 단순화해 보겠습니다. `R + W > N`이면 임의의 읽기 정족수와 쓰기 정족수가 적어도 하나의 복제본에서 반드시 겹칩니다.

```text
N = 3, R = 2, W = 2

읽기  = {A, B}
쓰기  = {B, C}
          ▲
          └─ 최소 하나의 교집합
```

이 조건은 **정족수 집합이 겹친다는 것**을 보장합니다. 하지만 교집합 하나만으로 읽기가 항상 최신값을 반환하거나 전체 시스템이 선형화 가능하다고 결론 내릴 수는 없습니다. 동시 쓰기를 어떻게 버전으로 표현하는지, 여러 버전을 읽었을 때 무엇을 선택하는지, 복제본 구성 변경과 장애를 어떻게 처리하는지가 추가로 필요합니다.

Dynamo는 높은 가용성을 위해 객체 버전 관리와 충돌 조정을 사용합니다. 읽기 복구(read repair)나 힌트 기반 인계(hinted handoff) 같은 메커니즘도 이 모델의 운영 방식에 속합니다. 반면 Raft 계열은 리더가 복제 로그를 관리하고 다수 노드의 동의를 통해 로그 엔트리의 커밋을 결정합니다.

```text
Dynamo 방식
복제본 읽기/쓰기 → 버전 비교 → 충돌 조정/복구

Raft 방식
리더 로그 → 복제본 동의 → 다수결 커밋
```

따라서 두 시스템이 모두 과반수나 정족수라는 말을 사용한다고 해서 `R/W` 공식과 합의 프로토콜의 커밋 규칙을 서로 바꿔 쓸 수는 없습니다.

Dynamo 방식에서 동시 버전을 허용한다면 마지막에는 데이터 의미에 맞는 충돌 해결이 필요합니다. 단순한 마지막 쓰기 우선(last-write-wins)은 시계 오차나 실제 동시 수정에서 유효한 변경을 잃을 수 있으므로 카운터, 집합, 주문 상태처럼 데이터 의미에 맞는 병합·거부·수동 조정 정책을 선택해야 합니다.

정족수를 이해할 때 핵심은 **교집합이라는 수학적 조건과 프로토콜 전체가 제공하는 일관성 보장을 분리하는 것**입니다.

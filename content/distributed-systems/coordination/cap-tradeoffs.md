---
kind: concept
contentKey: distributed.core.coordination.cap-tradeoffs
topicContentKey: distributed.core.coordination
slug: cap-tradeoffs
title: "네트워크 분할에서 CAP 절충"
summary: "네트워크 분할이 발생했을 때 선형화 가능성과 정상 노드의 가용성을 항상 함께 보장할 수 없다는 점을 제품의 핵심 불변 조건에 연결한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://dl.acm.org/doi/10.1145/564585.564601"
    title: "Gilbert and Lynch: Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "CAP 절충을 정식화한 논문의 일관성·가용성·네트워크 분할 정의 확인"
  - url: "https://etcd.io/docs/v3.7/op-guide/failures/"
    title: "etcd Documentation: Failure modes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "네트워크 분할 중 다수 노드 가용성과 쓰기 중단 동작 확인"
---
# 네트워크 분할에서 CAP 절충

CAP를 “데이터베이스는 C·A·P 중 두 개만 고른다”는 제품 분류표처럼 외우면 실제 의미를 놓치기 쉽습니다. CAP가 다루는 핵심 상황은 **네트워크 분할 때문에 서로 통신할 수 없는 노드들이 생겼을 때도 어떤 보장을 유지할 것인가**입니다.

정식 CAP 모델에서 일관성(consistency)은 하나의 복사본처럼 보이는 선형화 가능한 읽기·쓰기 의미에 가깝고, 가용성(availability)은 실패하지 않은 노드가 받은 모든 요청이 결국 응답을 반환하는 성질입니다. 네트워크 분할이 지속되는 동안에는 이 두 성질을 동시에 항상 유지할 수 없습니다.

```text
네트워크 분할

구간 A  X  구간 B

C를 지키려면
→ 권한/정족수를 확인할 수 없는 일부 요청을 대기시키거나 거절

A를 지키려면
→ 양쪽이 계속 응답하도록 허용
→ 이전 값이나 충돌 가능성을 받아들이고 더 약한 일관성 사용
```

잔액이나 권한처럼 충돌이 잘못된 업무 상태를 만드는 데이터는 네트워크 분할 동안 일부 쓰기를 거절하거나 대기 상태로 두더라도 강한 순서를 유지하는 선택이 자연스러울 수 있습니다. 반면 좋아요 수나 일부 파생 뷰처럼 병합 가능한 데이터는 양쪽에서 진행한 뒤 연결이 복구된 후 합치는 선택을 할 수 있습니다.

여기서 “강한 일관성을 포기한다”는 말도 구체화해야 합니다. 자신이 쓴 값 읽기(read-your-writes), 제한된 오래됨(bounded staleness), 최종 수렴(eventual convergence)처럼 제품이 실제로 제공할 더 약한 일관성 계약을 별도로 명시하는 편이 좋습니다.

네트워크 분할이 끝난 뒤의 복구도 설계의 일부입니다. 가용성을 우선해 양쪽에서 작업을 진행했다면 충돌 병합과 불변 조건 복구가 필요하고, 일관성을 우선해 요청을 중단했다면 정족수 회복 뒤 대기 중인 요청과 밀린 작업을 처리해야 합니다.

CAP가 주는 실무적 질문은 제품에 `CP`나 `AP`라는 라벨을 붙이는 것이 아니라 **네트워크 분할 중 어떤 작업을 계속 허용하고 어떤 불변 조건 때문에 중단할 것인지 명시하는 것**입니다. 정상 상태의 지연 시간·비용 절충은 이 문제와 별도로 판단해야 합니다.

---
kind: concept
contentKey: backend.core.evolution.api-evolution
topicContentKey: backend.core.evolution
slug: api-evolution
title: "API 변경과 소비자 전환"
summary: "이미 배포된 소비자가 남아 있는 동안 old/new 계약을 어떻게 공존시키고 사용량을 관측해 안전하게 제거할지 rollout 관점에서 API evolution을 설계한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "HTTP representation과 method semantics의 기반 확인"
---
# API 변경과 소비자 전환

앞의 API contract Topic에서는 어떤 변경이 호환성을 깨뜨릴 수 있는지를 다뤘습니다. 운영 단계에서는 한 걸음 더 나아가 **이미 배포된 구버전 소비자가 남아 있는 동안 새 계약으로 어떻게 이동할 것인가**를 설계해야 합니다.

서버와 모든 client를 같은 순간에 바꿀 수 없는 경우가 많습니다.

```text
시간 ─────────────────────────────────────►

old server/client
        │
        ├─ server가 old + new 계약을 함께 지원
        │        ├─ old client 계속 사용
        │        └─ new client 점진 전환
        │
        └─ old 계약 사용량 0 확인
                 │
                 └─ 제거
```

### 추가보다 제거가 더 어렵다

새 optional field를 추가하는 것은 소비자가 unknown field를 허용한다는 전제에서 비교적 쉬울 수 있습니다. 하지만 기존 field나 endpoint를 제거하려면 **누가 아직 사용하는지**를 알아야 합니다.

그래서 deprecation은 문서에 "곧 삭제"라고 적는 것으로 끝나지 않습니다. client version, endpoint 호출량, deprecated field/operation 사용량처럼 실제 사용 여부를 관측할 수 있어야 제거 시점을 결정할 수 있습니다.

### 의미 변경은 새 표현으로 이동시키는 편이 안전하다

기존 `amount`가 "할인 전 금액"인데 앞으로 "최종 결제 금액"을 담도록 바꾸고 싶다면 같은 field 이름의 의미를 조용히 바꾸는 것은 위험합니다.

```text
1. 새 field/operation 추가
2. server가 old/new 표현을 함께 제공
3. consumer 전환
4. old 사용량 관측
5. deprecation 기간 종료
6. old 계약 제거
```

이 과정은 DB schema의 expand/contract와 비슷하지만, API에서는 서버 밖의 소비자 배포 주기까지 포함된다는 점이 다릅니다.

### versioning은 공존 비용을 명시적으로 만든다

`/v2`처럼 새 version을 만들면 breaking change를 분리하기 쉽지만, old/new handler·테스트·문서·운영 지표를 동시에 유지해야 합니다. 따라서 작은 additive change마다 version을 늘리기보다 **실제로 공존하기 어려운 계약 변경인지**를 먼저 판단합니다.

반대로 기존 의미를 보존할 방법이 없고 consumer migration 기간이 필요하다면 명시적 version이 더 정직한 선택일 수 있습니다.

### 호환성은 제거 완료까지 끝난 것이 아니다

새 endpoint가 잘 동작한다고 migration이 끝난 것은 아닙니다. old path를 호출하는 consumer가 남아 있고, rollback 시 다시 old server가 올라올 수 있으며, 문서와 SDK가 이전 계약을 계속 노출할 수도 있습니다.

API evolution의 핵심은 새 형태를 만드는 것이 아니라 **old/new 계약의 공존 기간과 소비자 이동, 관측, 제거 순서를 운영 가능한 절차로 만드는 것**입니다.

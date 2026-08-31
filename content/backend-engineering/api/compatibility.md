---
kind: concept
contentKey: backend.core.api.compatibility
topicContentKey: backend.core.api
slug: compatibility
title: 계약 호환성
summary: API가 한번 외부 소비자에게 배포되면 필드 하나도 단순 내부 구현이 아닐 수 있습니다. 호환성은 컴파일이 되는가보다 기존 소비자가 같은 의미로 계속 동작할 수 있는가를 봅니다.
level: 2
status: PUBLISHED
displayOrder: 30
references:
- url: https://www.rfc-editor.org/rfc/rfc9110
  title: RFC 9110 HTTP Semantics
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: HTTP method, status, representation, idempotence semantics 확인
- url: https://www.rfc-editor.org/rfc/rfc9457
  title: RFC 9457 Problem Details for HTTP APIs
  referenceType: OFFICIAL
  language: en
  displayOrder: 2
  relationNote: 기계가 처리할 수 있는 HTTP error detail 형식과 확장 원칙 확인
---
# 계약 호환성

API가 한번 외부 소비자에게 배포되면 필드 하나도 단순 내부 구현이 아닐 수 있습니다. 호환성은 “컴파일이 되는가”보다 **기존 소비자가 같은 의미로 계속 동작할 수 있는가**를 봅니다.

### 필드 추가도 항상 안전하지 않다

JSON consumer가 unknown field를 무시한다면 optional response field 추가는 보통 호환적입니다. 하지만 client가 response 전체를 strict schema로 검증하거나 enum switch를 exhaustive하게 작성했다면 새로운 값 하나도 장애가 될 수 있습니다.

```json
{
  "status": "PAID"
}
```

여기에 `PARTIALLY_REFUNDED`를 새로 추가하는 것은 server에는 작은 기능이지만 old client의 `switch`가 실패할 수 있습니다.

### 형태보다 의미가 더 위험하다

`totalAmount` 필드 타입을 그대로 두고 의미를 “할인 전 금액”에서 “최종 결제 금액”으로 바꾸면 schema diff에는 드러나지 않지만 semantic breaking change입니다.

### 안전한 진화는 공존 기간을 설계한다

```text
1. 새 필드 추가
2. server가 old/new 필드 모두 제공
3. client migration
4. usage 관측
5. deprecation 공지
6. old 필드 제거
```

DB migration의 expand/contract와 비슷하게 API도 producer와 consumer가 다른 배포 시점에 공존한다는 사실을 전제로 합니다.

### versioning은 만능 해결책이 아니다

`/v2`를 만들면 breaking change를 격리할 수 있지만 두 버전을 운영해야 합니다. 작은 optional extension까지 매번 새 version을 만들면 유지보수 비용이 커집니다. 먼저 additive change, 명시적 deprecation, feature negotiation으로 가능한지 봅니다.

### 계약 테스트가 보는 것

Provider 내부 method가 아니라 실제 HTTP status, JSON field, optionality, enum semantics를 검증해야 합니다. OpenAPI schema도 유용하지만 문서에 담기 어려운 semantic rule은 별도 contract test와 release note가 필요합니다.

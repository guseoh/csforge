---
kind: concept
contentKey: backend.core.api.compatibility
topicContentKey: backend.core.api
slug: compatibility
title: "API 계약 호환성"
summary: "기존 소비자가 의존하는 필드·상태 코드·정렬·의미를 깨지 않으면서 API를 단계적으로 확장하고, additive change와 breaking change를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
- url: https://www.rfc-editor.org/rfc/rfc9110
  title: RFC 9110 HTTP Semantics
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: HTTP representation과 응답 semantics의 기본 계약 확인
- url: https://www.rfc-editor.org/rfc/rfc9457
  title: RFC 9457 Problem Details for HTTP APIs
  referenceType: OFFICIAL
  language: en
  displayOrder: 2
  relationNote: 확장 가능한 HTTP 오류 representation의 표준 구조 확인
---
# API 계약 호환성

API가 외부 소비자에게 배포된 뒤에는 응답 필드 하나도 단순한 내부 구현이 아닐 수 있습니다. 호환성을 볼 때는 서버 코드가 컴파일되는지가 아니라 **기존 소비자가 같은 의미로 계속 동작할 수 있는가**를 봐야 합니다.

### 형태가 같아도 의미가 바뀌면 breaking change가 될 수 있다

```json
{
  "totalAmount": 12000
}
```

`totalAmount`의 타입과 이름을 그대로 두고 의미를 "할인 전 금액"에서 "최종 결제 금액"으로 바꾸면 schema diff만으로는 변화가 잘 보이지 않습니다. 하지만 기존 소비자가 이 값을 회계나 화면 계산에 사용하고 있다면 실제 계약은 깨집니다.

따라서 API 계약에는 필드 존재 여부뿐 아니라 **값의 의미, 단위, nullable 여부, 정렬 순서, 상태 전이 의미**도 포함됩니다.

### 필드 추가도 소비자 가정에 따라 위험할 수 있다

JSON 소비자가 모르는 필드를 무시한다면 선택 응답 필드 추가는 일반적으로 비교적 안전한 변경입니다. 하지만 소비자가 응답 전체를 strict schema로 검증하거나 enum 값을 exhaustive하게 처리한다면 다음과 같은 추가도 실패를 만들 수 있습니다.

```json
{
  "status": "PARTIALLY_REFUNDED"
}
```

서버 입장에서는 enum 값 하나를 추가한 것이지만, 기존 클라이언트가 `PAID`, `REFUNDED` 두 값만 존재한다고 가정했다면 런타임 오류가 생길 수 있습니다.

### 안전한 진화는 이전 계약과 새 계약의 공존 기간을 설계한다

필드 교체가 필요하다면 한 번에 삭제·변경하기보다 다음처럼 단계적으로 진행할 수 있습니다.

```text
1. 새 필드 추가
2. 일정 기간 old/new 필드 모두 제공
3. 소비자 전환
4. 실제 사용 여부 관측
5. 기존 필드 deprecated 공지
6. 안전한 시점에 제거
```

DB migration의 expand/contract와 비슷하게 API도 producer와 consumer가 서로 다른 시점에 배포될 수 있다는 전제가 필요합니다.

### 버전 증가는 모든 변경의 기본 답이 아니다

`/v2`처럼 새 버전을 만들면 큰 breaking change를 격리할 수 있지만, 동시에 두 계약을 운영하고 문서·테스트·지원 정책을 유지해야 합니다. 선택 필드 추가나 기존 의미를 보존하는 확장까지 매번 새 버전으로 분리하면 운영 비용이 커집니다.

먼저 additive change, 명시적 deprecation, 공존 기간으로 해결 가능한지 보고, 기존 의미를 유지하기 어려운 큰 변화에서 별도 버전을 검토하는 편이 낫습니다.

### 계약 테스트는 구현 메서드가 아니라 외부에서 보이는 결과를 검증한다

API 호환성 테스트는 내부 service method 호출 횟수보다 다음과 같은 관찰 가능한 계약을 확인해야 합니다.

- HTTP 상태 코드
- JSON 필드와 nullable 여부
- enum 값과 의미
- 목록 정렬과 페이지네이션 규칙
- 오류 코드와 응답 구조

OpenAPI 같은 schema 문서는 구조적 계약을 관리하는 데 유용하지만 "이 금액이 어떤 시점의 값인가"처럼 schema만으로 충분히 표현하기 어려운 의미도 있습니다. 이런 의미 규칙은 contract test, 문서, deprecation 정책과 함께 관리해야 합니다.

API 호환성의 핵심은 모든 변경을 금지하는 것이 아니라 **기존 소비자가 무엇에 의존하는지 파악하고, 그 의존을 깨는 변화가 필요할 때 전환 경로를 함께 설계하는 것**입니다.

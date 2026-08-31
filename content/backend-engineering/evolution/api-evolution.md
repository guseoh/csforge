---
kind: concept
contentKey: backend.core.evolution.api-evolution
topicContentKey: backend.core.evolution
slug: api-evolution
title: "API evolution과 소비자 호환성"
summary: "API 변경을 서버 내부 리팩터링이 아니라 이미 배포된 소비자와의 계약 변경으로 다룬다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "HTTP representation과 method semantics의 기반을 확인한다."
---
# API evolution과 소비자 호환성

서버 메서드 이름을 바꾸는 것은 내부 리팩터링일 수 있지만, response field를 삭제하거나 의미를 바꾸는 것은 이미 배포된 클라이언트를 깨뜨릴 수 있는 계약 변경이다. API evolution은 코드가 컴파일되는지가 아니라 **구버전 소비자가 새 서버와 계속 통신할 수 있는가**를 본다.

### additive change가 상대적으로 안전하다

```json
// before
{ "id": 10, "name": "A" }

// after
{ "id": 10, "name": "A", "status": "ACTIVE" }
```

클라이언트가 알 수 없는 필드를 무시한다는 계약이면 새 필드 추가는 비교적 안전하다. 반면 기존 `name` 삭제, type 변경, enum 값 추가는 소비자 구현에 따라 breaking change가 될 수 있다.

### 의미가 바뀌면 같은 필드명이어도 breaking이다

`amount`가 원 단위였는데 갑자기 센트 단위가 되는 것처럼 wire shape가 같아도 의미를 바꾸면 더 위험하다. API contract에는 type뿐 아니라 unit, nullability, ordering, error semantics가 포함된다.

### versioning은 마지막 수단이 아니라 비용 모델이다

`/v2`를 만드는 것은 기존 소비자를 살릴 수 있지만 두 버전의 운영·테스트·문서 비용을 만든다. 가능한 경우 additive transition과 deprecation 기간을 사용하고, 실제로 호환을 유지할 수 없는 변경일 때 명시적 version을 검토한다.

```text
old client ─┐
            ├─ compatible server period
new client ─┘
```

좋은 API 변경은 새 기능 구현만 설명하지 않고 **누가 현재 계약을 사용 중이며 어떤 순서로 소비자를 이동시킬지**까지 포함한다.

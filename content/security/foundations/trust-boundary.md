---
kind: concept
contentKey: security.core.foundations.trust-boundary
topicContentKey: security.core.foundations
slug: trust-boundary
title: "Trust boundary와 입력 검증 책임"
summary: "브라우저·외부 API·파일·DB projection 등 신뢰 수준이 다른 경계를 넘어오는 데이터를 다시 검증해야 하는 이유와 client-side validation을 보안 경계로 볼 수 없는 이유를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Input Validation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: server-side validation과 allowlist 중심 입력 검증 원칙 확인
---
# Trust boundary와 입력 검증 책임

프론트엔드가 이미 validation을 했으니 backend는 같은 값을 다시 확인하지 않아도 된다고 생각하면 신뢰 경계를 잘못 잡은 것입니다. 공격자는 브라우저 UI를 거치지 않고 HTTP 요청을 직접 만들 수 있습니다.

```text
사용자 Browser
     │  JSON / Header / Cookie
     ▼
──────────── Trust Boundary ────────────
     ▼
Backend API
```

Boundary를 넘는 순간 “이 값은 우리가 기대한 형식과 의미인가?”를 서버가 다시 확인해야 합니다.

### 입력의 출처가 내부 코드처럼 보여도 경계를 확인한다

외부 결제 API response도 우리가 통제하지 않는 데이터입니다.

```text
Backend ── request ──► Payment Provider
Backend ◄─ response ── Payment Provider
              │
              └─ status / amount / signature / schema 검증 필요
```

외부 시스템 장애나 계약 변경, compromised upstream까지 고려하면 “서버끼리 통신하니 신뢰”라고 단정할 수 없습니다.

### validation은 한 층에서 끝나지 않는다

```text
HTTP parser / DTO validation
        │  형식, 길이, 허용 값
        ▼
Application / Domain
        │  business invariant, 현재 상태
        ▼
Persistence / DB constraint
           uniqueness, FK, check
```

예를 들어 `quantity=3`이 정수인지 확인하는 것은 API validation이고, 현재 재고보다 작은지는 domain/use-case 규칙이며, quantity가 음수로 저장되지 않는 최종 하한선은 DB CHECK로 보강할 수 있습니다.

### client가 보내는 identity도 그대로 신뢰하지 않는다

```json
{
  "memberId": 999,
  "orderId": 123
}
```

로그인 사용자가 `memberId`를 바꿔 다른 사람 행위를 시도할 수 있으므로 ownership이 필요한 작업에서는 authentication principal에서 현재 사용자 identity를 얻고 resource와 비교합니다.

Trust boundary는 network firewall 하나를 뜻하지 않습니다. **데이터의 통제권이 바뀌는 지점마다 무엇을 다시 검증할지 결정하는 사고 도구**입니다.

---
kind: concept
contentKey: security.core.foundations.trust-boundary
topicContentKey: security.core.foundations
slug: trust-boundary
title: "신뢰 경계와 입력 검증 책임"
summary: "브라우저·외부 API·파일처럼 통제권이 다른 곳에서 들어온 데이터를 서버가 다시 검증해야 하는 이유와 신뢰 경계를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Input Validation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "서버 측 검증과 허용 목록 중심의 입력 검증 원칙 확인"
---
# 신뢰 경계와 입력 검증 책임

프론트엔드가 이미 검증을 했으니 백엔드는 같은 값을 다시 확인하지 않아도 된다고 생각하면 신뢰 경계를 잘못 잡은 것입니다. 공격자는 브라우저 UI를 거치지 않고 HTTP 요청을 직접 만들 수 있습니다.

```text
사용자 브라우저
     │  JSON / 헤더 / 쿠키
     ▼
──────────── 신뢰 경계 ────────────
     ▼
백엔드 API
```

신뢰 경계를 넘은 값은 서버가 기대한 형식과 의미에 맞는지 다시 확인해야 합니다.

### 입력의 출처가 내부 코드처럼 보여도 경계를 확인한다

외부 결제 API 응답도 우리가 통제하지 않는 데이터입니다.

```text
백엔드 ── 요청 ──► 결제 서비스
백엔드 ◄─ 응답 ── 결제 서비스
              │
              └─ 상태 / 금액 / 서명 / 스키마 검증 필요
```

외부 시스템의 장애·계약 변경·침해 가능성까지 고려하면 서버끼리 통신한다는 이유만으로 응답을 신뢰할 수 없습니다.

### 검증은 한 층에서 끝나지 않는다

```text
HTTP 파서 / DTO 검증
        │  형식, 길이, 허용 값
        ▼
애플리케이션 / 도메인
        │  업무 불변식, 현재 상태
        ▼
영속성 / DB 제약
           고유성, 외래 키, CHECK 제약
```

`quantity=3`이 정수인지 확인하는 것은 API 입력 검증입니다. 주문 수량이 현재 재고 이내인지는 유스케이스 규칙이고, 음수 수량의 저장을 막는 마지막 제약은 DB의 `CHECK`로 보강할 수 있습니다.

### 클라이언트가 보내는 신원도 그대로 신뢰하지 않는다

```json
{
  "memberId": 999,
  "orderId": 123
}
```

로그인 사용자가 요청의 `memberId`를 바꿔 보낼 수 있습니다. 소유권이 필요한 작업에서는 서버가 인증한 주체의 사용자 ID를 얻어 리소스 소유자와 비교합니다.

신뢰 경계는 네트워크 방화벽만 뜻하지 않습니다. **데이터의 통제권이 바뀌는 지점에서 무엇을 다시 검증해야 하는지** 나타냅니다.

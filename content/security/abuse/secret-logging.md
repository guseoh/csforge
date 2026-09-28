---
kind: concept
contentKey: security.core.abuse.secret-logging
topicContentKey: security.core.abuse
slug: secret-logging
title: "로그의 비밀정보·토큰 노출과 운영 위험"
summary: "로그에 비밀번호·세션 쿠키·토큰·API 키가 남으면 이를 읽은 사람이 자격 증명을 재사용할 수 있으므로, 원문 수집을 피하고 민감정보 제거와 접근 제한을 적용한다."
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Logging"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "비밀번호·토큰·세션 식별자 등을 로그에서 제외하거나 가리는 원칙 확인"
---
# 로그의 비밀정보·토큰 노출과 운영 위험

보안 기능을 제대로 구현하고도 로그 한 줄 때문에 자격 증명이 유출될 수 있습니다.

```text
디버그 기록에 남은 요청 헤더:
Authorization: Bearer eyJhbGciOi...
Cookie: SESSION=S123...
```

운영 로그를 보는 사람이나 외부 로그 SaaS가 이 값을 읽을 수 있다면 토큰이 아직 유효한 동안 그대로 재사용할 수 있습니다.

### 로그도 운영 데이터를 저장한다

애플리케이션 DB보다 접근 통제가 느슨하거나 보관 기간이 길고, 여러 시스템으로 복제될 수도 있습니다.

```text
애플리케이션
   │ 표준 출력/파일
   ▼
로그 수집기
   │
   ├─ 중앙 검색
   ├─ 알림
   ├─ 보관소
   └─ 외부 SaaS
```

한 번 비밀정보가 로그에 들어가면 여러 복사본에서 삭제하기 어렵습니다.

### 기본적으로 남기지 않아야 할 값

- 비밀번호 / 비밀번호 해시
- `Authorization` 헤더의 소지한 사람이 그대로 사용할 수 있는 토큰
- 세션 쿠키와 세션 ID 전체
- 비밀번호 재설정 토큰
- API 키와 개인 키
- 결제 관련 민감정보

운영상 구분이 필요하면 노출을 최소화한 식별 정보나 단방향 지문을 사용합니다.

```text
apiKeyFingerprint=sha256:ab12...
```

### 예외 로그도 유출 경로가 될 수 있다

HTTP 클라이언트 예외의 `toString()`에 요청·응답 본문 전체가 담기거나 DB 오류에 쿼리 매개변수가 출력될 수 있습니다. 공통 요청 로거뿐 아니라 SDK와 HTTP 클라이언트의 오류 로그도 확인해야 합니다.

### 민감하지 않은 진단 정보는 충분히 남긴다

비밀정보를 제외하면서도 진단에 필요한 정보는 남길 수 있습니다.

```text
requestId=R123
actorMemberId=42
작업=ORDER_CANCEL
결과=DENIED
reason=NOT_OWNER
```

이런 구조화된 이벤트는 보안 사고를 조사할 때 유용하면서 자격 증명 자체는 노출하지 않습니다.

### 민감정보 제거 결과를 테스트한다

테스트용 토큰과 비밀번호를 넣어 실제 로그 출력에 원문이 남는지 확인합니다. 개발자의 주의에만 의존하지 말고 자동 제거 규칙을 검증해야 합니다.

로그도 신뢰 경계를 넘어 오래 보관될 수 있는 데이터입니다. 필요한 진단 정보만 남기고 비밀정보 원문은 수집하지 않는 것이 핵심입니다.

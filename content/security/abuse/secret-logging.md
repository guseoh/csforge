---
kind: concept
contentKey: security.core.abuse.secret-logging
topicContentKey: security.core.abuse
slug: secret-logging
title: "Secret·token logging과 운영 데이터 노출"
summary: "Authorization header·session cookie·password·reset token·API key가 debug/error/access log에 들어가면 log reader가 credential을 재사용할 수 있으므로 structured redaction과 최소 수집을 적용한다."
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Logging"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: authentication password/token/session identifier 등 로그 제외·마스킹 원칙 확인
---
# Secret·token logging과 운영 데이터 노출

보안 기능을 제대로 구현하고도 log 한 줄 때문에 credential이 유출될 수 있습니다.

```text
DEBUG request headers:
Authorization: Bearer eyJhbGciOi...
Cookie: SESSION=S123...
```

운영 log를 보는 사람이나 외부 log SaaS가 이 값을 읽을 수 있다면 token이 아직 유효한 동안 그대로 재사용할 수 있습니다.

### log는 production data store다

Application DB보다 접근 통제가 느슨하고 retention이 길며 여러 시스템으로 복제될 수 있습니다.

```text
Application
   │ stdout/file
   ▼
Log collector
   │
   ├─ central search
   ├─ alerting
   ├─ archive
   └─ third-party SaaS
```

한 번 secret이 로그에 들어가면 여러 복사본에서 삭제하기 어렵습니다.

### 기본적으로 남기지 않아야 할 값

- password / password hash
- Authorization bearer token
- session cookie/session ID 전체
- password reset token
- API key / private key
- payment sensitive data

필요하면 마지막 몇 글자나 stable fingerprint만 남겨 어떤 key인지 구분합니다.

```text
apiKeyFingerprint=sha256:ab12...
```

### exception logging도 leakage 경로다

HTTP client exception이 request/response body 전체를 `toString()`에 포함하거나 DB error가 query parameter를 출력할 수 있습니다. 공통 request logger뿐 아니라 SDK/client error logging도 검토해야 합니다.

### 민감하지 않은 진단 정보는 충분히 남긴다

Secret을 모두 제거한다고 로그를 쓸모없게 만들 필요는 없습니다.

```text
requestId=R123
actorMemberId=42
action=ORDER_CANCEL
result=DENIED
reason=NOT_OWNER
```

이런 구조화된 event는 보안 incident 조사에 유용하면서 credential 자체를 노출하지 않습니다.

### redaction은 테스트한다

Sample token/password를 넣은 integration/log capture test로 실제 appender 결과에 secret이 없는지 검증할 수 있습니다. “개발자가 안 찍을 것”이라는 규칙보다 자동 filter와 test가 강합니다.

Secret logging의 핵심은 log도 신뢰 경계를 넘는 **지속성 있는 데이터 파이프라인**이라는 사실을 인정하고 필요한 진단 정보만 남기는 것입니다.

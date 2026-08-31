---
kind: concept
contentKey: security.core.session-cookie.fixation-expiration
topicContentKey: security.core.session-cookie
slug: fixation-expiration
title: "Session fixation·ID 교체·만료"
summary: "로그인 전 공격자가 알고 있던 session ID를 인증 후에도 그대로 사용하면 생기는 fixation 위험과 authentication 시 ID rotation, idle/absolute timeout, logout invalidation lifecycle을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html#ns-session-fixation"
    title: "Spring Security Reference: Session Fixation Protection"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: authentication 성공 시 session fixation protection 전략 확인
---
# Session fixation·ID 교체·만료

Session hijacking은 이미 로그인된 session ID를 훔치는 공격이고, session fixation은 **공격자가 미리 알고 있는 session ID를 피해자가 로그인 후에도 계속 쓰게 만드는 공격**입니다.

### ID를 고정시킨 뒤 피해자가 로그인하게 한다

```text
Attacker obtains/sets session ID = X
        │
        └────► Victim browser uses X
                    │
                    ▼
                 로그인 성공
                    │
      서버가 session ID를 X 그대로 유지
                    │
                    ▼
Attacker already knows X → authenticated session 재사용
```

그래서 authentication privilege가 크게 바뀌는 시점에는 session ID를 교체하는 것이 중요합니다. Spring Security는 session fixation protection을 제공하며 설정에 따라 기존 session attributes를 유지하면서 ID를 변경할 수 있습니다.

### 만료에도 서로 다른 시간 기준이 있다

```text
idle timeout    : 마지막 활동 후 N분 동안 요청 없으면 만료
absolute timeout: 로그인 후 최대 N시간이 지나면 활동 여부와 무관하게 재인증
```

민감 서비스는 둘을 함께 검토할 수 있습니다. 너무 짧으면 UX가 나쁘고 너무 길면 탈취된 session의 유효 시간이 늘어납니다.

### logout은 화면 이동이 아니라 server state 폐기다

프론트에서 `/login` 화면으로 이동하는 것만으로 session이 끝난 것은 아닙니다. 서버 session을 invalidate하고 cookie 삭제/만료를 적용해야 합니다.

```text
Logout
  ├─ server session invalidate
  ├─ SecurityContext 제거
  └─ browser session cookie 만료
```

### password 변경이나 계정 차단 시 기존 session을 어떻게 할지도 정책이다

Credential이 변경되었는데 모든 기존 session을 그대로 유지할지, 민감한 action에서 재인증을 요구할지, 강제 logout을 할지 product threat model에 따라 결정합니다.

Session lifecycle의 핵심은 ID 한 번 발급이 아니라 **권한이 생기는 순간 교체하고, 필요한 시간만 유지하며, 종료 시 server와 client 양쪽 상태를 확실히 끊는 것**입니다.

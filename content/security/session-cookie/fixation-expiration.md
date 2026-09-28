---
kind: concept
contentKey: security.core.session-cookie.fixation-expiration
topicContentKey: security.core.session-cookie
slug: fixation-expiration
title: "세션 고정(session fixation)·ID 교체·만료"
summary: "공격자가 미리 알고 있는 세션 ID를 로그인 뒤에도 사용하게 하는 세션 고정 공격과, 로그인 시 ID 교체·만료·로그아웃 무효화의 관계를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html#ns-session-fixation"
    title: "Spring Security Reference: Session Fixation Protection"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "인증 성공 시 세션 고정 방어 전략 확인"
---
# 세션 고정(session fixation)·ID 교체·만료

세션 탈취는 이미 로그인된 세션 ID를 훔치는 공격이고, 세션 고정은 **공격자가 미리 알고 있는 세션 ID를 피해자가 로그인 후에도 계속 쓰게 만드는 공격**입니다.

### ID를 고정시킨 뒤 피해자가 로그인하게 한다

```text
공격자가 세션 ID = X를 준비
        │
        └────► 피해자 브라우저가 X를 사용
                    │
                    ▼
                 로그인 성공
                    │
      서버가 세션 ID를 X 그대로 유지
                    │
                    ▼
공격자는 X를 알고 있음 → 로그인된 세션 재사용
```

그래서 로그인처럼 인증 상태가 바뀌는 시점에는 세션 ID를 교체해야 합니다. Spring Security는 세션 고정 방어 기능을 제공하며, 설정에 따라 기존 세션 속성을 유지하면서 ID를 변경할 수 있습니다.

### 만료에도 서로 다른 시간 기준이 있다

```text
유휴 시간 제한: 마지막 활동 후 N분 동안 요청이 없으면 만료
절대 시간 제한: 로그인 후 N시간이 지나면 활동 여부와 무관하게 재인증
```

민감한 서비스를 운영한다면 두 제한을 함께 검토할 수 있습니다. 너무 짧으면 사용하기 불편하고 너무 길면 탈취된 세션이 오래 유효합니다.

### 로그아웃은 화면 이동이 아니라 서버 상태 폐기다

프론트엔드에서 `/login` 화면으로 이동하는 것만으로 세션이 끝나지는 않습니다. 서버 세션을 무효화하고 브라우저의 세션 쿠키를 만료해야 합니다.

```text
로그아웃
  ├─ 서버 세션 무효화
  ├─ SecurityContext 제거
  └─ 브라우저 세션 쿠키 만료
```

### 비밀번호 변경이나 계정 차단 시 기존 세션을 어떻게 할지도 정책이다

비밀번호가 변경되었을 때 기존 세션을 유지할지, 민감한 작업에서 재인증을 요구할지, 모든 세션을 종료할지는 서비스의 위협 모델에 따라 결정합니다.

세션 수명주기의 핵심은 **로그인할 때 ID를 교체하고, 필요한 시간만 유지하며, 종료할 때 서버 세션과 브라우저 쿠키를 함께 처리하는 것**입니다.

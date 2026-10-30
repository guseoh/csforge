---
kind: concept
contentKey: security.core.password.work-factor
topicContentKey: security.core.password
slug: work-factor
title: "비밀번호 검증 비용(work factor)과 로그인 부하"
summary: "비밀번호 해시의 계산 비용을 조정해 오프라인 추측 공격의 비용을 높이면서도 정상 로그인 지연과 서버 자원 사용을 관리하는 방법을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Password Storage"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Argon2id·bcrypt의 작업 비용과 상향 조정 지침 확인"
  - url: "https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html"
    title: "Spring Security Reference: Password Storage"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "적응형 단방향 함수와 DelegatingPasswordEncoder 확인"
---
# 비밀번호 검증 비용(work factor)과 로그인 부하

비밀번호 해시는 공격자가 많은 후보를 빠르게 시험하기 어렵도록 계산 비용을 높입니다. 하지만 정상 로그인도 같은 검증을 수행하므로 비용을 무조건 크게 잡을 수는 없습니다.

OWASP는 새 시스템에 Argon2id를 우선 권고하고, 환경에 따라 scrypt나 PBKDF2를 대안으로 제시합니다. bcrypt는 주로 기존 시스템에서 다룹니다. 어떤 방식을 사용하든 메모리와 반복 횟수 등의 매개변수는 현재 하드웨어에서 측정해 정해야 합니다.

```text
검증 비용이 너무 낮음
→ 오프라인 비밀번호 추측 비용이 낮음

검증 비용이 지나치게 높음
→ 정상 로그인 지연·CPU 및 메모리 사용량 증가
→ 대량 인증 요청에 대한 자원 고갈 위험 증가
```

공격자가 유출된 DB로 수행하는 **오프라인 비밀번호 추측**과 로그인 엔드포인트를 반복 호출하는 **온라인 공격**을 구분해야 합니다. 작업 비용(work factor)은 오프라인 추측의 비용을 높이고, 요청 속도 제한이나 다중 요소 인증(MFA)은 온라인 공격을 제한합니다.

하드웨어 성능과 권고 수준은 시간이 지나며 변하므로 저장된 해시 형식과 비용도 높일 수 있어야 합니다. 로그인에 성공했을 때 기존 해시가 현재 정책보다 약하면, 그 시점에 입력받은 비밀번호를 새 매개변수로 다시 해시해 저장할 수 있습니다.

Spring Security의 `DelegatingPasswordEncoder`처럼 여러 인코딩 형식을 식별하는 구조는 기존 해시를 새 방식으로 점진적으로 전환하는 데 도움이 됩니다.

작업 비용은 고정된 값이 아닙니다. **정상 인증 비용을 감당하면서 공격자의 비밀번호 추측 비용을 충분히 높이도록 현재 환경에서 정하는 보안 매개변수**입니다.

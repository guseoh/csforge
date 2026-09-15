---
kind: concept
contentKey: security.core.password.work-factor
topicContentKey: security.core.password
slug: work-factor
title: "Work factor와 로그인 검증 비용"
summary: "password hashing을 공격자에게 비싸게 만들면서 정상 로그인 지연 시간과 서버 자원 고갈을 감당할 수 있도록 cost parameter를 측정·조정하고 알고리즘 upgrade를 계획한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Password Storage"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Argon2id/bcrypt work factor와 upgrade guidance 확인
  - url: "https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html"
    title: "Spring Security Reference: Password Storage"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: adaptive one-way function과 DelegatingPasswordEncoder 확인
---
# Work factor와 로그인 검증 비용

Password hashing은 공격자가 많은 후보를 빠르게 시험하기 어렵도록 의도적으로 계산 비용을 높입니다. 하지만 정상 로그인도 같은 verifier 계산을 수행하므로 cost를 무조건 크게 잡을 수는 없습니다.

OWASP는 새 시스템에서 Argon2id를 우선 권고하고, 환경에 따라 scrypt나 PBKDF2를 사용하며 bcrypt는 주로 legacy 환경에서 다룹니다. 어떤 scheme을 사용하든 memory·iteration·cost 같은 parameter는 현재 hardware에서 측정해 정해야 합니다.

```text
work factor가 너무 낮음
→ offline cracking 비용이 낮음

work factor가 지나치게 높음
→ 정상 로그인 latency·CPU/memory 비용 증가
→ 대량 인증 요청에 대한 자원 고갈 위험 증가
```

중요한 것은 공격자가 DB dump를 얻은 뒤 수행하는 **offline guessing**과 서비스 login endpoint를 반복 호출하는 **online attack**을 구분하는 것입니다. Work factor는 offline guessing을 비싸게 만들고, rate limiting이나 MFA는 online 공격을 제한하는 별도 방어입니다.

Hardware 성능과 권고 수준은 시간이 지나며 변하므로 저장된 hash format과 cost도 upgrade할 수 있어야 합니다. 로그인 성공 시 기존 verifier가 현재 정책보다 약한지 확인하고, raw password를 이미 검증한 그 시점에 새 parameter로 다시 hash해 저장하는 방식이 대표적입니다.

Spring Security의 `DelegatingPasswordEncoder`처럼 여러 encoded format을 식별할 수 있는 구조는 legacy verifier와 새 scheme을 점진적으로 전환하는 데 도움을 줍니다.

Work factor는 고정된 마법의 숫자가 아니라 **정상 인증 비용을 감당할 수 있으면서 공격자의 password guessing 비용을 충분히 높이는 현재 환경의 security parameter**입니다.

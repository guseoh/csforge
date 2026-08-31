---
kind: concept
contentKey: security.core.password.work-factor
topicContentKey: security.core.password
slug: work-factor
title: "Work factor와 로그인 검증 비용"
summary: "password hashing을 공격자에게 비싸게 만들면서 정상 로그인 latency와 서버 자원 고갈을 감당할 수 있도록 cost parameter를 측정·조정하고 알고리즘 upgrade를 계획한다."
level: 1
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

Password hash는 느릴수록 공격자의 brute-force 비용을 높일 수 있지만 서버도 같은 비용을 지불합니다. 로그인 한 번이 3초 걸리거나 공격자가 로그인 endpoint를 대량 호출해 CPU를 고갈시킬 수 있다면 설정이 현실적인 서비스 요구와 맞지 않습니다.

### 공격자와 서버가 같은 계산을 한다

```text
정상 로그인 1회
raw password → expensive hash → verify

공격자 offline cracking
candidate 1 → expensive hash
candidate 2 → expensive hash
candidate 3 → expensive hash
...
```

우리는 정상 사용자는 가끔 로그인하지만 공격자는 수십억 후보를 시험해야 한다는 차이를 이용합니다.

### work factor는 측정해서 정한다

bcrypt의 cost, PBKDF2 iteration, Argon2의 memory/time parameter는 hardware와 traffic에 맞춰 조정합니다. OWASP 권고를 출발점으로 삼되 실제 production instance에서 로그인 latency와 CPU/memory 사용을 측정해야 합니다.

| 너무 낮음                 | 너무 높음                |
| ------------------------- | ------------------------ |
| offline cracking이 쉬워짐 | 정상 로그인 latency 증가 |
| 오래된 hardware 기준 설정 | DoS 자원 고갈 위험 증가  |

### 알고리즘과 cost는 시간이 지나면 낡는다

몇 년 뒤 hardware가 빨라지면 기존 cost가 부족할 수 있습니다. 로그인 성공 시 기존 hash format/cost를 확인해 더 강한 scheme으로 rehash하는 migration 전략을 사용할 수 있습니다.

```text
login success
   │
   ├─ encoded format 최신 → 그대로 사용
   └─ 오래된 format/cost → 새 hash로 교체 저장
```

Spring Security의 `DelegatingPasswordEncoder`는 여러 `{id}` format을 구분해 legacy verifier와 새 encoder를 함께 운영하는 데 도움을 줄 수 있습니다.

### rate limiting과 MFA는 다른 층이다

느린 hash는 DB dump 이후 offline cracking 비용을 높이고, rate limit은 online login 반복 시도를 제한합니다. 서로 대체 관계가 아닙니다.

Work factor는 한 번 정하고 잊는 숫자가 아니라 **현재 hardware에서 정상 사용자 비용과 공격 비용 사이 간격을 유지하는 운영 parameter**입니다.

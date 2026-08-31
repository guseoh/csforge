---
kind: concept
contentKey: security.core.password.plaintext
topicContentKey: security.core.password
slug: plaintext
title: "비밀번호를 복호화 가능한 형태로 저장하면 안 되는 이유"
summary: "비밀번호는 사용자가 다시 조회해야 하는 데이터가 아니라 로그인 시 검증해야 하는 secret이므로 plaintext·reversible encryption 대신 password hashing verifier를 저장해야 하는 이유를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Password Storage"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: password hashing과 encryption 차이, Argon2id/bcrypt 권고 확인
---
# 비밀번호를 복호화 가능한 형태로 저장하면 안 되는 이유

서비스는 사용자의 원래 비밀번호를 다시 보여 줄 필요가 없습니다. 로그인 시 **입력한 비밀번호가 가입 때의 비밀번호와 같은지 검증**하면 됩니다. 따라서 원문을 보관하거나 복호화 가능한 encryption으로 저장하면 DB와 key가 침해되었을 때 원문 credential이 대량 노출될 위험이 커집니다.

### 저장하는 것은 비밀번호가 아니라 verifier다

```text
가입
raw password
    │
    ▼
password hashing function + salt
    │
    ▼
encoded verifier 저장

로그인
raw input ── matches ── stored verifier
```

`PasswordEncoder.matches(raw, encoded)` 같은 API는 저장 hash를 복호화하지 않습니다. 입력에 같은 password hashing scheme을 적용해 검증합니다.

### 일반 fast hash 하나로는 부족하다

```text
SHA-256(password)
```

같은 방식은 매우 빠르기 때문에 공격자도 GPU/ASIC으로 후보 비밀번호를 대량 시험하기 쉽습니다. Password hashing은 의도적으로 계산 비용을 높일 수 있는 Argon2id, scrypt, bcrypt, PBKDF2 같은 scheme을 사용합니다.

### 침해를 가정한 설계다

“DB는 외부에서 접근 못 하니 plaintext도 괜찮다”가 아니라 DB dump가 유출되어도 공격자가 즉시 모든 password를 얻지 못하도록 방어 층을 둡니다. 사용자가 다른 서비스에서도 같은 password를 재사용했다면 피해는 현재 서비스 밖으로 확산될 수 있습니다.

### password reset도 원문 복구가 아니다

비밀번호를 잊었을 때 기존 비밀번호를 이메일로 보내 주는 기능이 있다면 서버가 원문을 갖고 있다는 신호입니다. 안전한 흐름은 short-lived reset token 등으로 사용자가 **새 비밀번호를 설정**하게 하는 방식입니다.

Password storage의 목적은 “암호화 기술을 적용했다”가 아니라 **credential database가 유출되어도 offline cracking 비용을 크게 만드는 것**입니다.

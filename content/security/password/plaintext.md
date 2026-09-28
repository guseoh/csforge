---
kind: concept
contentKey: security.core.password.plaintext
topicContentKey: security.core.password
slug: plaintext
title: "비밀번호를 복호화 가능한 형태로 저장하면 안 되는 이유"
summary: "비밀번호는 원문을 다시 읽는 데이터가 아니라 로그인 때 검증하는 비밀정보이므로, 평문이나 복호화 가능한 암호문 대신 전용 비밀번호 해시를 저장해야 하는 이유를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Password Storage"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "비밀번호 해시와 암호화의 차이 및 Argon2id·bcrypt 권고 확인"
---
# 비밀번호를 복호화 가능한 형태로 저장하면 안 되는 이유

서비스는 사용자의 원래 비밀번호를 다시 보여 줄 필요가 없습니다. 로그인 시 **입력한 비밀번호가 가입 때의 비밀번호와 같은지 검증**하면 됩니다. 따라서 원문을 보관하거나 복호화 가능한 방식으로 저장하면 DB와 복호화 키가 함께 침해되었을 때 원문 비밀번호가 대량 노출될 위험이 커집니다.

### 저장하는 것은 비밀번호가 아니라 검증자다

```text
가입
원문 비밀번호
    │
    ▼
비밀번호 해시 함수 + 솔트
    │
    ▼
인코딩된 검증 값 저장

로그인
원문 입력 ── matches ── 저장된 검증 값
```

`PasswordEncoder.matches(raw, encoded)` 같은 API는 저장 해시를 복호화하지 않습니다. 입력에 같은 비밀번호 해시 처리 스킴을 적용해 검증합니다.

### 일반 fast 해시 하나로는 부족하다

```text
SHA-256(비밀번호)
```

같은 방식은 매우 빠르기 때문에 공격자도 GPU나 ASIC으로 후보 비밀번호를 대량 시험하기 쉽습니다. 비밀번호 저장에는 계산 비용을 조절할 수 있는 Argon2id, scrypt, bcrypt, PBKDF2 같은 전용 해시 방식을 사용합니다.

### 침해를 가정한 설계다

“DB는 외부에서 접근하지 못하니 평문으로 저장해도 괜찮다”는 생각은 위험합니다. DB 백업이 유출되어도 공격자가 즉시 모든 비밀번호를 얻지 못하도록 해야 합니다. 사용자가 다른 서비스에서도 같은 비밀번호를 재사용했다면 피해가 확산될 수 있습니다.

### 비밀번호 재설정도 원문 복구가 아니다

비밀번호를 잊었을 때 기존 비밀번호를 이메일로 보내 주는 기능이 있다면 서버가 원문을 보관한다는 신호입니다. 안전한 방식은 유효 기간이 짧은 재설정 토큰 등을 사용해 사용자가 **새 비밀번호를 설정**하게 하는 것입니다.

안전한 비밀번호 저장의 목적은 **자격 증명 DB가 유출되어도 오프라인 비밀번호 추측에 드는 비용을 크게 만드는 것**입니다.

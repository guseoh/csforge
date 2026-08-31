---
kind: concept
contentKey: security.core.password.salt-hash
topicContentKey: security.core.password
slug: salt-hash
title: "Salt와 password hash"
summary: "사용자별 random salt가 같은 비밀번호의 같은 hash를 피하고 precomputed rainbow-table 재사용을 어렵게 만드는 이유와 salt가 secret key가 아니라 hash와 함께 저장되는 값임을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#salting"
    title: "OWASP Password Storage Cheat Sheet: Salting"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: modern password hashing library의 per-password salt 사용 확인
---
# Salt와 password hash

두 사용자가 같은 `password123`을 사용한다고 해 봅시다. salt 없이 같은 hash function만 적용하면 저장 값도 같습니다.

```text
password123 ─ hash ─► ABC...
password123 ─ hash ─► ABC...
```

공격자는 DB dump만 보고 두 계정이 같은 password를 쓴다는 사실을 알 수 있고, 미리 계산한 hash table을 여러 사용자에게 재사용할 수 있습니다.

### salt는 사용자마다 다른 입력을 추가한다

```text
user A: password123 + saltA ─► hash X
user B: password123 + saltB ─► hash Y
```

같은 password여도 저장 verifier가 달라집니다. 공격자는 각 salt 조합에 대해 후보를 다시 계산해야 합니다.

### salt는 비밀일 필요가 없다

Salt의 목적은 encryption key처럼 숨겨서 해시를 보호하는 것이 아니라 **precomputation과 동일 hash 재사용을 깨는 것**입니다. 그래서 encoded password 안에 salt가 함께 저장될 수 있습니다.

```text
$algorithm$params$salt$hash
```

현대 password hashing library는 보통 salt 생성과 저장 형식을 자체적으로 처리합니다. 애플리케이션이 직접 random salt column을 설계할 필요가 없는 경우가 많습니다.

### salt만 추가하면 fast hash 문제가 해결되는 것은 아니다

`SHA-256(password + salt)`도 각 사용자의 cracking을 다시 계산하게 만들지만 여전히 한 번 계산이 너무 빠릅니다. Salt와 함께 **느린 password hashing algorithm/work factor**가 필요합니다.

### pepper는 다른 개념이다

추가 secret pepper를 애플리케이션/HSM 쪽에 두는 설계도 있지만 salt와 달리 비밀로 관리해야 하고 rotation·운영 복잡성이 생깁니다. 기본 password hashing을 올바르게 구성한 뒤 threat model에 따라 검토할 수 있습니다.

Salt의 핵심은 “hash를 더 복잡하게 보이게 한다”가 아니라 **각 credential cracking 작업을 독립적으로 만들어 공격자의 대규모 재사용 효율을 낮추는 것**입니다.

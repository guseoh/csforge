---
kind: concept
contentKey: security.core.password.salt-hash
topicContentKey: security.core.password
slug: salt-hash
title: "비밀번호 솔트와 해시"
summary: "사용자마다 다른 무작위 솔트가 같은 비밀번호의 저장 결과를 다르게 만들고, 사전 계산 결과의 재사용을 어렵게 하는 원리를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#salting"
    title: "OWASP Password Storage Cheat Sheet: Salting"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "현대 비밀번호 해시 라이브러리의 비밀번호별 솔트 사용 확인"
---
# 비밀번호 솔트와 해시

두 사용자가 같은 `password123`을 사용한다고 해 봅시다. 솔트 없이 같은 해시 함수만 적용하면 저장 값도 같습니다.

```text
password123 ─ 해시 ─► ABC...
password123 ─ 해시 ─► ABC...
```

공격자는 유출된 DB만 보고 두 계정이 같은 비밀번호를 쓴다는 사실을 알 수 있고, 미리 계산한 해시 목록을 여러 사용자에게 재사용할 수 있습니다.

### 솔트는 사용자마다 다른 입력을 추가한다

```text
사용자 A: password123 + saltA ─► 해시 X
사용자 B: password123 + saltB ─► 해시 Y
```

같은 비밀번호여도 저장 검증자가 달라집니다. 공격자는 각 솔트 조합에 대해 후보를 다시 계산해야 합니다.

### 솔트는 비밀일 필요가 없다

솔트는 암호화 키처럼 숨겨서 해시를 보호하는 값이 아닙니다. **사전 계산한 결과를 재사용하지 못하게 하고 같은 비밀번호의 해시도 서로 다르게 만드는 것**이 목적입니다. 따라서 솔트는 인코딩된 검증 값 안에 함께 저장할 수 있습니다.

```text
$알고리즘$params$솔트$해시
```

현대적인 비밀번호 해시 라이브러리는 보통 솔트 생성과 저장 형식을 자체적으로 처리합니다. 애플리케이션이 직접 솔트 열을 설계할 필요가 없는 경우가 많습니다.

### 솔트만 추가하면 fast 해시 문제가 해결되는 것은 아니다

`SHA-256(password + salt)`도 사용자마다 추측 결과를 다시 계산하게 만들지만, 한 번의 계산이 여전히 너무 빠릅니다. 솔트와 함께 **적절한 작업 비용을 설정한 전용 비밀번호 해시 알고리즘**이 필요합니다.

### pepper는 다른 개념이다

추가 비밀 값인 페퍼(pepper)를 애플리케이션이나 HSM에서 관리하는 방법도 있습니다. 솔트와 달리 비밀로 유지해야 하고 키 교체와 운영이 복잡해집니다. 먼저 기본 비밀번호 해시를 올바르게 구성한 뒤 위협 모델에 따라 검토할 수 있습니다.

솔트의 핵심은 **각 자격 증명의 추측 작업을 독립적으로 만들어 공격자가 계산 결과를 대규모로 재사용하지 못하게 하는 것**입니다.

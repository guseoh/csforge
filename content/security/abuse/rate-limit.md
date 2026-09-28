---
kind: concept
contentKey: security.core.abuse.rate-limit
topicContentKey: security.core.abuse
slug: rate-limit
title: "요청 속도 제한(rate limiting)과 남용 방어"
summary: "로그인과 API 요청의 남용을 제한할 때 계정·IP 등 제한 기준, 시간 구간, 순간 요청량, 여러 인스턴스의 한도 공유와 정상 사용자 오탐을 함께 판단한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#login-throttling"
    title: "OWASP Authentication Cheat Sheet: Login Throttling"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "무차별 대입 방어를 위한 속도 제한과 계정 잠금 고려 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc6585#section-4"
    title: "RFC 6585: 429 Too Many Requests"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "속도 제한 초과 시 HTTP 429와 Retry-After의 의미 확인"
---
# 요청 속도 제한(rate limiting)과 남용 방어

강한 비밀번호 해시 처리와 올바른 인가를 적용해도 공격자가 비용이 큰 엔드포인트를 반복 호출하면 비밀번호 추측과 자원 고갈 위험이 남습니다. 요청 속도 제한(rate limiting)은 **IP·계정처럼 정한 기준에 따라 일정 시간 동안 허용할 요청 수를 제한하는 방어**입니다.

### 무엇을 하나의 요청 주체로 볼지 먼저 정한다

제한 키에 따라 막을 수 있는 공격과 정상 사용자 영향이 달라집니다.

```text
IP 기준
  + 익명 요청에도 적용 가능
  - NAT·프록시 뒤 여러 정상 사용자가 같은 IP를 공유할 수 있음

계정/이메일 기준
  + 특정 계정 대상 무차별 대입을 제한하기 쉬움
  - 공격자가 여러 계정으로 분산할 수 있음

인증된 주체/API 키 기준
  + 사용자·클라이언트별 한도에 적합
  - 인증 전 남용에는 사용할 수 없음
```

한 가지 기준으로 충분하지 않다면 계정과 IP 등 여러 신호를 조합할 수 있습니다. 정상 사용자를 공격자로 잘못 판단해 차단하는 비용도 함께 고려해야 합니다.

### 시간 구간별 정책은 순간 요청량을 다르게 허용한다

고정 시간 구간 방식은 구현이 단순하지만 구간 경계의 직전과 직후에 요청이 몰릴 수 있습니다.

```text
12:00:59  요청 100건
12:01:00  시간 구간 재설정
12:01:00  요청 100건
```

이동 시간 구간 방식은 최근 요청량을 더 정확히 반영합니다. 토큰 버킷은 일정 속도로 토큰을 채워 짧은 시간의 요청 집중을 제한적으로 허용합니다. **얼마나 많은 순간 요청을 허용할지와 상태 유지 비용**에 따라 방식을 선택합니다.

### 여러 인스턴스에서는 한도 상태의 범위를 결정한다

한 프로세스의 메모리에 카운터를 두면 그 인스턴스가 받은 요청만 계산합니다. 여러 인스턴스에 걸쳐 하나의 전역 한도를 강제해야 한다면 공유 저장소나 게이트웨이처럼 공통 지점에서 제한해야 합니다.

```text
클라이언트
  ├─► 인스턴스 A: 로컬 집계 60건
  └─► 인스턴스 B: 로컬 집계 60건

정책이 전역 분당 100건이라면
두 로컬 카운터만으로는 실제 요청 120건을 막지 못할 수 있음
```

인스턴스별 제한으로 충분하다면 분산 카운터는 네트워크 왕복과 장애 경로, 운영 복잡성을 늘립니다. 먼저 한도를 어느 범위에서 공유해야 하는지 정합니다.

### 요청 속도 제한은 인증·인가를 대체하지 않는다

권한 없는 요청을 초당 5회로 줄여도 그 5회가 성공한다면 인가 실패는 그대로입니다. 요청 속도 제한은 자원 소비를 줄이는 방어층이며 권한 검사와 별도로 적용합니다.

한도를 넘긴 요청에는 `429 Too Many Requests`를 반환할 수 있습니다. 필요하면 `Retry-After`로 재시도 시점을 알려 주고, 클라이언트의 재시도 정책도 함께 설계합니다.

요청 속도 제한을 설계할 때는 **어떤 공격을 누구를 기준으로 늦출지, 순간 요청과 오탐을 어느 정도 허용할지, 한도 상태를 어디까지 공유할지** 정해야 합니다.

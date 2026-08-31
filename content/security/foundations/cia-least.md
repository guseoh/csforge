---
kind: concept
contentKey: security.core.foundations.cia-least
topicContentKey: security.core.foundations
slug: cia-least
title: "CIA와 least privilege를 설계 판단에 적용하기"
summary: "기밀성·무결성·가용성을 서로 다른 보안 목표로 구분하고 사용자·서비스·DB 계정에 필요한 최소 권한만 부여해 침해 시 영향 범위를 줄이는 원리를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: least privilege와 deny-by-default authorization 원칙 확인
---
# CIA와 least privilege를 설계 판단에 적용하기

보안 요구를 “데이터를 안전하게 한다” 한 문장으로 묶으면 어떤 방어가 필요한지 판단하기 어렵습니다. CIA는 보호 목표를 기밀성(Confidentiality), 무결성(Integrity), 가용성(Availability)으로 나눠 생각하는 기본 틀입니다.

| 목표   | 실패 예시                          | 대표 방어 질문                       |
| ------ | ---------------------------------- | ------------------------------------ |
| 기밀성 | 다른 회원 주문 노출                | 누가 읽을 수 있는가?                 |
| 무결성 | 결제 금액 임의 변경                | 누가 어떤 상태를 바꿀 수 있는가?     |
| 가용성 | 로그인 API brute-force로 자원 고갈 | 정상 사용자가 계속 사용할 수 있는가? |

하나의 방어가 세 목표를 모두 해결하지는 않습니다. Encryption은 기밀성에 기여할 수 있지만 잘못된 사용자가 정상적으로 decrypt 권한을 얻었다면 authorization 문제는 남습니다.

### least privilege는 침해 범위를 줄인다

애플리케이션 DB 계정이 schema drop, superuser, 모든 database 접근 권한까지 가질 필요가 없다면 제거합니다.

```text
Application DB Role
├─ 필요한 table SELECT/INSERT/UPDATE
├─ 필요한 sequence usage
└─ DROP DATABASE / superuser 권한 없음
```

애플리케이션이 SQL injection이나 remote code execution으로 침해되더라도 공격자가 얻는 권한 범위를 줄일 수 있습니다.

### 사용자 권한도 UI 노출 여부가 아니라 서버 권한이다

관리자 버튼을 화면에서 숨겨도 사용자가 endpoint를 직접 호출할 수 있습니다. 실제 least privilege는 서버가 role/ownership/policy를 확인해 **허용된 operation만 실행**하게 하는 것입니다.

### 과도하게 좁은 권한도 운영 비용이 있다

서비스 기능마다 DB role을 지나치게 세분화하면 migration과 운영 복잡성이 커질 수 있습니다. 최소 권한은 “가능한 한 권한 수를 0에 가깝게”가 아니라 **업무에 필요한 권한만 주고 불필요한 privilege를 제거한다**는 원칙입니다.

CIA와 least privilege는 시험용 약어가 아니라 threat를 발견했을 때 “무슨 속성이 깨졌고, 침해되더라도 영향 범위를 어디까지 가둘 것인가”를 정하는 언어입니다.

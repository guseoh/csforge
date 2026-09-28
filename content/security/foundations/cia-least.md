---
kind: concept
contentKey: security.core.foundations.cia-least
topicContentKey: security.core.foundations
slug: cia-least
title: "기밀성·무결성·가용성과 최소 권한을 설계 판단에 적용하기"
summary: "기밀성·무결성·가용성을 서로 다른 보호 목표로 구분하고, 사용자와 서비스·DB 계정에 필요한 권한만 부여해 침해 영향을 줄이는 원리를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "최소 권한과 기본 거부 인가 원칙 확인"
---
# 기밀성·무결성·가용성과 최소 권한을 설계 판단에 적용하기

보안 요구를 단순히 “데이터를 안전하게 한다”라고 묶으면 어떤 보호가 필요한지 판단하기 어렵습니다. CIA는 보호 목표를 **기밀성(Confidentiality), 무결성(Integrity), 가용성(Availability)**으로 나누어 보는 기본 틀입니다.

| 목표 | 실패 예시 | 확인할 질문 |
| --- | --- | --- |
| 기밀성 | 다른 사용자의 주문 정보가 노출됨 | 누가 이 정보를 읽을 수 있는가? |
| 무결성 | 결제 금액이나 주문 상태가 임의로 변경됨 | 누가 어떤 상태를 바꿀 수 있는가? |
| 가용성 | 과도한 요청으로 정상 사용자가 서비스를 이용하지 못함 | 정상 사용자가 필요한 기능을 계속 사용할 수 있는가? |

하나의 방어가 세 목표를 모두 해결하지는 않습니다. 암호화는 기밀성에 기여하지만 권한이 없는 사용자도 복호화할 수 있다면 인가 문제는 남습니다.

최소 권한은 사용자·애플리케이션·DB 계정에 **업무에 필요한 권한만 부여하는 원칙**입니다. 주문을 조회하는 DB 계정에는 필요한 테이블의 조회 권한만 주고 관리자 권한이나 스키마 변경 권한은 주지 않으면, 애플리케이션 침해 시 피해 범위를 줄일 수 있습니다.

사용자 권한도 UI 표시 여부가 아니라 서버의 인가로 보장해야 합니다. 관리자 버튼을 숨겨도 엔드포인트를 직접 호출할 수 있으므로 실제 요청에서 역할, 소유권 또는 정책을 검증해야 합니다.

최소 권한은 기능 수행에 필요한 권한을 유지하면서 불필요한 권한을 제거해 **침해가 발생해도 영향 범위를 줄이는 것**이 목적입니다.

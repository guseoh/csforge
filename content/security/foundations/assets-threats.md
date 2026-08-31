---
kind: concept
contentKey: security.core.foundations.assets-threats
topicContentKey: security.core.foundations
slug: assets-threats
title: "자산·위협·취약점을 구분해 위험을 정의하기"
summary: "보안 기능부터 추가하지 않고 보호할 자산, 공격자가 원하는 결과, 그 결과를 가능하게 하는 취약점을 분리해 실제 backend threat scenario를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://owasp.org/www-community/Threat_Modeling"
    title: "OWASP: Threat Modeling"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 보호 대상과 threat를 먼저 식별하는 threat modeling 관점 확인
---
# 자산·위협·취약점을 구분해 위험을 정의하기

보안을 “JWT를 쓴다”, “CORS를 켠다”, “비밀번호를 암호화한다”처럼 기술 목록으로 시작하면 **무엇을 누구에게서 왜 보호하는지**가 빠집니다. 먼저 자산(asset), 위협(threat), 취약점(vulnerability)을 구분하면 방어가 필요한 이유를 설명할 수 있습니다.

주문 서비스의 예를 보겠습니다.

```text
보호할 자산
├─ 회원 계정
├─ 결제 정보
├─ 주문 상태
└─ 관리자 기능

공격자가 원하는 결과
├─ 다른 회원 주문 조회
├─ 결제 상태 위조
└─ 관리자 권한 획득

가능하게 하는 취약점
├─ ownership 검사 없음
├─ 서버가 client status를 그대로 신뢰
└─ admin endpoint 권한 검사 누락
```

### 같은 취약점도 자산에 따라 위험이 달라진다

디버그 endpoint가 내부 build version만 보여주는 것과 DB credential을 보여주는 것은 같은 “정보 노출” 범주라도 영향이 다릅니다. 위험을 판단할 때는 단순 취약점 존재 여부뿐 아니라 공격 가능성과 영향 범위를 함께 봅니다.

### 위협은 구체적인 실행 경로로 적는다

“인가가 약하다”보다 다음처럼 적으면 검증할 수 있습니다.

```text
공격자: 로그인한 일반 사용자
전제: 주문 ID를 추측할 수 있음
행동: GET /orders/{otherUserOrderId}
취약점: controller가 ID만 조회하고 ownership을 검사하지 않음
결과: 다른 사용자의 주문 정보 노출
```

이렇게 threat scenario를 만들면 필요한 방어도 분명해집니다. ID를 숨기는 것만이 아니라 **서버에서 current principal과 resource owner를 비교**해야 합니다.

### 보안은 failure path 설계이기도 하다

공격 요청을 막는 것만으로 끝나지 않습니다. 인증 실패와 인가 실패를 구분하고, 로그에는 공격 분석에 필요한 정보는 남기되 password/token 같은 secret은 남기지 않으며, rate limiting이 정상 사용자를 과도하게 차단하지 않는지도 봐야 합니다.

좋은 보안 설계는 “기술을 많이 넣었다”가 아니라 **어떤 자산에 어떤 공격 경로가 있고, 어느 경계에서 어떤 검사가 그 경로를 끊는지**를 설명할 수 있는 상태입니다.

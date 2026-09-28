---
kind: concept
contentKey: performance.core.observability.sli-slo-error-budget
topicContentKey: performance.core.observability
slug: sli-slo-error-budget
title: "서비스 수준 지표·목표와 오류 예산"
summary: "사용자가 체감하는 품질을 서비스 수준 지표(SLI)로 정의하고 목표(SLO)와 오류 예산을 배포·신뢰성 의사결정에 연결한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://sre.google/sre-book/service-level-objectives/"
    title: "Google SRE Book: Service Level Objectives"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "SLI·SLO·오류 예산의 운영 의사결정 맥락 확인"
---
# 서비스 수준 지표·목표와 오류 예산

CPU 사용률이 낮다고 사용자가 서비스를 잘 이용하고 있다는 뜻은 아닙니다. 그래서 서비스 목표는 내부 자원 지표보다 **사용자가 성공했다고 느끼는 사건**에서 시작하는 편이 좋습니다. SLI(Service Level Indicator)는 그 품질을 실제로 측정하는 지표이고, SLO(Service Level Objective)는 일정 기간 동안 어느 수준을 만족할지 정한 목표입니다.

```text
유효 요청
   ├─ 제한 시간 안에 성공 ─▶ 좋은 사건
   └─ 실패/시간 초과      ─▶ 나쁜 사건

SLI = 좋은 사건 수 / 유효 사건 수
```

예를 들어 “30일 동안 유효한 요청의 99.9%가 성공한다”는 목표를 정했다면 나머지 0.1%가 오류 예산(error budget)이 됩니다. 이 여유는 장애를 허용해도 된다는 면허가 아니라, 기능 출시 속도와 신뢰성 투자를 같은 기준으로 대화하기 위한 도구입니다.

오류 예산의 경계도 정확히 해석해야 합니다. 허용된 실패량을 **정확히 모두 사용한 시점에는 목표 경계에 있어 SLO를 아직 만족할 수 있지만 추가 실패 여유가 0**입니다. 그 허용량을 초과하는 추가 실패가 발생하면 해당 목표 기간의 SLO를 위반합니다. 따라서 “예산 소진”과 “예산 초과”를 같은 뜻으로 쓰지 않습니다.

중요한 것은 계산식보다 분모와 성공 조건입니다. 재시도를 여러 번 세거나 상태 확인 요청만 포함하면 실제 사용자 경험보다 지표가 좋아 보일 수 있습니다. 시간 초과 기준, 제외할 트래픽, 계획된 점검 처리처럼 지표의 의미를 바꾸는 조건을 명시해야 합니다.

오류 예산이 빠르게 소진되면 위험한 배포를 늦추거나 신뢰성 개선 작업을 우선하는 정책으로 연결할 수 있습니다. 반대로 예산이 남아 있더라도 특정 핵심 흐름의 심각한 회귀를 무시해서는 안 됩니다. SLO는 숫자 자체보다 **운영 결정을 언제 바꿀지 정하는 계약**으로 사용합니다.

계측 방식을 바꾸면 SLI 값 자체가 달라질 수 있으므로 질의와 수집 방식도 버전이 있는 계약처럼 관리합니다. 이미 알려진 실패 사례나 합성 점검과 대조해 측정이 실제 사용자 상태를 반영하는지 확인하는 것이 필요합니다.

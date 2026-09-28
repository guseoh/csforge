---
kind: concept
contentKey: performance.core.operations.incident-response
topicContentKey: performance.core.operations
slug: incident-response
title: "장애 대응과 사후 분석"
summary: "장애 중에는 영향 축소와 의사결정 조정을 우선하고, 복구 뒤에는 근거에 기반한 사후 분석으로 시스템의 보호 장치를 개선한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://sre.google/sre-book/managing-incidents/"
    title: "Google SRE Book: Managing Incidents"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "장애 지휘, 실행, 커뮤니케이션 역할 분리와 사고 관리 원칙 확인"
  - url: "https://techblog.woowahan.com/25189/"
    title: "장애 대응의 성패를 가르는 First Action — 우아한형제들의 장애 관리 라이프사이클"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: section
    recommendation: "장애 탐지·초동 조치·복구·재발 방지를 단계와 시간 지표로 연결하는 운영 사례를 확인한다."
    displayOrder: 2
    relationNote: "초동 완화 조치와 장애 후속 작업의 완료·검증 사례 확인"
---
# 장애 대응과 사후 분석

장애가 발생했을 때 가장 먼저 해야 할 일은 완벽한 근본 원인을 증명하는 것이 아닙니다. 사용자 영향을 줄이고, 누가 결정을 조정하는지 명확히 하며, 어떤 조치를 왜 했는지 기록할 수 있는 상태를 만드는 것이 우선입니다.

```text
탐지
  ↓
장애 선언 / 범위 확인
  ↓
안정화
  ↓
복구
  ↓
학습
```

규모가 큰 장애에서는 역할을 나누면 충돌을 줄일 수 있습니다. 장애 지휘관(Incident Commander)은 우선순위와 의사결정 기록을 관리하고, 실행 담당자는 되돌리기나 트래픽 조정 같은 완화 조치를 수행하며, 커뮤니케이션 담당자는 사용자와 내부 팀에 같은 상태를 전달합니다. 작은 팀이라도 “누가 조정하고 누가 실행하는가”를 분명히 하면 동시에 상반된 조치를 하는 위험을 줄일 수 있습니다.

완화(mitigation)와 원인 분석은 같은 일이 아닙니다. 최근 배포 되돌리기, 기능 비활성화, 트래픽 축소처럼 영향부터 줄이는 조치를 먼저 할 수 있고, 원인 가설은 메트릭·로그·분산 추적·배포 차이 같은 근거로 나중에 검증할 수 있습니다. 이미 실행된 데이터베이스 마이그레이션이나 외부 시스템의 부수 효과는 애플리케이션 버전만 되돌린다고 사라지지 않을 수 있으므로 상태 정합성 복구도 필요합니다.

복구가 끝나면 사후 분석(postmortem)은 개인의 실수를 찾는 문서가 아니라 시스템이 왜 그 실패를 허용했는지를 학습하는 도구가 됩니다. 발생 계기, 감지 공백, 기여 조건, 영향, 시간순 기록, 잘 작동한 대응과 부족했던 대응을 남기고, 후속 조치에는 담당자와 검증 방법을 둡니다.

좋은 사후 분석은 문서에서 끝나지 않습니다. 알림, 테스트, 런북, 배포 보호 장치, 용량 규칙처럼 **다음에는 같은 실패를 더 빨리 감지하거나 영향이 작아지도록 시스템을 바꾸는 것**까지 이어져야 합니다.

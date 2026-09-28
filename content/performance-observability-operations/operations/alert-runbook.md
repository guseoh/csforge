---
kind: concept
contentKey: performance.core.operations.alert-runbook
topicContentKey: performance.core.operations
slug: alert-runbook
title: "알림과 대응 절차"
summary: "사용자 영향과 즉시 조치를 연결하는 알림을 만들고, 같은 문제가 반복될 때 안전한 조사·완화 순서를 대응 절차로 남긴다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://sre.google/sre-book/monitoring-distributed-systems/"
    title: "Google SRE Book: Monitoring Distributed Systems"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "monitoring signal과 alert 설계의 운영 관점 확인"
---
# 알림과 대응 절차

모든 이상 징후를 사람에게 즉시 알리면 중요한 장애도 수많은 경고 속에 묻힙니다. 알림은 단순히 메트릭이 임곗값을 넘었다는 사실보다 **지금 사람이 확인하거나 조치해야 할 사용자 영향이 있는가**를 기준으로 설계하는 편이 좋습니다.

예를 들어 SLO 오류 예산의 빠른 소진이나 급격한 오류율 증가는 사용자가 실제로 영향을 받고 있다는 증상에 가깝습니다. 반면 CPU 사용률 상승이나 대기열 증가 자체는 원인 후보일 수 있으므로 즉시 호출(page)하기보다 대시보드, 작업 티켓, 용량 개선 작업으로 연결하는 편이 더 적절할 수 있습니다.

```text
사용자 영향 / SLO 예산 빠른 소진
        │
        └─ 담당자 호출
             │
             └─ 런북으로 범위 확인 → 안전한 완화 조치

장기 자원 추세
        └─ 작업 티켓 / 용량 조사
```

알림 규칙에는 임곗값뿐 아니라 평가 시간 창과 복구 조건이 필요합니다. 짧은 순간 급증마다 담당자를 호출하면 피로도가 커지고, 반대로 너무 긴 시간 창은 장애 감지를 늦춥니다. 중복 알림을 묶고 의존 서비스 장애가 상위 서비스 알림을 연쇄적으로 만들 때는 억제(inhibition) 같은 정책도 검토할 수 있습니다.

런북(runbook)은 장애가 났을 때 처음 보는 사람도 실행할 수 있어야 합니다. 영향 범위 확인 질의, 안전한 되돌리기·트래픽 축소·기능 비활성화 같은 완화 절차, 파괴적인 명령의 대상 범위와 복구 확인 방법을 포함합니다. 서비스 구조가 바뀌었는데 런북이 그대로라면 오히려 잘못된 조치를 유도할 수 있으므로 실제 장애와 훈련을 통해 지속적으로 갱신해야 합니다.

좋은 알림은 “문제가 있다”에서 끝나지 않고 **무엇을 확인하고 어떤 행동을 할지**까지 이어집니다. 다음 장애 대응에서는 여러 사람이 동시에 움직이는 상황에서 이 신호와 런북을 어떻게 조정할지 다룹니다.

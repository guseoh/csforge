---
kind: concept
contentKey: performance.core.measurement.latency-throughput
topicContentKey: performance.core.measurement
slug: latency-throughput
title: "지연 시간 분포와 처리량"
summary: "평균값 하나가 아니라 percentile 지연 시간, 처리량, 오류율과 동시성을 함께 보며 실제 workload의 성능을 판단한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://prometheus.io/docs/practices/histograms/"
    title: "Prometheus Documentation: Histograms and summaries"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "히스토그램과 요약 통계가 지연 시간 분포·백분위수·복제본 간 집계에 미치는 차이를 확인한다."
    displayOrder: 1
    relationNote: "히스토그램에서 백분위수를 계산하고 여러 인스턴스의 분포를 합치는 방법 확인"
---
# 지연 시간 분포와 처리량

서비스가 빨라졌는지 판단할 때 평균 응답 시간 하나만 보면 중요한 변화를 놓칠 수 있습니다. 지연 시간(latency)은 요청 하나가 끝날 때까지 걸린 시간이고, 처리량(throughput)은 단위 시간에 완료한 작업 수이므로 서로 다른 질문에 답하는 지표입니다.

평균 지연 시간이 비슷해도 일부 요청만 매우 느려질 수 있습니다. 그래서 p50은 보통 요청의 경험을, p95·p99는 느린 쪽 요청이 얼마나 오래 기다리는지를 보여 주는 데 사용합니다. 백분위수는 경로, 상태, 시간 창과 표본 수가 달라지면 의미도 달라지므로 측정 조건과 함께 읽어야 합니다.

여러 인스턴스의 서비스 전체 p95를 구할 때 각 인스턴스에서 미리 계산한 p95 값을 평균 내면 전체 p95가 되지 않습니다. 인스턴스별 관측 분포를 합칠 수 있는 히스토그램을 집계한 뒤 백분위수를 계산해야 합니다.

```text
요청별 지연 시간 표본
        │
        ▼
  분포 / 히스토그램
        │
        ├─ p50
        ├─ p95
        └─ p99
```

처리량도 단독으로 높다고 좋은 것은 아닙니다. 동시 요청 수를 크게 늘려 초당 처리 수가 올라가더라도 대기열이 길어지고 p99와 오류율이 함께 악화되면 사용자가 체감하는 품질은 나빠질 수 있습니다.

또한 어떤 구간의 지연 시간을 재는지도 고정해야 합니다. 클라이언트가 본 전체 시간, 부하 분산 장치 이후의 시간, 애플리케이션 처리기 실행 시간은 서로 다른 경계를 측정합니다. 같은 성능 실험에서는 시작·종료 지점과 성공·실패 기준을 유지해야 비교가 가능합니다.

성능을 판단할 때는 **처리량을 늘렸을 때 지연 시간 분포와 오류율이 어떻게 변하는지**를 함께 봅니다. 이후 포화와 대기열을 보면 왜 어느 지점부터 처리량 증가가 지연 시간 증가로 바뀌는지 더 구체적으로 설명할 수 있습니다.

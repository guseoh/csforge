---
kind: concept
contentKey: performance.core.observability.metric-cardinality
topicContentKey: performance.core.observability
slug: metric-cardinality
title: "메트릭 카디널리티와 관측 비용"
summary: "레이블·속성 조합이 시계열 수와 저장·질의 비용을 어떻게 늘리는지 이해하고 필요한 차원만 남긴다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://prometheus.io/docs/practices/naming/"
    title: "Prometheus Documentation: Metric and label naming"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "label cardinality와 metric naming rule 확인"
  - url: "https://opentelemetry.io/docs/concepts/signals/metrics/"
    title: "OpenTelemetry Documentation: Metrics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "metric attribute 조합과 cardinality limit 확인"
---
# 메트릭 카디널리티와 관측 비용

메트릭은 값을 하나 더 기록할 때마다 비용이 조금씩 늘어나는 단순 로그가 아닙니다. 레이블(label)이나 속성 조합이 달라지면 별도의 시계열(time series)이 만들어지므로, 값의 종류가 많은 차원을 추가하면 메모리·저장·수집·질의 비용이 빠르게 커집니다.

예를 들어 `route`, `status_class`, `region`처럼 값의 범위가 제한된 차원은 운영 질문에 유용할 수 있습니다. 반면 사용자 ID, 이메일, 요청 ID, 원문 URL처럼 값이 계속 늘어나는 식별자를 레이블에 넣으면 요청 수에 가까운 수의 시계열이 생길 수 있습니다.

```text
좋은 예
http_server_duration_seconds{
  route="/users/{id}",
  status_class="2xx"
}

위험한 예
http_server_duration_seconds{
  user_id="847193..."
}
```

카디널리티는 여러 차원이 곱해지면서 커집니다. `route 100개 × status 5개 × region 4개 × version 3개`라면 이미 최대 6,000개 조합이 가능하고, 여기에 인스턴스나 테넌트 같은 차원이 추가되면 더 빠르게 증가합니다.

따라서 새 레이블을 넣기 전에 “이 차원이 실제 운영 질문에 필요한가?”, “값의 개수가 제한되는가?”를 확인합니다. 개별 요청을 찾아야 하는 정보는 표본 추출된 추적이나 구조화 로그로 옮기고, 메트릭에는 전체 경향을 집계할 수 있는 제한된 차원을 남기는 편이 적절합니다.

관측 저장소의 카디널리티 제한은 마지막 보호 장치일 뿐 잘못 설계된 메트릭 스키마를 해결해 주지는 않습니다. 시계열 수, 수집률, 저장 비용과 질의 지연 시간을 함께 관측하면서 **관측 가능성과 관측 비용 사이의 균형**을 관리해야 합니다.

---
kind: concept
contentKey: system-design.core.requirements.capacity-data
topicContentKey: system-design.core.requirements
slug: capacity-data
title: "capacity estimate와 data shape"
summary: "QPS·payload·storage·read/write ratio·growth와 peak를 rough estimate로 연결하고 검증한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://sre.google/sre-book/service-best-practices/"
    title: "Google SRE Book: Production Services Best Practices"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "user-visible SLO와 capacity planning·load testing 연결 확인"
  - url: "https://docs.aws.amazon.com/pdfs/wellarchitected/latest/performance-efficiency-pillar/wellarchitected-performance-efficiency-pillar.pdf"
    title: "AWS Well-Architected Framework: Performance Efficiency Pillar"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "architecture·compute·data·network 선택을 workload에 연결하는 관점 확인"
---
# capacity estimate와 data shape

Capacity estimate는 정밀한 미래 예언이 아니라 어떤 숫자가 architecture를 바꾸는지 찾는 rough model입니다. peak QPS, read/write ratio, payload size, concurrency, storage growth, retention, fan-out, batch size를 놓고 order of magnitude를 계산한 뒤 load test와 production telemetry로 보정합니다.

### 먼저 단위를 고정한다

```text
daily requests ─▶ peak requests/sec ─▶ bytes/sec
                              └─ replication·index·backup 배수
```

평균 QPS만 보면 burst와 autoscaling delay를 놓칩니다. 요청 수와 실제 query·message·row·byte 작업량을 구분하고, response fan-out과 retry가 origin load를 얼마나 증폭시키는지 포함합니다.

### data shape가 storage를 결정한다

현재 record 수뿐 아니라 row/document 크기, index 배수, history·audit 보존, compression, replica, backup과 rebuild 시간을 계산합니다. hot key, access locality, large blob, append-only history는 서로 다른 storage·partition·read model을 요구할 수 있습니다.

### 추정에는 범위를 둔다

낮음·기대·높음 시나리오와 성장률, peak duration, 장애 시 N-1 capacity를 나눕니다. 숫자마다 source와 불확실성을 적고, 어떤 threshold를 넘으면 sharding·async processing·precompute가 필요한지 decision trigger로 남깁니다.

### 문제를 풀 때 확인할 것

1. 평균·peak·burst와 지속 시간을 구분합니다.
2. request·query·message·byte의 작업 단위를 정합니다.
3. read/write·fan-out·retry·replication 배수를 포함합니다.
4. record·index·history·backup·retention storage를 계산합니다.
5. range별 load test와 telemetry로 추정을 보정합니다.

### 면접에서 설명한다면

Capacity는 QPS 하나가 아니라 peak workload를 bytes·queries·connections·storage로 번역한 rough model입니다. read/write와 fan-out·retry·replica·backup 배수를 넣고, data shape와 retention을 계산하며, 불확실한 가정은 low/base/high 시나리오와 load test의 검증 항목으로 명시합니다.

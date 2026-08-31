---
kind: concept
contentKey: computer-architecture.core.performance.latency-throughput
topicContentKey: computer-architecture.core.performance
slug: latency-throughput
title: "Latency and Throughput"
summary: "완료 지연과 단위 시간 처리량을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "가속 가능한 비율과 전체 speedup의 경계를 확인한다."
    displayOrder: 1
---
# Latency and Throughput

latency는 한 작업의 시작부터 완료까지이고 throughput은 단위 시간에 완료한 작업 수다. pipeline이나 batching은 여러 작업의 overlap으로 throughput을 높일 수 있지만 첫 작업 latency나 queue wait는 늘릴 수 있다. 따라서 “빠르다”는 말에는 측정 단위를 붙여야 한다.

포화 전에는 concurrency가 throughput을 올리지만, 포화 뒤에는 queueing으로 p99 latency가 급증한다. hardware execution time과 service end-to-end latency도 같은 값이 아니다.

### Backend 연결

API 성능 목표에 평균 latency, p95/p99, throughput, error rate를 함께 기록한다. CPU utilization이 낮은데 latency가 높다면 I/O와 downstream queue를 분리해 본다.

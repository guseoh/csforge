---
kind: concept
contentKey: computer-architecture.core.performance.microbenchmark-boundary
topicContentKey: computer-architecture.core.performance
slug: microbenchmark-boundary
title: "Microbenchmark Boundary"
summary: "단일 benchmark 수치로 bottleneck을 단정할 수 없는 이유를 분석한다."
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "가속 가능한 비율과 전체 speedup의 경계를 확인한다."
    displayOrder: 1
---
# Microbenchmark Boundary

짧은 benchmark는 한 변수의 hardware 비용을 격리하는 데 좋지만, warm-up·JIT·cache state·branch predictor·OS scheduling을 실제 service와 다르게 만든다. 숫자가 낮아졌다는 사실은 CPU가 bottleneck이었다는 증명이 아니며 compiler가 코드를 제거했을 가능성도 확인해야 한다.

반복 횟수, input distribution, thread 수, affinity, clock throttling과 measurement overhead를 고정해야 결과가 비교 가능하다. micro와 macro benchmark는 서로 대체하지 않고 각각 다른 질문에 답한다.

### Backend 연결

성능 PR에는 benchmark fixture와 production trace를 함께 남긴다. CPU·memory·I/O·downstream 지표를 교차 확인해 개선이 실제 요청의 병목을 이동시켰는지 검증한다.

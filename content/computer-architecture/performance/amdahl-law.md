---
kind: concept
contentKey: computer-architecture.core.performance.amdahl-law
topicContentKey: computer-architecture.core.performance
slug: amdahl-law
title: "Amdahl's Law"
summary: "가속 가능한 부분의 비율이 전체 speedup을 제한하는 이유를 계산한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "가속 가능한 비율과 전체 speedup의 경계를 확인한다."
    displayOrder: 1
---
# Amdahl's Law

전체 실행 중 fraction `p`만 `s`배 빨라지면 전체 speedup은 `1 / ((1-p)+p/s)`로 제한된다. 가속하지 못한 serial 부분이 남아 있으면 빠른 부분을 무한히 개선해도 그 부분이 전체 시간을 지배한다.

측정에서 p를 잘못 잡으면 예측이 틀린다. warm-up, I/O, synchronization, input mix가 달라지면 개선 가능한 fraction이 바뀌므로 benchmark의 범위와 반복 조건을 명시해야 한다.

### Backend 연결

cache 최적화나 batch 병렬화를 평가할 때 endpoint 전체에서 실제 개선 fraction을 계산한다. 한 함수의 10배 개선을 서비스 10배 향상으로 PR에 기록하지 않는다.


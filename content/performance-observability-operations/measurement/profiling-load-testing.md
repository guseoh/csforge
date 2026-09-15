---
kind: concept
contentKey: performance.core.measurement.profiling-load-testing
topicContentKey: performance.core.measurement
slug: profiling-load-testing
title: "프로파일링과 부하 테스트"
summary: "profiler와 load test가 서로 다른 질문에 답한다는 점을 이해하고 재현 가능한 성능 실험으로 원인과 capacity를 분리해 검증한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/jfapi/flight-recorder-api-programmers-guide.pdf"
    title: "Oracle Java SE 25: Flight Recorder API Programmer's Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "JFR recording과 runtime profiling 경계 확인"
---
# 프로파일링과 부하 테스트

서비스가 느리다는 증상만으로는 어떤 실험을 해야 할지 결정할 수 없습니다. 프로파일링은 실행 중인 코드와 runtime이 CPU, allocation, lock, I/O에 시간을 어디에서 쓰는지를 찾는 데 적합하고, 부하 테스트는 특정 workload를 주었을 때 시스템의 latency·throughput·error·saturation이 어떻게 변하는지를 확인하는 데 적합합니다.

```text
"어디서 시간이 쓰이나?"     ─▶ profiler / JFR
"얼마나 많은 부하를 견디나?" ─▶ load test
"변경 전후가 빨라졌나?"      ─▶ controlled benchmark
```

Profiler에서 hot method가 보였다고 해서 그것이 서비스 전체 capacity의 병목이라는 뜻은 아닙니다. 반대로 load test에서 p99가 나빠졌다고 해도 그 결과만으로 어느 코드가 원인인지 알 수 없습니다. 두 도구의 결과를 CPU, GC, DB, trace 같은 다른 증거와 연결해야 원인 가설을 세울 수 있습니다.

부하 테스트는 조건을 고정해야 의미가 있습니다. Build version, JVM/runtime, resource limit, dataset, cache warm/cold 상태, 요청 비율, concurrency, warm-up과 측정 구간이 달라지면 숫자를 직접 비교하기 어렵습니다. 한 번의 최고 TPS보다 같은 조건에서 baseline과 변경 버전을 비교하는 편이 훨씬 유용합니다.

Production profiling은 overhead와 데이터 노출 위험도 고려해야 합니다. Sampling이나 제한된 recording으로 관측 범위를 제어하고, 기록 파일에는 stack trace와 application metadata가 포함될 수 있으므로 접근 권한과 보존 정책을 함께 둡니다.

성능 실험의 핵심은 도구 이름이 아니라 **무엇을 확인하려는지 질문을 먼저 고정하고, 변경 전후를 같은 workload에서 다시 측정하는 것**입니다. 최적화가 실제 사용자 latency와 resource saturation을 개선했는지는 실험 뒤 production telemetry로 다시 확인합니다.

---
kind: concept
contentKey: performance.core.measurement.profiling-load-testing
topicContentKey: performance.core.measurement
slug: profiling-load-testing
title: "프로파일링과 부하 테스트"
summary: "프로파일러·마이크로벤치마크·부하 테스트가 서로 다른 질문에 답한다는 점을 이해하고 재현 가능한 성능 실험으로 코드 수준 원인과 서비스 처리 용량을 분리해 검증한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/jfapi/flight-recorder-api-programmers-guide.pdf"
    title: "Oracle Java SE 25: Flight Recorder API Programmer's Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "JFR 기록과 실행 중 프로파일링의 경계 확인"
  - url: "https://github.com/openjdk/jmh"
    title: "OpenJDK Java Microbenchmark Harness (JMH)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "JVM 마이크로벤치마크의 워밍업·포크·최적화 함정을 통제하는 전용 하네스 확인"
  - url: "https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/"
    title: "Grafana k6 Documentation: API load testing"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "목표와 실제 트래픽 형태에 맞춘 API 부하 모델과 성능 기준 설계 확인"
---
# 프로파일링과 부하 테스트

서비스가 느리다는 증상만으로는 어떤 실험을 해야 할지 결정할 수 없습니다. 프로파일링은 실행 중인 코드와 JVM이 CPU, 객체 할당, 락, I/O에 시간을 어디에서 쓰는지를 찾는 데 적합하고, 부하 테스트는 특정 작업 부하를 주었을 때 시스템의 지연 시간·처리량·오류·포화가 어떻게 변하는지를 확인하는 데 적합합니다.

```text
"어디서 시간이 쓰이나?"       ─▶ 프로파일러 / JFR
"짧은 코드 조각 자체가 빠른가?" ─▶ JMH 마이크로벤치마크
"서비스가 부하를 얼마나 견디나?" ─▶ 부하 테스트
```

마이크로벤치마크는 메서드나 작은 연산처럼 좁은 코드 경로의 비용을 비교하는 실험입니다. JVM에서는 단순히 `System.nanoTime()` 앞뒤로 같은 코드를 반복하면 JIT 컴파일 시점, 워밍업 여부, 상수 접기, 사용되지 않는 결과 제거(dead-code elimination) 같은 최적화 때문에 실제보다 빠르거나 불안정한 값이 나올 수 있습니다. JMH는 워밍업과 측정 반복, 별도 JVM 프로세스 실행(fork), 결과 소비 같은 장치를 제공해 이런 변수를 통제하도록 돕습니다.

그렇더라도 JMH 결과는 **그 마이크로벤치마크 조건에서의 코드 비용**입니다. 네트워크, DB, 스레드 풀, GC 압력, 실제 데이터 분포까지 포함한 서비스 전체 처리 용량이나 사용자 p99를 뜻하지 않습니다. 작은 구현 선택을 비교할 때는 마이크로벤치마크를, 실제 API가 목표 트래픽을 견디는지 확인할 때는 부하 테스트를 사용해야 합니다.

프로파일러에서 CPU를 많이 쓰는 메서드가 보였다고 해서 그것이 서비스 전체 처리 용량의 병목이라는 뜻은 아닙니다. 반대로 부하 테스트에서 p99가 나빠졌다고 해도 그 결과만으로 어느 코드가 원인인지 알 수 없습니다. 두 결과를 CPU, GC, DB, 분산 추적 같은 다른 근거와 연결해야 원인 가설을 세울 수 있습니다.

부하 테스트는 조건을 고정해야 의미가 있습니다. 빌드 버전, JVM, 자원 제한, 데이터셋, 캐시의 준비 상태, 요청 비율, 동시성, 준비 구간과 측정 구간이 달라지면 숫자를 직접 비교하기 어렵습니다. 한 번의 최고 TPS보다 같은 조건에서 기준 버전과 변경 버전을 반복 비교하는 편이 훨씬 유용합니다.

운영 환경 프로파일링은 측정 자체의 부하와 데이터 노출 위험도 고려해야 합니다. JFR 같은 표본 기반 기록은 필요한 기간과 설정으로 관측 범위를 제어하고, 기록 파일에 스택 추적과 애플리케이션 메타데이터가 포함될 수 있으므로 접근 권한과 보존 정책을 함께 둡니다.

성능 실험의 핵심은 도구 이름이 아니라 **무엇을 확인하려는지 질문을 먼저 고정하고, 도구가 답할 수 있는 범위 안에서 결과를 해석하는 것**입니다. 최적화가 실제 사용자 지연 시간과 자원 포화를 개선했는지는 같은 작업 부하의 변경 전후 실험과 운영 관측 자료로 다시 확인합니다.

---
kind: concept
contentKey: performance.core.measurement.latency-attribution
topicContentKey: performance.core.measurement
slug: latency-attribution
title: "요청 지연 구간 분해와 병목 원인 검증"
summary: "HTTP 총 지연에서 연결 풀 획득 대기·SQL 실행·외부 I/O를 분리하고 측정 경계와 시간 순서에 근거해 원인 가설을 검증한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://opentelemetry.io/docs/concepts/signals/traces/"
    title: "OpenTelemetry Documentation: Traces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Span start/end, 부모-자식 중첩 관계 및 분산 호출 시간선으로 한 요청의 실행 구간 연결"
  - url: "https://docs.spring.io/spring-boot/reference/actuator/metrics.html"
    title: "Spring Boot Reference: Metrics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "DataSource와 HikariCP pool 계측 지표를 HTTP 지연 관측과 대조"
  - url: "https://docs.spring.io/spring-boot/reference/data/sql.html"
    title: "Spring Boot Reference: SQL Databases"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "JPA/JDBC의 HikariCP 연결 풀 설정과 서비스에서의 연결 획득 책임 확인"
---
# 요청 지연 구간 분해와 병목 원인 검증

API p99가 느려졌다는 사실만으로 SQL에 인덱스를 추가하거나 DB 연결 풀을 늘려서는 안 됩니다. 요청 하나의 지연 시간에는 **작업자 대기, DB 연결 획득 대기, SQL 실행, 외부 HTTP 호출**처럼 서로 다른 단계가 포함됩니다. 어느 구간이 실제로 증가했는지 보지 않으면 증상과 다른 곳을 고쳐 오히려 부하를 늘릴 수 있습니다.

```text
클라이언트가 관찰한 전체 요청:     |------------------- 280 ms --------------------|
서버가 기록한 HTTP 처리 구간:        |--------------- 250 ms ---------------|
서버 내부의 순차 실행 예시:
  요청 진입/처리 준비              |-- 15 ms --|
  DB 연결 풀 획득 대기                         |--- 170 ms ---|
  SQL 실행                                                   |- 12 ms -|
  결과 매핑/응답                                             |-- 18 ms --|
  외부 HTTP 요청                                                          |- 35 ms -|
```

그림은 특정 API의 **가상으로 관측한 순차 구간**입니다. 시작 지점을 어디로 잡았는지에 따라 클라이언트·LB·서버에서 측정한 시간이 다르고, 실제로는 SQL 실행과 외부 호출이 병렬로 겹치거나 일부 단계가 자식 Span으로 중첩될 수 있습니다. 위 예시의 서버 내부 순차 구간은 15+170+12+18+35=250ms이며, 클라이언트 전체 280ms와의 30ms 차이는 앞단 네트워크·LB 등의 **미계측 구간 후보**일 뿐, 계측하지 않았다면 정확한 원인을 안다고 말할 수 없습니다.

### DB 연결을 기다린 시간과 SQL 실행 시간은 다르다

HikariCP 같은 연결 풀에서 사용할 수 있는 연결이 없으면 애플리케이션은 연결을 빌릴 때 기다릴 수 있습니다. SQL이 빨리 실행되더라도 **연결 획득에 170ms를 기다리고 쿼리는 12ms만 실행**했다면 SQL 구문 최적화만으로 170ms 대기를 해결하기 어렵습니다.

```text
App 요청 ─┬─ pool 대기: 170 ms ─┬─ connection 확보 ─ SQL: 12 ms ─▶ 응답
          │                     │
          └─ Hikari active/pending/timeout 경향과 같은 시각에 대조
```

이 상황에서는 활성·대기 연결 수, 연결 획득 시간과 제한 시간 초과, 트랜잭션이 연결을 오래 보유하는 구간, 느린 외부 호출을 트랜잭션 안에 넣지 않았는지 등을 확인해야 합니다. 풀 최대 크기를 늘리면 대기가 줄어들 수 있지만 DB 서버의 동시 쿼리·락·CPU 부담과 다른 인스턴스의 연결 예산이 증가하므로 측정 없이 정답처럼 적용하지 않습니다. 반대로 실제 SQL 실행이 오래 걸린다면 DB 실행 계획·락·I/O를 근거로 Database 영역의 쿼리 개선 작업을 연결합니다.

### Span 시간을 무조건 합산하면 중복 계산한다

분산 추적의 Span은 시작·종료 시각과 부모·자식 관계를 가집니다. 한 요청이 200ms인 부모 Span 안에서 DB 호출 150ms를 수행했다면 총시간은 **200+150=350ms가 아닙니다.** DB 150ms는 부모의 200ms 안에 이미 포함되기 때문입니다.

```text
HTTP parent    |==================== 200 ms ====================|
DB child              |=============== 150 ms ===============|
추가적으로 병렬 실행된 자식이 있다면 두 자식의 시간도 서로 겹칠 수 있음
```

원인 후보를 좁힐 때는 parent/child 포함 관계, 실제 시간선의 겹침, 추적 샘플의 누락을 구분해야 합니다. 모든 요청이 추적되는 것도 아니므로 **느린 요청 Trace 한 건이 곧 서비스 전체 p99를 대표한다**고 주장해서는 안 됩니다. 사용자 측 응답 완료 시각, 서버의 HTTP 타이머, 풀 메트릭, DB 실행 시간은 같은 시간 창·엔드포인트·배포 버전을 기준으로 대조합니다.

### 증상 → 가설 → 측정 → 수정 → 재검증

다음 순서를 기준으로 원인을 분리합니다.

1. **증상 고정:** 예를 들어 `GET /api/concepts/{id}`에서 변경 후 p99가 180ms→420ms로 증가했다고 가정합니다. 측정 대상 경로와 요청량, 오류율 및 성공 기준을 먼저 정합니다.
2. **가설 비교:** 연결 풀 대기 때문인지, SQL 실행 자체가 느린지, 외부 API 시간 초과 때문인지 가능한 원인을 적고 각 후보를 반증할 지표를 정합니다.
3. **측정 경계 확인:** 같은 배포 버전·시간 창의 HTTP 지연 히스토그램, Hikari active/pending/timeout, SQL 실행/락 대기, trace의 외부 I/O 구간을 연결합니다. 관측 불가능한 구간은 추측으로 채우지 않습니다.
4. **최소 조치:** 풀 대기라면 연결 반환 누락·트랜잭션 보유 시간·과도한 동시성을 먼저 살피고, SQL 실행이 느리다면 쿼리와 실행 계획을 분석합니다.
5. **변경 전후 검증:** 동일한 데이터셋·부하 프로파일에서 성공 처리량, p95/p99, 오류율, 대기 수와 DB 포화를 함께 비교합니다. 한 지표가 좋아져도 다른 하위 시스템이 포화되면 개선이라고 단정할 수 없습니다.

이 Concept의 목표는 메트릭 도구 사용법 자체가 아닙니다. **서로 다른 실행 구간을 올바르게 귀속하고, 지표가 실제로 반증할 수 있는 원인 가설만 세워, 측정으로 변경 효과를 검증하는 판단 능력**입니다. 트랜잭션 설계나 SQL 최적화의 구체적인 구현은 각 Backend·Database 영역에서 이어집니다.

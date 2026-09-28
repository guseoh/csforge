---
kind: concept
contentKey: messaging.core.workflow.schema-evolution
topicContentKey: messaging.core.workflow
slug: schema-evolution
title: "메시지 스키마의 호환 가능한 진화"
summary: "프로듀서와 컨슈머가 다른 버전으로 공존하고 과거 메시지를 재생하는 환경에서 하위·상위 호환성과 배포 순서를 설계한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kafka.apache.org/intro/"
    title: "Apache Kafka Documentation: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "이벤트·메시지 용어와 키 기반 파티셔닝, 토픽 보존·소비자 분리의 기본 동작을 확인한다."
    displayOrder: 1
    relationNote: "토픽의 이벤트 보존과 여러 consumer의 독립적인 재생 경계 확인"
  - url: "https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html"
    title: "Confluent Documentation: Schema Evolution and Compatibility for Schema Registry on Confluent Platform"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Confluent Schema Registry의 backward·forward·full·transitive 호환성 방향과 format별 제약을 확인한다."
    displayOrder: 2
    relationNote: "Schema Registry의 backward·forward·full·transitive compatibility 정의와 format별 제약 확인"
---
# 메시지 스키마의 호환 가능한 진화

비동기 시스템에서는 프로듀서와 컨슈머를 동시에 배포하기 어렵습니다. 토픽 안에는 이전 버전 메시지가 오래 남아 있을 수 있고, 장애 복구나 프로젝션 재구축을 위해 과거 레코드를 다시 읽기도 합니다. 그래서 메시지 페이로드는 내부 DTO보다 **더 긴 시간 동안 여러 버전의 코드가 공유하는 계약**이 됩니다.

```text
old producer ─┐
              ├─ topic: old/new payload 공존 ─▶ old/new consumer
new producer ─┘
```

### 필드 추가도 컨슈머 가정에 따라 달라진다

선택 필드를 하나 추가해도 이전 컨슈머가 알 수 없는 필드를 거부하면 호환성을 깨뜨리는 변경이 될 수 있습니다. 열거형(enum) 값 추가 역시 이전 코드가 모든 값을 빠짐없이 처리한다고 가정했다면 실패할 수 있습니다.

반대로 필드 삭제나 자료형·단위·의미 변경은 JSON 파싱 자체는 성공해도 업무 의미를 깨뜨릴 수 있습니다.

따라서 “필드 추가는 항상 안전하다”처럼 형식만 보고 판단하지 않고 사용하는 직렬화 형식과 컨슈머 코드의 실제 계약을 확인합니다.

### Backward와 forward는 읽는 방향을 기준으로 본다

Confluent Schema Registry 용어에서 호환성 방향은 다음처럼 정의됩니다.

```text
BACKWARD
새 스키마를 사용하는 consumer가 이전 스키마로 기록된 데이터를 읽을 수 있음

FORWARD
이전 스키마를 사용하는 consumer가 새 스키마로 기록된 데이터를 읽을 수 있음

FULL
양방향 모두 호환
```

또한 비전이(non-transitive) 정책은 직전 버전만 비교할 수 있고, 전이(transitive) 정책은 더 오래된 버전까지 호환성을 검사합니다. 보존 기간 전체를 재생해야 한다면 어느 범위까지 보장하는지 확인해야 합니다.

### 배포 순서도 호환성 설계의 일부다

새 컨슈머가 이전 페이로드를 읽을 수 있는 하위 호환성만 확보된 경우, 새 프로듀서를 먼저 배포하면 아직 남아 있는 이전 컨슈머가 새 페이로드를 처리하지 못할 수 있습니다. 새 컨슈머를 먼저 모두 배포하고 이전 컨슈머를 종료한 뒤 프로듀서를 바꾸는 순서가 안전합니다. 이전 컨슈머도 새 페이로드를 읽을 수 있는 상위 호환성이 확보됐다면 다른 순서를 선택할 수 있으므로, 실제 읽기·쓰기 조합과 배포 중 공존 기간을 확인합니다.

```text
1. 새 consumer 배포
   └─ 이전 payload를 처리할 수 있는지 확인
2. 이전 consumer 종료
   └─ 새 payload를 읽지 못하는 reader 제거
3. 새 producer 배포
   └─ 새 payload 생산 시작
```

실제 순서는 호환성 방향과 제품 배포 구조에 따라 달라집니다.

### 재생은 가장 오래된 계약을 다시 만난다

현재 코드가 오늘 들어오는 메시지만 처리할 수 있어도 수개월 전 보관된 메시지를 재생하지 못한다면 프로젝션 재구축이 실패할 수 있습니다. 필요한 경우 버전별 어댑터나 마이그레이션 컨슈머를 두고, 재생이 과거 이메일·결제 같은 외부 효과까지 다시 실행하지 않게 처리 경계를 나눕니다.

메시지 스키마 진화의 핵심은 Registry 옵션 이름이 아니라 **독립 배포되는 프로듀서·컨슈머와 보관된 메시지가 어느 기간 동안 함께 존재하는지 파악하고 그 전체 기간을 읽을 수 있게 변경하는 것**입니다.

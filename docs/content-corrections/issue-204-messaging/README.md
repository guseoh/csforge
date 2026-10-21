# Issue #204 — Messaging & Async Processing 기존 콘텐츠 교정 기록

## 기준 및 범위

- [Issue #204](https://github.com/guseoh/csforge/issues/204), `content/AGENTS.md`, `content/curriculum/messaging-async.yaml`, `content/README.md`.
- 기준 `main`: `acd47851637838c2a7db6ea522308ebb32db3914`.
- Messaging **3 Topic / 9 Concept / 27 Question**를 기존 본문과 연결된 문항·Curriculum 목표에 대조했다. 이미 충분한 설명은 그대로 둔다.
- Content Pack 확장·Question 추가·기능·Spring/Kafka 인프라 구현은 이 PR 범위에 포함하지 않는다.

## KEEP / FIX 및 시각화 판정

| Topic | Concept (기존) | 판정 | 문항 |
| --- | --- | --- | --- |
| semantics | `message-model` | KEEP — command/event 책임·완료 시점이 기존 TEXT 흐름에 나타남 | 3 KEEP |
| semantics | `partition-key` | 본문 KEEP / `partition-key.q1` FIX — 키 기반 파티셔닝 질문의 빠진 전제 명시 | 2 KEEP, 1 FIX |
| semantics | `consumer-offset` | KEEP — record offset, current/committed position 및 복구 예제 적절 | 3 KEEP |
| delivery | `at-least-once-idempotency` | KEEP — 중복 업무 효과, DB transaction, Kafka EOS 경계 적절 | 3 KEEP |
| delivery | `retry-dlq` | KEEP — retry budget, DLQ, 순서·중복 경계 적절 | 3 KEEP |
| delivery | `ordering` | 본문 KEEP / `ordering.q1` FIX — 참으로 읽히는 경쟁 오답 제거 | 2 KEEP, 1 FIX |
| workflow | `transactional-outbox` | KEEP — 업무 DB commit + outbox 원자성, 릴레이·중복 분리 | 3 KEEP |
| workflow | `backpressure-capacity` | KEEP — 생산률/소비률, lag, 재시도·외부 의존성 병목 | 3 KEEP |
| workflow | `schema-evolution` | KEEP — backward/forward, 기간 내 재생, 구버전 consumer | 3 KEEP |

**Visual:** 9개 모두 기존 **TEXT/ASCII** 실행 흐름이 본문과 연결되어 있어 KEEP. 새 SVG가 학습 효과를 확실히 높이지 않으므로 임의 추가하지 않는다. 기존 asset의 ALT, 다크/라이트, 모바일 UI를 새로 테스트했다는 의미는 아니다.

## 수정 이유와 1차 자료

1. `messaging.core.semantics.partition-key.q1` (SHORT_ANSWER/EASY): “파티셔너가 사용하는 값”은 명시적 파티션, 키 누락, 키 무시 설정, 사용자 정의 파티셔너에서 무조건 키로 설명할 수 없다. **기본 키 기반 파티셔닝이며 명시적 파티션이 없는 경우**로 질문 전제를 한정하고 해설에 예외를 보강한다. 기존 4개 `acceptedAnswers` 유지.
2. `messaging.core.delivery.ordering.q1` (MULTIPLE_CHOICE/MEDIUM): 기존 오답 A는 “Kafka가 같은 키의 레코드를 이벤트 타임스탬프 순으로 재정렬하지 않는다”는 사실로, 정답 B와 함께 참인 원인으로 해석될 수 있었다. A를 “이벤트 타임스탬프 순 자동 재정렬”이라는 실제로 틀린 개념으로 바꾸고 선택지 rationale을 맞췄다. 정답 **B** 유지.

실제 대조한 공식 자료:
- [Kafka 4.2 ProducerRecord](https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/producer/ProducerRecord.html) — optional explicit partition, key, timestamp; 기록 순서와 timestamp 별개.
- [Kafka 4.2 Producer Configs](https://kafka.apache.org/42/configuration/producer-configs/) — `partitioner.ignore.keys`, 기본 및 사용자 지정 파티셔닝.

기존 `contentKey`, Question 유형·난도·정답·연결·accepted answer, Concept/curriculum/Reference identity 모두 유지한다. 실제 변경은 두 JSON 파일의 **2 Question**에 한정한다.

## 격리 PostgreSQL 16.4 / Java 25 Spring Boot 검증

[일회성 Actions QA #39546111773](https://github.com/guseoh/csforge/actions/runs/39546111773) **SUCCESS**.
- 일회성 runner에서 Docker Compose PostgreSQL 및 Redis를 실행하고 실제 Spring Boot의 `/api/auth/session mode=LOCAL` 검증.
- canonical 최초 `3,380 CREATED`. 이전 Question 파일 → 교정본의 실제 multipart `Preview / Apply` 각 **2 UPDATED**.
- 변경 파일 exact 재import **18 UNCHANGED**, 전체 canonical rebootstrap **3,380 UNCHANGED**, 오류 0.
- 실제 Messaging 객관식 A 오답 → WrongNote/ReviewSchedule 및 personal note 생성, 교정 Import 이후 10개 테이블의 데이터 digest/두 Question stable ID/기존 오답 Result 불변 확인.
- 교정 후 같은 객관식 B 정답, 키 기반 단답형 “메시지 키” 정답을 실제 Quiz API로 재검증.
- 위 결과는 격리 실행이며 **Production DB Import가 아니다**. 일회성 Workflow는 검증 뒤 PR에서 제거한다.

## 병합 전 게이트

- 최종 정리 HEAD Repository Validation PASS, review thread, 충돌, base drift, diff 재확인.
- #204 전체 6개 영역 중 여기서는 Messaging 한 영역만 검토. 다른 5개 영역을 완료했다고 주장하지 않는다.
- Issue #204의 Human Usage Check는 이 자동화된 실제 API/DB 검증으로 대체되었다고 주장하지 않는다. 별도 수동 검증/게이트 조정은 명시적 사용자 결정으로 처리한다.

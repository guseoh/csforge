# Wave 1 — 직접 의미 검토

기준선 `efe73a15da14c996bd08344181d4d6f87073803d`, 기존 PR [#223](https://github.com/guseoh/csforge/pull/223)의 보완이다. 6 Area의 18 Topic을 아래 순서로 읽고 **54 Concept / 162 Question 전수**의 개별 근거를 작성했다. 파서는 읽기·관계 대조·재집계에만 사용했고 품질 판정은 작성하지 않았다. canonical 콘텐츠·자산·DB·Import에는 변경이 없다.

| Area / 수동 ledger | 완료 C / Q | C KEEP / ENHANCE | Q KEEP / ENHANCE | 미완료 C / Q |
| --- | ---: | ---: | ---: | ---: |
| [Cache](cache.json): models → consistency → operations | 9 / 27 | 7 / 2 | 26 / 1 | 0 / 0 |
| [Messaging](messaging-async.json): semantics → delivery → workflow | 9 / 27 | 7 / 2 | 25 / 2 | 0 / 0 |
| [Infrastructure](infrastructure-cloud.json): compute → network → reliability | 9 / 27 | 6 / 3 | 25 / 2 | 0 / 0 |
| [Performance](performance-observability-operations.json): measurement → observability → operations | 9 / 27 | 8 / 1 | 27 / 0 | 0 / 0 |
| [Distributed](distributed-systems.json): time-failure → consistency → coordination | 9 / 27 | 8 / 1 | 25 / 2 | 0 / 0 |
| [System Design](system-design.json): requirements → architecture → reliability | 9 / 27 | 7 / 2 | 25 / 2 | 0 / 0 |
| 합계 | **54 / 162** | **43 / 11** | **153 / 9** | **0 / 0** |

모두 `CURRENT_VERIFIED`인 **검토 근거**를 가진다. 이는 품질 `KEEP`과 다른 값이다. 문제를 발견한 11 Concept / 9 Question은 `TARGETED_ENHANCE`다. 이번 범위에서 `REWRITE_REQUIRED`는 없다. 전체 저장소의 품질 `NEEDS_REVIEW`는 **Concept 652 / Question 2,286**으로 남는다. 구조 검사 성공이나 과거 Wave PASS로 새로운 KEEP을 만들지 않았다.

초기 PR 감사의 `review-notes.json`은 그대로 보존했다. 초기 샘플에서 겹치는 8 Concept / 21 Question은 새 직접 전수 근거로 대체하되 해당 원래 판단을 `priorSampleReview`로 유지한다. 초기와 이번의 고유 직접 접근 수는 85 Concept / 239 Question이며, 그중 31 / 77은 초기 샘플 `CURRENT_PARTIAL` 근거다. 이 31 / 77을 이번 Wave 전수 완료 수에 더하지 않는다. 나머지 636 Concept는 새로운 개별 본문 검토가 없고, 초기 부분 검토 중 16 Concept도 품질 NEEDS_REVIEW에 남아 652가 된다.

## 항목별 추적 방법

각 ledger의 `concepts` 행은 `[contentKey, qualityDecision, objectiveLevelDepth, accuracyMechanismCodeExamplesClarityBoundaries, visualization, references, linkedQuestionCoverage]`다. 학습 목표·Level·깊이, 필요한 이유·내부 동작·상태·예제/코드의 적절성, 한국어 가독성, 오해·실패·절충, 도식 계약, 출처, 문항 검증을 다섯 근거 칸에 연결했다. 이 Area들의 운영·설계 목표에서 실행 프로그램이 필수인지를 판단했으며 코드 개수를 충분성 기준으로 삼지 않았다. 본문 예제 프로그램을 실제 실행하거나 제품 구현을 시험한 감사는 아니다.

`questions` 행은 `[contentKey, qualityDecision, answerChoicesRationalesModelExplanation, ambiguityDifficultyDuplication]`다. MC는 A~D를 각각 정답과 비교하고 모든 rationale를 읽었다. SHORT_ANSWER는 prompt와 accepted 동의어 범위를 비교했다. SCENARIO/DESCRIPTIVE는 modelAnswer와 explanation을 모두 읽었다. Topic `coverage`는 목표 중복과 적절한 적용·복습의 구분을 기록한다. Difficulty는 Concept Level과 독립적으로 판단한다.

`sourceHashes`는 읽은 개별 Concept 파일 및 Question object의 기준선 SHA256이다. Curriculum/Topic catalog hash도 고정했다. 위치·arrayIndex·연결 Concept와 펼친 근거는 [Concept inventory](../inventory.json), [Question inventory](../question-inventory.json)의 같은 contentKey에서 확인한다. [집계](../wave-1-summary.json), [12개 발견 원문](../wave-1-findings.json)은 ledger에서 재생성한다. 생성기는 누락·중복·hash 변화를 거절하며 verdict를 추론하지 않는다.

## 실제 발견과 최소 후속 범위

| ID / severity | 정확한 contentKey와 근거 위치 | 문제 / 권장 변경 |
| --- | --- | --- |
| W1-CACHE-001 / P1 | `cache.core.models.write-strategies` — `content/cache/models/write-strategies.md` | Write-Behind 도식의 성공 응답이 캐시 기록보다 먼저다. 본문의 기록→ACK→비동기 DB 및 crash 경계와 맞춘다. |
| W1-CACHE-002 / P1 | `cache.core.consistency.invalidation`, `.q2` — `content/cache/consistency/invalidation.md`, `questions.json` | 최신 버전 확인 이후 stale SET까지의 race가 남는다. 비교/발행의 원자 조건과 DB→cache generation 전파 실패를 명시한다. Redis Lua 원자성은 PostgreSQL까지 포함하지 않는다. |
| W1-MSG-001 / P1 | `messaging.core.semantics.partition-key`, `.q1` — `content/messaging-async/semantics/questions.json` | 키만 받는 단답에 explicit partition/null key/custom partitioner 조건이 없다. key 기반 routing 조건을 명시한다. |
| W1-MSG-002 / **P0** | `messaging.core.delivery.ordering`, `.q1` — `content/messaging-async/delivery/questions.json` | timestamp 재정렬 없음(A)과 key의 업무 버전 직렬화 없음(B)이 모두 순서 미보장의 이유다. A rationale도 사실을 인정한다. 선택지 A를 실제 오답으로 바꿔 단일 정답 B와 맞춘다. |
| W1-INFRA-001 / P2 | `infrastructure.core.compute.execution-models` — `content/infrastructure-cloud/compute/execution-models.md` | Curriculum의 restart/recreate 구분을 본문에서 직접 비교하지 않는다. process/동일 container/새 container/Pod 교체의 상태 수명을 표로 나눈다. |
| W1-INFRA-002 / P1 | 위 Concept의 `.q1` — `content/infrastructure-cloud/compute/questions.json` | 열린 핵심 비교 기준을 네 고정 문자열로 채점한다. 명시된 용어 질문이나 서술 rubric으로 한정한다. |
| W1-INFRA-003 / P1 | `infrastructure.core.network.network-boundaries`, `.q2` — `content/infrastructure-cloud/network/questions.json` | AWS 보안 그룹은 EC2/ECS metadata를 필터하지 않는다. 일반 egress와 metadata 전용 통제의 실제 범위를 분리한다. |
| W1-INFRA-004 / P1 | `infrastructure.core.reliability.backup-restore` — `content/infrastructure-cloud/reliability/backup-restore.md` | NIST Reference가 withdrawn/no-download 판본으로 연결된다. 공식 `r1/upd1/final` 및 복구 목표/시험 절로 안내한다. |
| W1-PERF-001 / P2 | `performance.core.measurement.latency-throughput` — `content/performance-observability-operations/measurement/latency-throughput.md` | 현재 도식은 표본→지표 목록이다. 같은 평균·다른 꼬리의 실제 분포와 p95 집계를 보여준다. |
| W1-DS-001 / P2 | `distributed.core.coordination.cap-tradeoffs`, `.q1`, `.q3` — `content/distributed-systems/coordination/cap-tradeoffs.md`, `questions.json` | formal A의 응답이 유효한 읽기/쓰기 완료라는 점을 명시해 error-only response 오해를 막는다. 기존 정리·정답은 유지한다. |
| W1-SYS-001 / P2 | `system-design.core.requirements.capacity-data`, `.q2` — `content/system-design/requirements/questions.json` | 수치가 주어졌지만 답에 계산 과정이 없다. RPS→peak→query/s·bytes/day를 단위/가정과 함께 계산한다. |
| W1-SYS-002 / P1 | `system-design.core.reliability.failure-isolation`, `.q3` — `content/system-design/reliability/questions.json` | “처리 중 상태로 거절”은 durable accept와 미접수 거절을 섞는다. rejected/degraded/accepted-pending과 이후 완료 책임을 나눈다. |

P0 1 / P1 7 / P2 4 **그룹**이며, 연결 Concept와 Question을 별개 발견으로 중복 집계하지 않는다. 전면 재작성 대신 [#204](https://github.com/guseoh/csforge/issues/204)에서 위 key만 정밀 보강할 범위다. #205~#207의 새 콘텐츠 확장 필요성을 의미하지 않는다. 출처 접근·동선은 #222와 중복 소유하지 않도록 #204의 내용 변경과 조정한다. 후속 구현 및 새 Issue는 만들지 않았다.

## 도식·Reference 검토 한계

이 54 Concept에 이미지/SVG 참조는 없고, 기존 60 SVG는 Java/OS에 있다. 따라서 Wave 1은 NONE/TEXT/DIAGRAM 계약과 **기존 ASCII·표·시간선의 학습 효과**를 직접 검토했다. 이를 기존 전체 Reader 화면 QA 완료로 표시하지 않는다. 유지/보강 상태는 각 Concept의 visualization 근거에 있다. 새 그림은 만들지 않았다.

우선 보강 후보는 Write-Behind 기록/ACK/DB/crash, invalidation의 read-v1→check→write-v2/DEL→late SET-v1, restart/recreate의 상태 수명, latency 분포, capacity 단위 흐름, rejected/degraded/pending 상태 분기다. 기존 quorum 집합, Lease A/B와 41/42, Saga 정방향/보상, DNS 공존, HPA 지연 흐름은 유지한다. Raft의 current-term/old-term commit 로그 그림, 복구의 중단/탐지/복원 작업 구간 시간선은 선택적 보조 후보이며 필수 결함으로 확대하지 않았다.

Reference는 관계별 제목/안내/역할과 주요 기술 주장을 대조했다. 전문 전체를 읽었다고 표시하지 않는다. 다음 4 canonical URL은 상세 학습 가치 확인이 아직 `NEEDS_REVIEW`다. 본문 핵심 사실은 접근 가능한 공식/원저자 자료로 별도 확인했으며, 이 보충 출처를 새 PASS로 올리지 않았다.

- LINE `how-to-use-kafka-in-line-1/`: open InternalError, 공식 검색 캐시 제목/주제만 확인.
- Kakao `tech.kakao.com/posts/747`: 제목은 확인했으나 도구 추출이 navigation/footer만 노출.
- Princeton `research/techreps/598`: SAGAS metadata 확인, landing/PDF open 실패.
- ACM DOI `10.1145/564585.564601`: open 실패. 원저자 MIT 공개 사본으로 CAP 내용 확인.

NIST URL 문제는 접근 실패가 아니라 **접근한 문서의 withdrawn/superseded 상태**로 확정했다. Little 논문은 abstract의 가정을 확인했으며 전문 증명 검토로 표시하지 않는다. 회사 기술 블로그는 해당 제품/설정/사례의 보충 자료로만 평가한다. 원문 접근 실패를 dead link나 P0로 단정하지 않았다.

## 재실행·검토 gate

`python docs/content-audit/learning-experience-2026/audit.py` 및 `--check`로 전체 구조, Wave의 216개 개별 hash/18 Topic/6 Area/Reference 관계 포함/발견 인용·중복을 확인한다. `read-topic.py AREA TOPIC`은 전문 읽기 보조 도구이며 verdict를 출력하지 않는다. 재실행은 외부 사이트를 재조회하지 않아 날짜별 네트워크 차이를 의미 판정 변화로 만들지 않는다.

완료 범위는 이 Wave의 직접 콘텐츠 검토다. 나머지 9 Area, 실행 코드·프로덕션 부하 시험, 모든 Reference 전문, Reader의 theme/mobile 접근성·human learning QA는 미완료다. ChatGPT의 최종 콘텐츠 검토에서 P0의 단일 정답 성립, P1의 조건 누락과 source 한계, P2의 보강 필요성 및 범위를 확인한 뒤 후속 작업에 사용한다. PR 신규 생성·병합은 하지 않는다.

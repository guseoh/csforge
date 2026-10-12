# Wave 2 발견 사항

개별 의미 검토에서 확정한 34개 그룹이다. 검토 완료와 수정 완료는 다르며 canonical 본문/문항은 변경하지 않았다. 기술적 확정과 Reference 접근성의 재확인 필요는 각 근거에서 구분한다.

## W2-BE-001 — P0

대상: `backend.core.layering.orchestration-rule`

원문: [content/backend-engineering/layering/orchestration-rule.md:56](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/backend-engineering/layering/orchestration-rule.md#L56)

> 4. 외부 환불 요청 또는 outbox 기록

문제: 번호 흐름은 3단계 DB 변경 확정 뒤 4단계 outbox 기록을 대안으로 제시한다. transactional outbox는 업무 변경과 전달 의도를 같은 DB TX로 원자적으로 commit해야 한다. commit 뒤 기록하면 중간 crash에 전달 의도가 유실돼 원래 dual-write 문제가 남는다.

최소 보강: 직접 환불의 별도 복구 방식과 outbox 방식을 나눈다. outbox는 상태 변경 + outbox 기록 → 동일 TX commit → 별도 relay 환불/전송으로 표시한다. 정확한 책임 설명과 문항, 이전 Wave 1 결과는 유지한다.

후속: #203

## W2-BE-002 — P1

대상: `backend.core.domain.invariant-lifecycle`, `backend.core.domain.invariant-lifecycle.q3`

원문: [content/backend-engineering/domain/questions.json:111](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/backend-engineering/domain/questions.json#L111)

> Domain API와 DB 동시성 경계를 포함해 설명하라

문제: q3의 질문과 정확한 모델은 domain 전이 외에도 expected version/조건부 UPDATE, durable 결제 attempt/금액, idempotency key, unknown 결과 대사를 요구한다. 연결 Concept는 L1 invariant-lifecycle 하나뿐이며 본문은 이 DB/분산 실패 보호 기법을 설명하지 않아 학습 목표 연결이 부족하다.

최소 보강: HARD 응용 문항과 정확한 실패 시나리오는 유지하고 관련 Concept를 다중 연결한다. 학습 순서/선행 목표와 모델의 필수 domain 답 및 심화 실패 복구 기준을 명시하거나 심화 Topic 이후에 배치한다. L1 전체 재작성이나 신규 문항은 불필요하다. 직접 검토한 후보: backend.core.concurrency-transaction.optimistic, backend.core.idempotency.idempotency-key, backend.core.idempotency.race-expiry, backend.core.testing-recovery.failure-recovery.

후속: #203

## W2-BE-003 — P1

대상: `backend.core.api.methods-status`

원문: [content/backend-engineering/api/methods-status.md:27](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/backend-engineering/api/methods-status.md#L27)

> safe, idempotent

문제: Curriculum의 safe/idempotent 의미 목표 중 safe는 표의 true/false만 제공한다. GET이 왜 안전해야 하는지, logging 등 부수 효과와 요청된 변경의 차이, PUT의 unsafe/idempotent 조합을 학습할 근거가 부족하다.

최소 보강: safe를 요청 의도상 읽기 전용으로 설명하고 logging은 부수 효과일 수 있음을 구분한다. 상태를 바꾸는 GET이 prefetch/자동 탐색으로 실행되는 실패 예와 GET vs PUT 비교를 짧게 추가한다. 기존 멱등성·상태코드 설명과 정확한 문항은 유지한다.

후속: #203

## W2-BE-004 — P2

대상: `backend.core.concurrency-transaction.optimistic`

원문: [content/backend-engineering/concurrency-transaction/optimistic.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/backend-engineering/concurrency-transaction/optimistic.md#L12)

> https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/version

문제: 유일한 공식 Reference의 직접 접근에서 도구가 404를 보고했지만 공식 검색에는 동일 URL의 Version 본문이 색인되어 있다. 모든 학습자에게 깨진 링크라고 확정할 근거는 부족하며 접근성을 재확인해야 한다. 검색 본문의 revision/optimistic conflict 계약은 canonical 설명과 일치한다.

최소 보강: 동일 Jakarta Persistence 3.2 Version API의 접근성을 실제 브라우저/공식 canonical 링크로 재확인하고 필요한 경우 검증된 공식 경로로 Reference만 교체한다. 도구의 404만으로 대소문자 경로가 틀렸다고 단정하지 않는다. 본문과 정답은 유지한다.

후속: #203

## W2-BE-005 — P1

대상: `backend.core.bulk-batch.file-api`

원문: [content/backend-engineering/bulk-batch/file-api.md:43](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/backend-engineering/bulk-batch/file-api.md#L43)

> 서버와 reverse proxy의 최대 본문 크기

문제: 목표는 multipart 개수와 크기를 함께 제한하는 것이지만 본문은 최대 본문 크기/동시 업로드/디스크만 설명하며 part 개수 상한은 제시하지 않는다. 총 byte가 작아도 많은 작은 part의 metadata/parser 부담이라는 별도 자원 비용을 판단하기 어렵다.

최소 보강: 전체 request 크기, 개별 file 크기, part/file 개수, 동시 수와 temp quota를 분리한 계약 표 및 거절/부분 수신 정리 예를 추가한다. 서버/parser 설정은 실제 구현에 따라 검증하며 RFC multipart가 자동으로 상한을 준다고 표현하지 않는다.

후속: #203

## W2-BE-006 — P1

대상: `backend.core.time-money.instant-zone`

원문: [content/backend-engineering/time-money/instant-zone.md:72](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/backend-engineering/time-money/instant-zone.md#L72)

> DST나 정책 변경을 다시 계산하기 어려워질 수 있습니다.

문제: L3 목표는 DST/offset 변화의 예약·마감 영향을 설명하는 것이지만 본문은 ZoneId의 필요성만 제시한다. local time이 유효 offset 0개/2개를 갖는 경우와 업무 선택 정책을 설명하지 않는다.

최소 보강: DST 지역의 gap/overlap 한 쌍을 검증된 TZDB 날짜로 제시한다. 예약을 거절/이동하거나 earlier/later offset을 택하는 정책을 명시한다. LocalDateTime + ZoneRules 유효 offset → 정책 → Instant 흐름을 보여주고 Java 기본 resolver와 업무 정책을 구별한다.

후속: #203

## W2-BE-007 — P1

대상: `backend.core.evolution.migration`

원문: [content/backend-engineering/evolution/migration.md:34](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/backend-engineering/evolution/migration.md#L34)

> 필요하면 backfill / dual write

문제: L3 공존 배포 예에서 old version이 name을 계속 수정하면 이미 backfill한 first/last 값이 낡을 수 있다. 이 흐름과 해결 조건이 빠져 있어 단계 이름만으로 데이터 사용 전환의 안전성을 판단하기 어렵다.

최소 보강: old/new writer와 backfill이 겹치는 한 row의 timeline을 보여준다. authoritative 읽기/쓰기 경계, 검증된 dual write 또는 catch-up 조건, idempotent backfill/진행 대조와 rollback 호환성을 정한다. old 쓰기 종료와 데이터 일치 확인 후 contract한다. 특정 trigger/도구를 무조건 도입하지 않는다.

후속: #203

## W2-BE-008 — P1

대상: `backend.core.testing-recovery.testing-strategy`

원문: [content/backend-engineering/testing-recovery/testing-strategy.md:29](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/backend-engineering/testing-recovery/testing-strategy.md#L29)

> 무엇을 믿지 않는지에 따라 테스트가 달라진다

문제: Curriculum 목표의 외부 시스템 대역이 본문 표와 예제에서 빠져 있다. repository mock이 DB를 증명하지 못한다는 설명만으로 vendor client의 HTTP/body/업무 오류/unknown timeout을 어느 경계에서 시험할지 판단하기 어렵다.

최소 보강: 외부 adapter의 순수 fake와 실제 HTTP client에 붙이는 stub/mock server가 잡는 회귀를 구분한다. 200 필수값 누락/429/500/timeout 검증 예와 provider contract fixture의 판본/민감값 제거를 기록한다. 대역 성공은 실제 provider 보장 증거가 아님을 명시한다. 특정 도구의 전체 튜토리얼은 불필요하다.

후속: #203

## W2-DB-001 — P1

대상: `database.core.model.normalization`

원문: [content/database/model/normalization.md:39](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/model/normalization.md#L39)

> update anomaly

문제: Curriculum 목표는 갱신·삽입·삭제 이상을 줄이는 정규화지만 본문과 문항은 갱신 이상과 snapshot만 다룬다. 주문 없는 회원의 사실을 입력하지 못하거나 마지막 주문 삭제로 회원 사실까지 사라지는 실패 조건을 이해할 근거가 없다.

최소 보강: 기존 주문/회원 표를 재사용해 주문 없는 회원 삽입과 마지막 주문 삭제 전후를 설명한다. 분리한 모델이 각 사실을 독립적으로 보존하는 이유를 추가한다. 정규형 암기나 새 Concept 생성 없이 기존 설명을 보강한다.

후속: #202

## W2-DB-002 — P1

대상: `database.core.model.relation-tuple`, `database.core.model.relation-tuple.q2`

원문: [content/database/model/questions.json:45](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/model/questions.json#L45)

> 관계형 모델에서 테이블의 행 순서가 본질적인 속성이 아니라고 보는 이유

문제: q1/q2는 모두 ORDER BY, 행 순서 미보장, 동률 해소를 검사한다. 핵심 목표인 순수 set/SQL bag과 DISTINCT/저장 key 제약은 개별 문항에서 검증되지 않아 목표 중복과 공백이 생긴다. q2의 현재 정답 자체는 정확하다.

최소 보강: q1의 정렬 입문을 유지한다. 기존 q2를 동일 tuple 중복이 SQL에서 가능한 이유, DISTINCT 결과와 PK/UNIQUE 저장 제약의 차이를 설명하는 목표로 최소 재구성한다.

후속: #202

## W2-DB-003 — P0

대상: `database.core.sql.select-order`, `database.core.sql.select-order.q1`

원문: [content/database/sql/questions.json:2](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/sql/questions.json#L2)

> WHERE는 GROUP BY와 집계 계산 전에 개별 행을 필터링하므로 아직 AVG 결과가 없기 때문이다

문제: 질문은 그룹 집계 필터에 사용하는 SQL 절을 요구하지만 acceptedAnswers 첫 문장은 HAVING이라는 답 없이 WHERE 사용 불가의 이유만 제시한다. 이 문자열을 그대로 낸 비응답이 정답으로 채점될 수 있다. 정답 절과 해설, Concept 본문은 정확하다.

최소 보강: 기존 q1 acceptedAnswers를 HAVING 또는 HAVING을 명시한 동등 표현으로 제한하고 원인만 적은 문장은 explanation에 유지한다. 채점 normalization 후 비응답이 정답이 되지 않는지 검증한다. canonical 수정은 후속 Issue 범위다.

후속: #202

## W2-DB-004 — P1

대상: `database.core.sql.window-function`

원문: [content/database/sql/window-function.md:63](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/sql/window-function.md#L63)

> ORDER BY created_at, id

문제: Curriculum은 PARTITION/ORDER/frame에서 순위·누적합 계산을 목표로 하지만 본문은 frame을 정의하지 않는다. 같은 정렬값의 peer가 기본 frame에 함께 들어가는 누적합과 명시적 ROWS의 범위를 구별할 근거가 없다.

최소 보강: 기존 누적합 예에 partition과 현재 행의 frame, PostgreSQL 기본 frame의 peer 포함을 설명한다. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW와 비교한다. 같은 created_at 두 행의 결과 표와 unique id 추가 시 의미 차이를 보여준다. rownum 후속 filter에 subquery가 필요하다는 실행 예도 짧게 덧붙일 수 있다.

후속: #202

## W2-DB-005 — P2

대상: `database.core.index.covering-index`, `database.core.index.covering-index.q2`

원문: [content/database/index/questions.json:7](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/index/questions.json#L7)

> 실행 계획에서 함께 확인할 PostgreSQL 상태는 무엇인가?

문제: q1/q2의 답과 해설은 모두 visibility map의 all-visible 미충족 → Heap Fetches라는 같은 목표를 반복한다. 두 정답은 정확하고 핵심 가시성 목표도 검증되므로 P2의 선택적 보강으로 분류한다.

최소 보강: q1을 유지하고 기존 q2를 key/INCLUDE payload 차이 또는 큰 payload의 쓰기·캐시 비용과 읽기 이득을 선택하는 사례로 확장한다. 정확한 본문과 가시성 설명은 유지하며 새 문항 추가는 불필요하다.

후속: #202

## W2-DB-006 — P1

대상: `database.core.optimizer.statistics`

원문: [content/database/optimizer/statistics.md:73](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/optimizer/statistics.md#L73)

> expression / parameter 영향

문제: Curriculum은 오래된 통계와 parameter/데이터 쏠림을 구별하는 진단 목표지만 parameter 영향은 원인 목록 한 줄뿐이다. ANALYZE로 통계를 갱신한 뒤에도 같은 prepared query가 parameter 분포/generic 추정으로 다른 비용을 내는 이유를 설명하지 않는다.

최소 보강: 기존 PAID/PENDING 분포를 재사용해 같은 query의 다른 값에 대한 예상/실제 행수 차이와 PG generic/custom 계획을 비교한다. EXPLAIN EXECUTE로 실제 parameter와 plan을 확인하는 경로를 제시한다. force_custom을 만능 처방으로 권장하지 않으며 정확한 freshness/correlation 설명과 문항은 유지한다.

후속: #202

## W2-DB-007 — P1

대상: `database.core.isolation.serializable`

원문: [content/database/isolation/serializable.md:65](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/isolation/serializable.md#L65)

> backoff(attempt);

문제: bounded retry Java 예는 모든 SerializationFailure를 catch하고 마지막 시도에도 backoff한 뒤 loop를 그냥 끝낸다. MAX_RETRIES 전부 실패해도 실패 전달/result가 없어 호출자가 성공처럼 흐름을 계속할 수 있다.

최소 보강: 전체 TX 재시도 원리는 유지하고 마지막 실패는 재throw 또는 소진 예외/명시적 실패 결과로 전달한다. 다음 시도가 있을 때만 backoff하며 예산 소진·관측·외부 부수 효과 경계를 짧게 기록한다. 실제 Spring retry 기능 구현은 감사 범위 밖이다.

후속: #202

## W2-DB-008 — P0

대상: `database.core.locking.row-lock`, `database.core.locking.row-lock.q2`

원문: [content/database/locking/questions.json:3](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/locking/questions.json#L3)

> 같은 row에 대한 locking read가 T1의 transaction lock과 충돌하기 때문이다

문제: 질문은 T2의 일반적인 동작을 묻지만 acceptedAnswers 중 한 항목은 충돌 원인만 말하고 대기 동작을 답하지 않는다. 같은 잠금 충돌은 NOWAIT 오류/SKIP LOCKED 제외 정책과도 관련되므로 충돌이라는 말만으로 행동 답을 완성하지 못한다. 현재 대기 정답과 해설은 정확하다.

최소 보강: 원인만 적은 문장에 대기 동작까지 명시하거나 acceptedAnswers에서 제거하고 해설에 유지한다. 명확한 대기 답은 보존하고 요청 동작을 빠뜨린 비응답이 채점을 통과하지 않도록 확인한다.

후속: #202

## W2-DB-009 — P1

대상: `database.core.mvcc.visibility`

원문: [content/database/mvcc/visibility.md:27](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/mvcc/visibility.md#L27)

> 가시성 규칙이 읽을 버전을 선택합니다.

문제: Curriculum은 xmin/xmax와 commit 상태로 tuple 선택을 개념적으로 추론하게 하지만 본문과 문항은 RC/RR snapshot 수명만 설명한다. 어떤 생성/갱신 TX의 버전이 snapshot에서 보이는지 판단하는 가시성 규칙 자체가 빠져 있다.

최소 보강: 기존 S1/S2 그림에 old/new tuple의 생성 xmin, 무효화 TX와 commit/abort 상태를 붙인다. UPDATE 전과 commit 후 snapshot의 version 선택을 보여준다. 자기 write, 미commit/abort 및 visible nonzero xmax 예외를 짧게 설명한다. xmax의 lock/multixact 용도 때문에 숫자 대소나 0만으로 단정할 수 없다는 한계를 명시한다. 모든 내부 bit 암기는 불필요하다.

후속: #202

## W2-DB-010 — P1

대상: `database.core.query-patterns.keyset-pagination`

원문: [content/database/query-patterns/keyset-pagination.md:42](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/database/query-patterns/keyset-pagination.md#L42)

> 803 ─ 802 ─ 801 │ 800 ─ 799 ─ 798

문제: 첫 도식은 page 1의 마지막 cursor를 800이라고 쓰면서 구분선을 801과 800 사이에 둔다. strict tuple < cursor SQL은 800을 다시 반환하지 않고 799부터 이어야 하므로 소비한 행과 다음 조회 경계를 잘못 읽을 수 있다. SQL과 뒤의 tie 표, 문항은 정확하다.

최소 보강: 같은 created_at에서 803…800을 소비 완료 쪽에 두고 800 뒤에 경계를 표시한다. 다음 쪽은 799/798로 명시하고 strict 조건이 cursor 행을 제외함을 덧붙인다. 정확한 SQL·문항·순서 조건은 유지한다.

후속: #202

## W2-SEC-001 — P2

대상: `security.core.foundations.assets-threats`, `security.core.foundations.assets-threats.q2`

원문: [content/security/foundations/questions.json:5](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/foundations/questions.json#L5)

> 위협은 이를 읽거나 수집하려는 공격자

문제: 모델과 해설은 공격자(threat actor/source)를 위협 자체로 지칭한다. 본문/q1의 구체 행위 기준과 OWASP의 undesirable event 정의에 맞춰 용어를 정밀화할 필요가 있다. 공격 의도는 읽기/수집으로 드러나므로 심각한 재작성 문제는 아니다.

최소 보강: 공격자는 위협 행위자, 위협은 공개된 주문/개인정보의 무단 열람·수집 상황으로 명시한다. 정확한 자산/ACL 취약점/최소 권한 방어는 유지하며 model/explanation의 해당 표현만 보강한다.

후속: #203

## W2-SEC-002 — P0

대상: `security.core.authn-authz.authentication`, `security.core.authn-authz.authentication.q3`

원문: [content/security/authn-authz/questions.json:7](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/authn-authz/questions.json#L7)

> 비밀번호 비교 결과가 `true`이면

문제: q3는 사용자 조회 성공과 matches=true만으로 인증 완료 Authentication이 만들어져 context에 설정된다고 단정한다. Spring provider는 UserDetails 상태 검사를 수행하고 expired credentials 등이 인증을 막을 수 있어 비밀번호 일치만으로 최종 성공을 보장하지 않는다. 계정 상태 등의 추가 전제가 빠져 있다.

최소 보강: q3에 계정/자격증명 상태와 필수 인증 검사가 통과했다는 전제를 명시하거나 모델을 matches는 비밀번호 검증 결과이며 provider 전체 검증 성공 후에만 완료 결과/context를 설치한다고 수정한다. 본문의 단순 흐름에도 전제와 provider 검사 경계를 표시한다. false의 미인증 및 별도 인가 설명은 유지한다. 정확한 계정 상태 근거가 있는 security.core.auth-architecture.user-details와 authentication-token.q2를 참고한다.

후속: #203

## W2-SEC-003 — P1

대상: `security.core.session-cookie.cookie-flags`

원문: [content/security/session-cookie/cookie-flags.md:45](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/session-cookie/cookie-flags.md#L45)

> SameSite는 교차 사이트 자격 증명 전송을 줄인다

문제: SameSite는 site 기준이나 본문은 site를 정의하지 않고 뒤의 SOP/CORS Topic의 origin 기준과도 구별하지 않는다. 같은 site 공격의 한계 경고만으로 app/api 서브도메인이나 포트 차이에서 쿠키 전송/응답 읽기의 다른 판정을 이해하기 어렵다.

최소 보강: scheme + registrable domain의 site와 scheme + host + port의 origin을 비교한다. https app.example.com → api.example.com은 같은 site/다른 origin인 사례와 scheme/포트 차이를 제시한다. Domain/host-only cookie의 전송 범위와 SameSite/인가가 별도 조건임을 연결한다. 정확한 기존 속성 설명과 문항은 유지한다.

후속: #203

## W2-SEC-004 — P1

대상: `security.core.browser.cors-preflight`

원문: [content/security/browser/cors-preflight.md:58](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/browser/cors-preflight.md#L58)

> 사용자 정의 헤더나 특정 본문 형식·HTTP 메서드 조합

문제: L2 본문은 사전 요청 대상을 추상적으로만 설명하고 OPTIONS도 method 허용만 보여준다. q2의 JSON POST가 preflight를 일으키는 이유와 Content-Type application/json, Request-Headers/Allow-Headers 검사를 학습자가 본문에서 재현하기 어렵다.

최소 보강: JSON POST의 OPTIONS Origin/Request-Method/Request-Headers: content-type와 응답 Allow-Origin/Methods/Headers를 끝까지 보여준다. preflight에는 쿠키가 없다는 조건, credentials 본요청 조건, 불허 시 실제 POST 미전송과 실제 응답 읽기 차단을 구분한다. CORS를 인가/CSRF 대체로 바꾸지 않으며 정확한 문항은 유지한다.

후속: #203

## W2-SEC-005 — P1

대상: `security.core.access.vertical`, `security.core.context-authz.method-security`

원문: [content/security/access/vertical.md:49](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/access/vertical.md#L49)

> @PreAuthorize("hasRole('ADMIN')")

문제: route 보안 뒤 method 보안 애너테이션을 보여주지만 @EnableMethodSecurity 등의 활성화 조건과 Spring AOP 호출 경계를 설명하지 않는다. 애너테이션만 붙여 실제로 검사되지 않는 실패를 놓치기 쉽다. 같은 활성화 전제가 L3 method-security 본문에도 빠져 있다.

최소 보강: method security를 활성화한 설정과 Spring 관리 proxy 호출 전제를 명시한다. 미활성 설정/new 객체/self-invocation에서 기본 proxy 검사가 적용되지 않는 조건을 연결한다. 직접 검토한 security.core.context-authz.method-security를 심화 학습 링크로 연결하고 실제 거절 호출 검증을 권한다. 정확한 route/권한 분해와 문항은 유지한다.

후속: #203

## W2-SEC-006 — P1

대상: `security.core.filter-chain.servlet-filter`, `security.core.filter-chain.servlet-filter.q2`

원문: [content/security/filter-chain/questions.json:5](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/filter-chain/questions.json#L5)

> 공유하는 요청 본문 스트림의 소비와 래퍼 경계

문제: q2는 필터의 본문 읽기 이후 MVC 재읽기/보안 로그 문제를 묻지만 연결 본문은 filter 위치/doFilter와 본문을 감쌀 수 있다는 설명만 제공한다. stream 소비와 wrapper의 cache/replay 차이를 학습할 선행 근거가 부족하다.

최소 보강: 필터의 본문 소비 → MVC 파싱 시 empty/불일치 상태를 설명한다. 대안의 읽기 위치/상한, 필요한 bounded replay, secret 로그 제거를 연결한다. ContentCachingRequestWrapper가 자동 replay를 보장하지 않음을 명시한다. 정확한 문항/model은 유지하며 본문 또는 검증된 선행 Concept 연결을 보강한다.

후속: #203

## W2-SEC-007 — P1

대상: `security.core.filter-chain.security-filter-chain`

원문: [content/security/filter-chain/security-filter-chain.md:21](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/filter-chain/security-filter-chain.md#L21)

> 요청에 처음 일치하는 체인 하나의 필터만 실행

문제: first match와 겹치는 matcher는 잘 설명하지만 모든 chain의 securityMatcher 밖인 요청은 Spring Security 필터의 보호를 받지 않는 실패 조건이 빠져 있다. chain 내부 anyRequest 인가가 바깥 요청까지 막는다고 오해하기 쉽다.

최소 보강: securityMatcher는 chain 선택 범위, requestMatchers/anyRequest는 선택한 chain 내부 인가 규칙임을 구별한다. /api-only 설정의 unmatched 외부 경로와 마지막 catch-all chain의 명시적 공개/deny 정책, 실제 매칭 검증을 짧게 추가한다.

후속: #203

## W2-SEC-008 — P1

대상: `security.core.context-authz.context-holder`, `security.core.context-authz.context-holder.q2`

원문: [content/security/context-authz/questions.json:5](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/context-authz/questions.json#L5)

> 명시적 전달용 래퍼와 작업 종료 정리를 사용하고

문제: q2/model은 async worker wrapper와 장기 권한 재검증을 요구하지만 단일 연결 context-holder 본문은 현재 동기 thread 수명/mutability까지만 설명한다. 다음 async-context가 정확한 직접 학습 근거다.

최소 보강: 기존 q2에 직접 검토한 security.core.context-authz.async-context를 다중 연결하고 선행/심화 학습 순서를 명시한다. 정확한 model/정답은 유지하며 context-holder 전체를 다시 써서 async 설명을 중복할 필요는 없다.

후속: #203

## W2-SEC-009 — P2

대상: `security.core.auth-architecture.user-details`

원문: [content/security/auth-architecture/user-details.md:13](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/auth-architecture/user-details.md#L13)

> Spring Security Reference: UserDetailsService

문제: Reference 제목은 조회 협력자 UserDetailsService지만 실제 URL은 UserDetails 결과 객체/credential management 페이지다. 자료는 관련 있고 직접 읽혔으나 두 타입을 혼동하게 하는 metadata 불일치다.

최소 보강: URL을 유지하면 제목을 UserDetails로 맞추고 relationNote를 결과 principal/credential 관리로 정밀화한다. 조회 service 흐름이 목적이면 직접 대조한 공식 user-details-service.html로 교체한다. 자료를 무조건 늘릴 필요는 없으며 정확한 본문/문항은 유지한다.

후속: #203

## W2-SEC-010 — P1

대상: `security.core.tokens-oauth.oauth-oidc`

원문: [content/security/tokens-oauth/oauth-oidc.md:41](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/tokens-oauth/oauth-oidc.md#L41)

> 인가 코드와 PKCE의 검증 흐름

문제: PKCE challenge 검증은 정확하지만 L3 인가 코드 목표의 resource owner/user agent, 동의, redirect callback과 client/AS/RS 신뢰 경계가 그림과 설명에서 빠져 있다. code가 어디를 경유하고 왜 token 교환과 다른지 학습하기 어렵다.

최소 보강: owner/user agent/client/AS/RS의 인가 code → redirect callback → back-channel token → API 사용 전체 sequence를 도식 후보로 기록한다. code의 client/redirect URI/PKCE binding과 callback 상관 검증을 설명한다. state/nonce/PKCE의 역할 및 RFC9700의 조건부 CSRF 대안을 구별하고 모두를 무조건 동시 필수라고 단정하지 않는다. 정확한 PKCE/토큰 목적 문항은 유지한다.

후속: #203

## W2-SEC-011 — P2

대상: `security.core.abuse.file-path`

원문: [content/security/abuse/file-path.md:37](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/abuse/file-path.md#L37)

> 벗어남할 수 있음

문제: 경로 탈출 ASCII 예의 벗어남할은 자연스럽지 않은 한국어 비문이다. 기술 방향과 나머지 파일 보안 경계/문항은 정확하다.

최소 보강: 해당 한 줄을 기준 디렉터리 밖으로 벗어날 수 있음으로 정밀 수정한다. 전체 재작성이나 이미지 수정은 필요하지 않다.

후속: #203

## W2-SEC-012 — P2

대상: `security.core.abuse.file-path`

원문: [content/security/abuse/file-path.md:18](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/security/abuse/file-path.md#L18)

> https://owasp.org/www-community/attacks/Path_Traversal

문제: Reference의 ../ 경로와 입력 통제 설명은 관련 있고 직접 읽었지만, 같은 페이지의 %00.pdf 예시는 Java가 확장자 pdf로 보고 OS가 doc로 본다는 구형 동작을 현재판/실행환경 구분 없이 설명한다. 현재 OpenJDK upstream UnixPath는 NUL을 InvalidPathException으로 거부하므로 현대 Java NIO의 일반 동작으로 이 예제를 채택하면 안 된다. canonical 본문은 해당 NUL 주장을 채택하지 않아 본문 오류와 구분한다.

최소 보강: Reference relationNote에 현대 Java에서 적용할 절(경로/허용 입력/저장 이름)과 구형 NUL 예제의 버전 한계를 명시하거나 현재 OWASP File Upload/검증된 JDK 자료로 학습 경로를 정리한다. 참고 페이지 전체를 무조건 정확하다고 승인하지 않는다. 특정 JDK25/OS 실행 결과는 후속 검증 전 확정하지 않는다.

후속: #203

## W2-SPR-001 — P0

대상: `spring.core.container.application-context`

원문: [content/spring/container/application-context.md:38](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/spring/container/application-context.md#L38)

> BeanPostProcessor 전/후 처리

문제: 도식은 BeanPostProcessor 전/후 처리 → 초기화 콜백 순서다. after-initialization callback까지 초기화 전에 실행된다고 표시해 공식 hook 계약과 충돌한다.

최소 보강: 정의 단계 BFPP 이후 생성/주입 → BPP before(이 경로의 @PostConstruct 처리기) → InitializingBean/custom init → BPP after(일반 auto-proxy) 순서로 해당 도식만 교정한다. 전체 재작성이나 연결 문항 변경은 불필요하다.

후속: #203

## W2-SPR-002 — P1

대상: `spring.core.scope-lifecycle.scope-proxy`

원문: [content/spring/scope-lifecycle/scope-proxy.md:87](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/spring/scope-lifecycle/scope-proxy.md#L87)

> ObjectProvider<RequestContext>

문제: Curriculum은 request/prototype을 긴 수명 Bean에 직접 고정하는 문제를 모두 목표로 삼지만 본문과 문항은 request만 설명한다. prototype은 singleton 생성 시 한 번 주입되고 prototype scoped proxy는 method call마다 새 target이므로 request와 같은 수명 그림으로 일반화할 수 없다.

최소 보강: 기존 request 설명을 유지한다. singleton에 prototype을 한 번 직접 주입하는 경우, 작업 시작 시 ObjectProvider.getObject() 한 번, prototype scoped proxy의 method별 새 target을 비교한다. 상태를 가진 multi-method 작업에서 target이 달라지는 경계를 보여주고 기존 설명/채점 기준에 목표 비교를 반영하는 최소 보강을 권장한다.

후속: #203

## W2-SPR-003 — P1

대상: `spring.core.mvc.dispatcher-servlet`

원문: [content/spring/mvc/dispatcher-servlet.md:36](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/spring/mvc/dispatcher-servlet.md#L36)

> └─ 예외·결과 처리

문제: 첫 도식은 예외·결과 처리에서 Controller로 화살표를 내려 그 처리가 Controller 호출 이전 단계처럼 보인다. 뒤의 POST 흐름 및 공식 MVC processing의 handler 실행과 응답/예외 처리 구분과 맞지 않는다.

최소 보강: Mapping → Adapter(인자 준비) → Controller → 반환값 처리/응답의 정상 경로를 그린다. 각 단계의 예외 → HandlerExceptionResolver는 별도 가지로 표시한다. 기존 두 번째 도식과 정확한 Filter 설명/문항은 유지한다.

후속: #203

## W2-SPR-004 — P1

대상: `spring.core.data-jpa.fetch-plan`

원문: [content/spring/data-jpa/fetch-plan.md:101](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/spring/data-jpa/fetch-plan.md#L101)

> fetch join, entity graph, batch fetch, projection

문제: Curriculum은 fetch join/entity graph/batch fetch 선택 비교를 목표로 한다. 본문은 entity graph의 지정 방식, 필요한 attributes, fetch/load 의미와 고정 SQL 횟수를 보장하지 않는다는 경계를 설명하지 않아 선택 근거가 부족하다.

최소 보강: 같은 Order.member 조회에 @EntityGraph(attributePaths=...) 예와 query별 fetch plan 의미를 추가한다. fetch join/batch와 필요한 data shape, row 증식, pagination/실측 기준으로 비교한다. 1+20 예는 서로 다른 미로딩 member와 별도 count 제외를 밝혀 숫자를 일반화하지 않는다. 새 Concept/문항이나 전체 재작성은 불필요하다.

후속: #203

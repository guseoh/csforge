# Reference 감사

625 고유 URL / 1,043 Concept 관계를 모두 인벤토리에 포함했다. 공유 URL의 title/referenceType/language/depth/recommendation conflict는0이고 관계별 displayOrder/relationNote는 별개로 보존한다. broad root 경로 후보는 자동 규칙상0이지만, 따라서 모든 URL이 직접적·유용하다는 결론은 낼 수 없다.

초기 샘플은 canonical URL17개 직접 의미 대조, etcd 1개 접근만, 나머지607개 미완료였으며 기존 증거를 보존했다. Wave 1에서는 **82 고유 canonical URL 관계 중 78개**의 관련 내용·역할을 대조하고 4개는 상세 접근 `NEEDS_REVIEW`로 남겼다. etcd의 linearizability/serializable read·operation completion을 이번에 직접 확인했다. 원본 검증은 `priorVerification`, 새 관계별 근거는 `verification`에서 구분한다. 전문 전체/나머지 Area 모든 Reference를 읽었다고 주장하지 않는다.

| Wave 1 key / URL | 실제 상태 / 최소 후속 |
| --- | --- |
| `infrastructure.core.reliability.backup-restore` / NIST `sp/800/34/r1/final` | 접근 가능하나 Withdrawn/Superseded/No Download. **W1-INFRA-004 P1**: [공식 대체 판본](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final)의 복구 목표·시험 절 안내 |
| `messaging.core.semantics.message-model` / LINE `how-to-use-kafka-in-line-1/` | open InternalError, 공식 검색 metadata만 확인. 전문 역할 추가 검토. Kafka/Azure의 본문 근거와 별도 |
| `performance.core.observability.signals-context` / Kakao `posts/747` | 제목 확인, 본문 추출은 shell만 제공. 회사 사례 전문 가치 추가 검토. OTel 주요 사실은 직접 확인 |
| `distributed.core.coordination.saga-compensation` / Princeton `research/techreps/598` | SAGAS 공식 metadata 검색 확인, landing/PDF 접근 실패. Microservices/Woowa와 별도로 원논문 접근 추가 검토 |
| `distributed.core.coordination.cap-tradeoffs` / ACM DOI | open 실패; [원저자 MIT 공개 사본](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer6.pdf)으로 내용 대조. canonical ACM URL 전문 접근은 미완료 |

공식 출처에도 제품/버전/구현 범위를 확인한다. Redis write-behind quickstart는 RedisGears/Enterprise 구현, Lua 원자성은 Redis 서버 범위다. Kafka EOS는 외부 DB 효과까지 자동 포함하지 않으며 Spring retry topic은 별도 listener/topic 구현으로 순서 변화가 있다. NIST800-145는 cloud 서비스 모델 배경이며 serverless 세부 실행 보장은 아니다. Little 원논문은 abstract 가정을 확인했고 전문 증명 검토로 승격하지 않았다. 개별 metadata/추천 경로 평가는 [ledger sources 및 Concept references 칸](wave-1/README.md)에 있다.

| 내용 / key | 현재 근거와 문제 | 권장 범위 |
| --- | --- | --- |
| `security.core.authn-authz.authentication` — `content/security/authn-authz/authentication.md` | [기존 overview](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/index.html)는 유효하나 본문/q3의 provider 검증과 success context 설정에 대한 직접 절이 분산됨 | LEX-006 P2: [DaoAuthenticationProvider](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html), [Form Login](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/form.html)의 해당 절을 읽는 순서/관계로 안내. global metadata 보존. #222 |
| `operating-systems.core.ipc.shared-memory` — `content/operating-systems/ipc/shared-memory.md` | [shm_overview](https://man7.org/linux/man-pages/man7/shm_overview.7.html)의 web open이 Internal Error. 404 증거 없음 | `NEEDS_REVIEW`: 다른 정상 접근 경로에서 페이지 존재·lifetime/unlink를 확인. Binder 글은 비교 사례이며 POSIX 계약의 primary 대체 자료로 쓰지 않음. #201 검토 단계 |
| `distributed.core.consistency.quorum-conflict` — `content/distributed-systems/consistency/quorum-conflict.md` | [etcd3.7](https://etcd.io/docs/v3.7/learning/api_guarantees/) 페이지 존재 확인, Dynamo 원문/합의/linearizability 보장 절 대조 미완료 | `NEEDS_REVIEW`: Dynamo R/W 교집합과 consensus quorum 경계를 해당 primary paper/API 절로 확인. 3.7 version 상태도 확인. #204 검토 단계 |
| `dsa.core.dynamic-programming.initialization-order`, `space-optimization` | [MIT DP I](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/)는 memoization/Fibonacci 학습 자료로 직접적이다. 그 페이지를 방문했다는 것만으로 모든 0/1 knapsack 업데이트 주장까지 검증했다고 볼 수 없음 | knapsack 역순 상태 예제 선별 시 같은 업데이트 계약을 직접 설명하는 검증된 자료가 필요한지 확인. 확인 전 URL 추가/교체 없음. #202 |
| `backend.core.idempotency.idempotency-key` | [Stripe](https://docs.stripe.com/api/idempotent_requests)의 API v1은 fingerprint/replay/validation-before-execution 사례로 직접적. 같은 페이지에 API v2 차이도 존재 | KEEP. 향후 Stripe-specific 보장을 모든 provider/app 정책으로 확대하지 않음. 현재 본문은 정책 선택과 사례를 구분함 |
| DB visibility/row-lock/btree | 현재 접근한 `/docs/current/` 문서는 PostgreSQL18을 표시 | KEEP(확인된 개별 항목). 향후 구현/버전 민감 주장은 실제 앱 DB 버전과 source version을 대조. 전체 URL 일괄 pin/rewrite 근거 아님 |

좋은 한국어 보충 자료를 quota로 추가하지 않는다. 새로 읽지 않은 D2/Woowa/Binder URL의 과거 근거는 보존하며 새 학습 가치 PASS로 승격하지 않는다. 모든 URL별 metadata·관계·수준은 [reference-inventory.json](reference-inventory.json)에 있다. 접근 실패4개를 dead link나 P0로 확정하지 않았다. 미검토 URL의 안전성 보증도 없다.

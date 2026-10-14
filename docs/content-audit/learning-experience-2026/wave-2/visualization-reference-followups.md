# Wave 2 — 도식·Reference·후속 최소 범위

각 항목의 판정과 원문 근거는 [Area 수동 기록](README.md#개별-검토-근거), [발견 보고](../wave-2-findings.md)에 연결한다. 아래는 새 이미지 제작 지시나 모든 DIAGRAM의 결함 목록이 아니다. 43개 DIAGRAM 계약을 포함해 전수 검토한 기존 ASCII/표 가운데 설명력이 충분한 것은 유지한다.

## 상태와 흐름을 보강할 후보

| Concept key | 기존 설명에서 보강할 상태·흐름 | 연결 발견 |
| --- | --- | --- |
| `spring.core.container.application-context` | bean definition 처리 → 생성/DI → BPP before(그 경로의 @PostConstruct) → InitializingBean/custom init → BPP after/proxy. before와 after를 init 앞에 합치지 않는다. | W2-SPR-001 |
| `spring.core.scope-lifecycle.scope-proxy` | singleton이 한 번 주입받은 prototype A의 생존 범위와 Provider로 작업마다 얻는 A/B를 비교한다. prototype proxy의 메서드별 새 target도 작업 전체 상태 공유와 구별한다. | W2-SPR-002 |
| `spring.core.mvc.dispatcher-servlet` | 정상 요청의 adapter/controller/result/view와 실행 중 예외 → resolver의 분기를 표시한다. controller 실행 이전에 결과 처리를 배치하지 않는다. | W2-SPR-003 |
| `spring.core.data-jpa.fetch-plan` | 동일 조회의 기본 fetch / entity graph / fetch join / DTO 결과와 SQL·pagination 제약을 비교한다. graph 사용만으로 고정 SQL 횟수를 보장하지 않는다. | W2-SPR-004 |
| `database.core.model.normalization` | 중복 행에서 삽입 불가·부분 갱신·마지막 행 삭제에 따른 정보 소실과 분해 후 상태를 각각 제시한다. | W2-DB-001 |
| `database.core.sql.window-function` | 동일 ORDER BY 값의 peer 행에서 기본 RANGE의 누적 결과와 명시 ROWS의 행별 결과를 비교한다. 기존 unique tie-breaker 예제는 유지한다. | W2-DB-004 |
| `database.core.mvcc.visibility` | T1의 version 생성/수정, T2 snapshot, creator/invalidator의 active/commit/abort 및 자기 write를 연결한다. PG xmax에 lock/multixact도 기록되므로 단순 xmax=0 규칙으로 줄이지 않는다. | W2-DB-009 |
| `database.core.query-patterns.keyset-pagination` | 소비한 803…800 뒤에 경계를 두고 strict `< 800`의 다음 799…을 표시한다. 올바른 SQL과 문항은 유지한다. | W2-DB-010 |
| `database.core.isolation.serializable` | 전체 TX 재실행·backoff·budget 소진 → 최종 실패 반환/throw 분기를 표시한다. 마지막 실패 뒤 정상 종료처럼 보이는 경로를 없앤다. | W2-DB-007 |
| `backend.core.layering.orchestration-rule` | 같은 DB TX의 business 변경 + outbox intent → commit → relay → 외부 응답/중복 전달 상태를 표시한다. commit과 outbox 사이 crash gap을 허용하지 않는다. | W2-BE-001 |
| `backend.core.bulk-batch.file-api` | 전체 byte/file byte/part count/concurrent/temp quota의 검사 시점, 실패 응답과 임시 자원 cleanup을 보강한다. 많은 작은 part의 비용은 body size만으로 제한되지 않는다. | W2-BE-005 |
| `backend.core.time-money.instant-zone` | DST gap의 0개, overlap의 2개 유효 offset과 업무 선택 → Instant 확정 순서를 구별한다. 라이브러리 기본 resolver와 업무 정책을 같은 보장으로 쓰지 않는다. | W2-BE-006 |
| `backend.core.evolution.migration` | old writer/new writer/old column/new column/backfill 중 상태, authoritative input, catch-up/검증 → contract 전환을 표시한다. | W2-BE-007 |
| `security.core.session-cookie.cookie-flags` | 같은 site의 서로 다른 origin, 다른 site, host-only/Domain cookie의 적용 범위를 구별한다. SameSite가 origin 단위 격리나 인가를 보장하지 않음을 나타낸다. | W2-SEC-003 |
| `security.core.browser.cors-preflight` | JSON 요청 헤더 → credentials 없는 OPTIONS의 Request-Headers → 서버 Allow-Headers/Methods/Origin → 허용/실패 후 실제 요청 → 응답 읽기 조건을 표시한다. | W2-SEC-004 |
| `security.core.filter-chain.servlet-filter` | 원래 request stream 소비, downstream EOF와 bounded wrapper의 재읽기 정책을 구별한다. ContentCachingWrapper는 읽기를 시작하거나 자동 replay하지 않는다. | W2-SEC-006 |
| `security.core.filter-chain.security-filter-chain` | 첫 securityMatcher 일치 chain, 그 chain 내부 requestMatchers, 어느 chain에도 불일치한 경로를 비교한다. anyRequest는 선택된 chain 내부 규칙이다. | W2-SEC-007 |
| `security.core.tokens-oauth.oauth-oidc` | resource owner/browser/client/AS/RS의 전체 역할, consent·redirect front channel·token back channel·API request와 신뢰 경계를 보여준다. code/redirect/client/PKCE binding, state/nonce의 조건별 목적을 구별한다. | W2-SEC-010 |

## Reference의 실제 확인 범위

Area 기록의 `sources`는 canonical URL별 관련 절 대조, `supplementalSources`는 의심한 주장 검증에 실제 읽은 공식 문서와 그 한계다. 209 관계 중 206은 의미를 대조했고 3관계(2 URL)는 상세 접근 미확정이다. 전체 171 URL의 모든 내용을 읽었다거나 모든 anchor의 브라우저 도착을 확인했다는 뜻은 아니다.

| 대상 | 상태와 근거 | 최소 후속 |
| --- | --- | --- |
| [JPA 3.2 specification](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html), Spring 2관계 | 직접 open/find 실패. 공식 EntityManager API와 공식 검색 본문으로 managed/merge·fetch 주장 교차 확인; 대상 spec 관련 절 전체는 NEEDS_REVIEW. 깨진 URL로 확정하지 않는다. | #222에서 학습자 접근과 관련 절/anchor 확인. #203 fetch-plan 보강과 역할 중복을 피한다. |
| [Version API canonical route](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/version), Backend 1관계 | 직접 404와 공식 검색의 동일 URL 본문이 충돌한다. @Version 동작은 공식 검색으로 확인했지만 경로 전체 접근은 NEEDS_REVIEW. 대소문자가 원인이라고 단정하지 않는다. | W2-BE-004: #203에서 현재 최종 official route를 직접 재확인 후 필요한 경우만 metadata 수정. #222는 접근 증거 확인. |
| [RFC 9110 짧은 URL](https://www.rfc-editor.org/rfc/rfc9110) | 짧은 URL 직접 도구 접근은 실패했으나 공식 `.html`의 safe/idempotent/status 관련 절을 읽었다. 의미 CURRENT_VERIFIED, 접근 `accessVerification: NEEDS_REVIEW`를 분리한다. | #222에서 실제 접근/redirect 확인. #203 W2-BE-003은 safe 설명 범위 보강이며 URL 장애 확정과 다르다. |
| `security.core.auth-architecture.user-details` | Reference 제목은 UserDetailsService지만 URL 본문은 UserDetails credential management다. 두 API의 역할이 다르다. | W2-SEC-009: #203에서 제목 또는 실제 대조한 UserDetailsService 공식 URL 중 필요한 한쪽만 수정. |
| `security.core.abuse.file-path`의 [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal) | 보안 지침 자체는 유용하나 `%00.pdf`의 Java bypass 설명에 실행 환경 제한이 없다. 실제 읽은 current upstream OpenJDK UnixPath는 NUL에 InvalidPathException을 발생시킨다. 모든 OS/JDK25 runtime을 실행 검증한 근거는 아니다. canonical은 그 bypass를 채택하지 않는다. | W2-SEC-012: #203에서 과거 예시의 환경 한계 relationNote 또는 현재 파일 업로드/JDK 공식 근거를 제시한다. 보편적인 현재 Java 공격으로 가르치지 않는다. |

초기 LEX-006은 당시 인증 Reference 학습 동선의 부분 근거다. 이번에는 관련 공식 authentication 페이지와 ProviderManager/DAO 흐름, UserDetails/status check 절을 직접 대조했다. 새 근거 수준은 이번 시점/관련 절의 확인을 나타내며 초기 발견을 삭제하거나 모든 TOC·anchor의 사용성이 해결됐다고 처리하지 않는다. Wave 1의 LINE/Kakao/Princeton Sagas/ACM CAP 접근 미확정 4 URL도 그대로 남긴다.

## 기존 후속 Issue별 최소 보강

| Issue | Wave 2 보강 항목 | 최소 작업 범위 |
| --- | --- | --- |
| [#202](https://github.com/guseoh/csforge/issues/202) | Database 10 Concept / 4 Question, W2-DB-001…010 | acceptedAnswers 2건 먼저 정밀 수정; 기존 relation-tuple/covering-index 문항의 목표 중복을 다른 existing goal로 조정; SQL frame·정규화·MVCC·statistics·retry 실패·cursor 경계 설명만 보강. PG/MySQL 차이와 이미 맞는 답을 유지한다. |
| [#203](https://github.com/guseoh/csforge/issues/203) | Spring/Backend/Security 24 Concept / 5 Question, W2-SPR/BE/SEC 전체 | lifecycle/outbox/인증 전제 P0를 먼저 수정. scope/MVC/fetch/HTTP/part limit/DST/migration/test double 및 browser/chain/OAuth 신뢰 경계의 빠진 설명만 보강. Question 5개는 정확한 주장·누락된 existing Concept 연결·body wrapper 학습 근거를 수정한다. 문항 전체 재작성이나 새 Concept 생성은 필요하지 않다. |
| [#222](https://github.com/guseoh/csforge/issues/222) | JPA spec/Version/RFC9110 접근 확인, W1 대기 URL 유지 | 사용자가 공식 본문·관련 절에 실제 도달하는지 확인하고 도구 제한과 실제 URL 장애를 구별한다. #203이 소유한 metadata/본문 수정과 중복 구현하지 않는다. |

Source URL이나 기존 PASS만으로 일괄 수정·KEEP을 부여하지 않는다. 모든 후속 구현은 먼저 ChatGPT 최종 콘텐츠 품질 검토를 거친 이 발견·개별 근거를 사용하며, 이번 PR에서는 구현하지 않는다.

# Issue #203 — Security P0/P1/P2 Content Precision

> 이 문서는 기존 Wave 2 Security 전 범위 감사를 현재 canonical과 대조한 교정 ledger다. **Human Usage Check는 사용자 결정에 따라 이번 속도 우선 작업의 완료 조건에서 제외**한다. 변경분 기술 리뷰·실제 Import·정확한 재import·CI는 유지하고, 병합은 통과 증거를 다시 확인한 경우에만 사용자 위임 범위에서 진행한다.

## Scope / 출처

- Base `main`: `2c9664211e3d746ed33990a8e65ffd0992a30a6c`.
- [Issue #203](https://github.com/guseoh/csforge/issues/203), [기존 Wave 2 Security 전수 감사](../../content-audit/learning-experience-2026/wave-2/security.json), [12개 발견 목록](../../content-audit/learning-experience-2026/wave-2-findings.json).
- 기준 전체 **12 Topic / 38 Concept / 74 Question**, 발견 **P0 1 / P1 7 / P2 4**. 이미 정확하거나 교정된 원문은 무작정 다시 작성하지 않는다. 이번 패치만으로 74문항을 새롭게 모두 독립 수기 재채점했다고 주장하지 않는다.

## Finding disposition

| ID | 판정 | 구체 변경 |
| --- | --- | --- |
| W2-SEC-001 · P2 | FIX | `security.core.foundations.assets-threats.q2`의 위협(무단 열람·수집 행위)과 공격자(위협 행위자)를 구별. 정답 의미 유지 |
| W2-SEC-002 · P0 | FIX | `security.core.authn-authz.authentication`과 `.q3`: `matches=true`를 인증 전체 성공으로 오인하지 않도록 계정 잠금·비활성·만료 및 자격 증명 만료 검사, 인증 완료 결과와 SecurityContext 갱신 경계 명시 |
| W2-SEC-003 · P1 | FIX | `security.core.session-cookie.cookie-flags`: schemeful same-site(scheme+registrable domain) vs origin(scheme+host+port), app/api 하위 도메인과 포트 차이, cookie host-only/Domain 범위와 CORS·인가 분리 |
| W2-SEC-004 · P1 | FIX | `security.core.browser.cors-preflight`: `application/json` POST → credential-less OPTIONS → Allow-Headers/Methods/Origin → 실제 POST의 실제 전송/응답 읽기와 credential 조건 |
| W2-SEC-005 · P1 | FIX | `security.core.access.vertical`과 `security.core.context-authz.method-security`: `@EnableMethodSecurity`, Spring 관리 proxy 및 self-invocation·직접 `new` 우회 조건과 실제 거절 테스트 |
| W2-SEC-006 · P1 | FIX | `security.core.filter-chain.servlet-filter`: InputStream 소비 후 MVC `@RequestBody` 파싱 실패, bounded replay wrapper/ContentCachingRequestWrapper 한계, 비밀값 로그 방지 |
| W2-SEC-007 · P1 | FIX | `security.core.filter-chain.security-filter-chain`: chain의 `securityMatcher` 미일치 요청은 내부 `anyRequest` 보호를 받지 않는다는 점, catch-all 보안 정책과 테스트 |
| W2-SEC-008 · P1 | FIX | `security.core.context-authz.context-holder.q2`: 기존 async 상황의 정확한 답과 해설은 보존하고 `security.core.context-authz.async-context` 관련 Concept 연결 |
| W2-SEC-009 · P2 | KEEP (이미 해결) | `security.core.auth-architecture.user-details`: 현재 main은 `user-details-service.html` 공식 링크/제목/설명에 일치. 불필요한 재변경 방지 |
| W2-SEC-010 · P1 | FIX | `security.core.tokens-oauth.oauth-oidc`: 사용자·browser/client/AS/RS 사이 코드/redirect callback/back-channel 토큰/API sequence, client·redirect·PKCE binding, state/nonce/PKCE의 조건부 CSRF·OIDC 제약 차이 |
| W2-SEC-011 · P2 | FIX | `security.core.abuse.file-path`: ASCII 비문 `벗어남할` → `벗어날` |
| W2-SEC-012 · P2 | FIX | 동일 Concept의 OWASP Path Traversal Reference note: `../` 경로 공격 근거만 사용, 오래된 `%00` 예제를 현재 Java NIO의 일반 동작으로 받아들이지 않도록 명시 |

정확한 변경 범위는 **기존 Concept MD 9개 + Question JSON 3개 + 이 ledger**이다. 기존 canonical **contentKey·질문 타입/난도/출제 순서/학습 기록 stable ID를 변경하지 않는다.** 3 Question JSON에서 바뀐 실제 문항은 `authentication.q3` prompt/model/explanation, `context-holder.q2` Concept links, `assets-threats.q2` model/explanation이다. `file-path.md`의 Reference relationNote만 의도적으로 수정했으며 Reference URL·제목은 유지한다.

## 1차 자료 검증

- [Spring Security DaoAuthenticationProvider](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html): UserDetails lookup과 password validation, [Spring Security AbstractUserDetailsAuthenticationProvider source](https://github.com/spring-projects/spring-security/blob/main/core/src/main/java/org/springframework/security/authentication/dao/AbstractUserDetailsAuthenticationProvider.java)의 pre/post account status checks.
- [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie), [MDN Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS): site/origin, preflight/credential semantics.
- [Spring Security Method Security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html), [Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html): method interceptors, security filter chain matching/ordering.
- [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749), [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636), [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html), [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html): authorization code, PKCE/token role, CSRF/nonce conditional defenses.
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal): use the path traversal threat guidance, not the historical NUL bypass as an unqualified modern-Java assertion.

## 검증 계약

1. 기존 12 Topic/38 Concept/74 Question 전체에 대한 기존 감사와 현재 canonical의 발견 12개 재확인. **변경 키 전수** 기술 검토 및 frontmatter/JSON/question metadata 상태 비교.
2. 독립 PostgreSQL 16.4 + Java 25 Spring Boot local 환경에서 실제 Import `Preview → Apply → 동일 파일 UNCHANGED`, 3,380 canonical exact replay, user personal/history digest 및 Reference 관계/ stable ID 불변 점검. 결과 링크를 여기에 추가.
3. 최종 Repository Validation PASS, file diff 범위와 base drift·review thread 재검토.
4. **Human Usage Check는 최신 사용자 결정으로 제외**. 시각화는 기존 text/ASCII/HTTP 예제면 충분하며 UI 수동 판정을 수행했다고 주장하지 않는다.
5. 필요 없는 인프라·서비스·코드 변경, Production canonical sync, 무승인 병합 금지. 사용자로부터 "검토 후 병합 가능하면 진행" 승인을 받은 범위에서만 최종 검증이 모두 통과한 PR을 squash merge.

## 격리 실제 Spring/PostgreSQL Historical Import 결과 (2026-10-21)

- [GitHub Actions #39543127401](https://github.com/guseoh/csforge/actions/runs/39543127401) **SUCCESS** (임시 QA 포함 HEAD `67ccd795e7483e5ba71ea6b30195de847848b1cd`).
- 별도 PostgreSQL 16.4·Java 25 Spring Boot local mode. `/api/auth/session` 응답의 LOCAL 모드와 빈 DB 최초 canonical import **3,380 CREATED** 확인.
- 변경 전 9 Concept MD + 3 Question JSON을 원문으로 되돌린 뒤 실제 multipart `Preview/Apply` **12 UPDATED**; 교정본을 같은 방식으로 적용할 때 **12 UPDATED**. 동일 12 source 파일 exact reimport: **27 UNCHANGED / 0 UPDATED**(9 Concept, 18 Question); 전체 canonical rebootstrap: **3,380 UNCHANGED / 0 UPDATED / 0 ERROR**.
- 실제 Security MC 오답 Quiz → Result/WrongNote/ReviewSchedule 및 개인 Concept note/오답 메모 생성 후 import. 10 테이블 `personal_note`, `concept_progress`, `quiz_session`, `attempt`, `wrong_note`, `review_schedule`, `review_history`, `question_answer`, `question_concept`, `concept_reference` 전체 digest가 원문·교정본 apply 및 exact import 전후 동일. 9개 Concept stable ID와 이전 오답 Quiz 결과도 보존.
- `security.core.context-authz.context-holder.q2`의 관련 Concept가 실제 DB에서 **2개**(context-holder + async-context)임을 검증.
- 임시 QA workflow는 성공 후 제거하고 Actions 로그·이 문서에 증거 유지. **Human Usage Check는 사용자 결정에 따라 제외**. Production DB/기존 사용자 데이터 변경 없음.

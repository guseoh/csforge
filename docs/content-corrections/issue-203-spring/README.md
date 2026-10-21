# Issue #203 — Spring 정밀 교정 Checkpoint

> Spring 1차 Draft. 이 문서는 기존 Wave 2 감사 결과와 현재 canonical의 4건 대상 교정에 대한 근거를 기록한다. #203 전체 완료, 전체 질문의 신규 수기 전수 채점, Production DB 적용 또는 병합 승인을 뜻하지 않는다.

## 기준

- Base `main`: `fffa3e789df5ce00b3708af073481d6de1c7d8e6` (이 문서 생성 당시).
- [상위 Issue #203](https://github.com/guseoh/csforge/issues/203)
- [기존 Wave 2 Spring 전 범위 감사](../../content-audit/learning-experience-2026/wave-2/spring.json): **12 Topic / 37 Concept / 77 Question**. #179 Spring Quality PR은 기존에 병합된 상태.
- [기존 발견 ledger](../../content-audit/learning-experience-2026/wave-2-findings.json)의 Spring P0 1건/P1 3건을 현재 main에서 직접 재확인했고, 기존에 수정됐다고 가정하지 않았다.

## 교정

| ID | 원본 key | 변경/판정 |
| --- | --- | --- |
| W2-SPR-001 · P0 | `spring.core.container.application-context` | 후처리 전/후를 하나로 묶은 뒤 init callback으로 흐르던 잘못된 순서를 **BPP before → init callbacks → BPP after**로 교정. `@PostConstruct`가 초기화 전 후처리 단계에서 실행될 수 있음을 구별 |
| W2-SPR-002 · P1 | `spring.core.scope-lifecycle.scope-proxy` | request vs prototype의 수명을 분리하고, singleton에 prototype 1회 주입 / 작업당 ObjectProvider 1회 조회 / prototype proxy 메서드 호출별 새 대상의 차이를 상태 흐름으로 보강 |
| W2-SPR-003 · P1 | `spring.core.mvc.dispatcher-servlet` | Controller 이전으로 오해되는 반환/예외 처리 ASCII 도식을 HandlerMapping → HandlerAdapter → Controller → 반환 처리로 교정. 예외 해석기는 중간 단계에서 발생한 예외의 별도 경로로 명시 |
| W2-SPR-004 · P1 | `spring.core.data-jpa.fetch-plan` | `@EntityGraph(attributePaths = "member")`의 Repository 메서드 예, FETCH/LOAD의 미지정 속성 처리 차이, 실제 JOIN/SQL 횟수 비보장 및 페이지/collection trade-off 추가 |

- **4개 기존 Concept Markdown 본문만 변경**. 기존 37 Concept, 77 Question, Topic/Curriculum/contentKey/Level/status/displayOrder/frontmatter/Reference URL·메타데이터/질문·정답·연결/저장된 SVG 등은 이번 변경에 포함하지 않았다.
- 각 파일의 기존 vs 교정 `frontmatter`, 1차 H1, 코드펜스 균형을 점검했고 네 파일 모두 통과.
- 새 이미지/Reference URL 추가 없음. 원래 ASCII 도식으로 충분한 대상은 TEXT로 유지하고 불필요한 이미지 자산을 추가하지 않았다.

## 기술적 1차 근거

- [Spring Framework — Container Extension Points](https://docs.spring.io/spring-framework/reference/core/beans/factory-extension.html): `postProcessBeforeInitialization`과 `postProcessAfterInitialization`은 초기화 콜백의 앞/뒤에서 호출된다.
- [Spring Framework — Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html): singleton의 prototype 직접 주입은 생성 시 1회, prototype scoped proxy는 method invocation마다 새 target, ObjectProvider는 요청 시 대상 조회.
- [Spring Framework — MVC DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html), [MVC exception handlers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/exceptionhandlers.html): handler 호출, 반환 처리, 예외 해석 경계.
- [Spring Data JPA — Query Methods](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html) 및 [EntityGraph API](https://docs.spring.io/spring-data/data-jpa/docs/current/api/org/springframework/data/jpa/repository/EntityGraph.html): ad hoc attributePaths, fetch/load graph 유형의 계약.

## 검증/남은 게이트

1. Draft PR Repository Validation, 변경 파일 목록과 기존 key/frontmatter/질문 불변 확인.
2. 전체 canonical에 포함된 **Spring Pack 격리 PostgreSQL Preview → Apply → exact reimport UNCHANGED**. 기존 personal/history 데이터 보존과 shared Reference identity 확인. **2026-10-21 자동 회귀 PASS** (아래 증거).
3. 기존 Wave 2 **37 Concept/77 Question 감사 결과를 교정본과 대조하는 ChatGPT 최종 전 범위 Content Review**. 현재 신규 77문항 독립 수기 전수 채점 완료를 주장하지 않는다.
4. 독립 브라우저의 Reader, 모바일 375/데스크톱 1280, light/dark, 도식 가독성, 관련 Quiz 흐름 Human Usage Check. **16개 자동 live Reader 조건 PASS, 사람의 수동 Human Usage Check 미완료**.
5. 사용자의 명시적 추가 승인 이전에는 **Draft 유지·병합 금지**. Production DB/Import/deploy 작업을 실행하지 않는다.

#203의 나머지 Backend Engineering과 Security는 별도 순차 Slice로 진행한다.

## 격리 PostgreSQL / 실제 Reader QA 자동 증거 (2026-10-21)

- [GitHub Actions #39539474754](https://github.com/guseoh/csforge/actions/runs/39539474754) **SUCCESS** (당시 HEAD `db83d3561db99876367b7515205cc6833969f410`). 테스트는 ephemeral runner에서만 수행했고 운영 DB나 사용자 데이터에 접근하지 않았다.
- 최종 Spring 교정본으로 Spring Boot/Java 25 + 별도 PostgreSQL/Redis 기동, canonical 전체 3,380개 `CREATED`.
- Spring 원문 4개 파일을 **실제 Multipart Preview → Apply**로 되돌릴 때 `4 UPDATED`, 다시 PR 교정본으로 동일 API를 실행할 때 `4 UPDATED`. 다음 exact 4-file import: **4 UNCHANGED**. 전체 canonical rebootstrap: **3,380 UNCHANGED / 0 UPDATED / 0 ERROR**.
- 변경 적용 전 격리 DB에 Spring 문제 오답 1건, WrongNote·ReviewSchedule, Concept 개인 노트 및 WrongNote 개인 메모를 먼저 저장했다. `personal_note`, `concept_progress`, `quiz_session`, `attempt`, `wrong_note`, `review_schedule`, `review_history`, `question_answer`, `question_concept`, `concept_reference` 총 10개 테이블 digest와 4 Concept ID 및 퀴즈 결과가 원문 복원·교정본 적용·정확한 재import 전후 동일했다.
- 실제 backend 응답을 쓰는 React/Chromium Reader 4개 × light/dark × 375/1280px **16조건 PASS**. 교정된 핵심 문구 렌더·document overflow 없음·JS pageerror 없음 확인. Screenshot artifact: `issue203-spring-live-reader-screenshots` (ID `12319525217`, 16장).
- **검증 한계:** 자동 Reader QA는 실제 사람의 가독성·인터랙션 검사 및 37 Concept/77 Question 독립 최종 내용 리뷰를 대체하지 않는다. 일회성 QA workflow/script는 성공 후 제거하고 GitHub Actions 기록과 이 문서만 유지한다.

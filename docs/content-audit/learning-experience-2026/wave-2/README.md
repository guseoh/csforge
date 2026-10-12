# Wave 2 — 전체 본문·문항 의미 검토

2026-10-12, 기준선 `efe73a15da14c996bd08344181d4d6f87073803d`. [Issue #200](https://github.com/guseoh/csforge/issues/200), 기존 [Draft PR #223](https://github.com/guseoh/csforge/pull/223)의 감사 델타다. 4 LearningArea의 **49 Topic / 153 Concept / 334 Question**을 모두 직접 읽었다. Wave 2에 미완료 항목은 없다. 전체 Issue #200의 의미 감사는 아직 미완료다.

## 완료 범위와 품질

| Area | Topic | Concept 완료 | C KEEP / ENHANCE | Question 완료 | Q KEEP / ENHANCE | P0 / P1 / P2 그룹 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Spring | 12 | 37/37 | 33 / 4 | 77/77 | 77 / 0 | 1 / 3 / 0 |
| Database | 12 | 38/38 | 28 / 10 | 75/75 | 71 / 4 | 2 / 7 / 1 |
| Backend Engineering | 13 | 40/40 | 32 / 8 | 108/108 | 107 / 1 | 1 / 6 / 1 |
| Security | 12 | 38/38 | 26 / 12 | 74/74 | 70 / 4 | 1 / 7 / 4 |
| 합계 | 49 | 153/153 | 119 / 34 | 334/334 | 325 / 9 | 5 / 23 / 6 |

모든 487 항목의 검토 근거 수준은 `CURRENT_VERIFIED`다. 품질 판정은 별도이며 `TARGETED_ENHANCE`는 34 Concept / 9 Question, `REWRITE_REQUIRED`와 `NEEDS_REVIEW`는 0이다. 34개 발견 그룹과 43개 보강 항목은 다른 집계다. 여러 문제를 가진 Concept나 Concept와 Question을 함께 보강하는 그룹이 있다. KEEP도 아래 근거를 직접 작성한 항목에만 부여했다. 보강 구현·Import·이미지 제작은 수행하지 않았다.

핵심 P0는 BeanPostProcessor의 초기화 순서 도식, HAVING 문항의 원인만 적은 acceptedAnswer, row lock 문항의 대기 동작이 빠진 acceptedAnswer, commit 뒤 outbox 기록을 허용하는 순서, 비밀번호 일치만으로 최종 인증 성공을 단정하는 문항이다. [34개 발견 원문·위치·최소 보강](../wave-2-findings.md)을 먼저 확인한다. P0는 이번 감사의 잘못된 정답 인정 또는 핵심 실행 순서/보장 오해 기준이며 실제 배포 사고가 발생했다는 뜻은 아니다.

## 개별 검토 근거

- [spring.json](spring.json): AOP의 self-invocation/proxy, rollback/propagation, lifecycle, JPA 상태·flush·fetch를 포함한 전체 12 Topic.
- [database.json](database.json): SQL/정규화, index/통계, PG·MySQL의 격리·잠금·MVCC 차이와 query pattern을 포함한 전체 12 Topic.
- [backend-engineering.json](backend-engineering.json): API·orchestration·동시성·멱등성·retry·pagination·migration·장애 복구를 포함한 전체 13 Topic.
- [security.json](security.json): 인증/인가·session·browser·filter/context·OAuth/OIDC·입력/파일 신뢰 경계를 포함한 전체 12 Topic.

Topic의 `coverage`와 모든 Concept/Question의 배열 행은 수동 검토 기록이다. Concept 행은 `[key, quality, objectiveLevelDepth, accuracyMechanismCodeExamplesClarityBoundaries, visualization, references, linkedQuestionCoverage]`, Question 행은 `[key, quality, answerChoicesRationalesModelExplanation, ambiguityDifficultyDuplication]` 순서다. 실제 본문과 각 문항의 정답, **모든 선택지와 rationale**, modelAnswer, acceptedAnswers, explanation 및 연결 Concept를 읽고 개별 판단을 작성했다. 해당 유형에 없는 필드는 없는 것으로 확인했다. 단순 반복 목표와 단계가 다른 반복은 근거에서 구분한다. level과 difficulty를 같은 척도로 판정하지 않았다.

`sourceHashes`는 직접 검토한 Concept의 LF 정규화 파일 및 개별 Question의 정렬 JSON object SHA256을 고정한다. `curriculumSha256`과 `topicCatalogSha256`도 고정하며 generate 과정에서 재계산하여 수동 근거를 덮어쓰지 않는다. 생성된 inventory는 각 key의 근거와 `evidenceFile`, hash, 원문 경로/Question arrayIndex를 연결한다. 발견에는 원문 인용, key, 파일 경로, 해결 방향, 후속 Issue를 남겼다. 생성된 발견 보고서에는 파일 SHA256과 1-based 인용 위치도 추가된다.

자동화는 수량·키·관계·소스 일치와 기록 누락을 검증할 뿐 기술적 정확성이나 KEEP을 생성하지 않는다. 이 기록은 현재 본문을 읽은 의미 감사이며 코드 예제를 실제 framework/DB runtime에서 실행한 검증은 아니다. uncertain claim은 실제 공식 문서의 관련 절과 대조했다. official source의 모든 절·모든 버전이나 학습자의 브라우저 접근 경험을 검증했다는 뜻은 아니다.

## Reference와 도식화

Wave 2에는 **209 Reference 관계 / 171 고유 canonical URL**이 있다. 관계 기준 206개는 관련 기술적 주장과 출처 역할을 직접 대조했다. JPA 3.2 specification의 2관계와 Version API의 1관계는 대상 페이지 전체 관련 절 접근을 확정하지 못해 `NEEDS_REVIEW`다. supplemental 공식 API/검색 본문으로 핵심 기술적 주장을 교차 확인했지만 해당 Reference를 검증 완료로 승격하지 않았다. RFC 9110은 동일한 공식 `.html` 본문으로 기술적 의미를 확인했고, canonical 짧은 URL의 직접 접근은 별도 `accessVerification: NEEDS_REVIEW`다. 도구 실패만으로 URL이 모든 학습자에게 깨졌다고 단정하지 않는다.

Curriculum 계약은 NONE 45 / TEXT 65 / DIAGRAM 43이다. 해당 범위의 이미지 파일 참조는 0이지만 ASCII·상태 표·timeline·SQL 결과 표의 실제 학습 설명력을 개별로 검토했다. 기존 적절한 도식은 유지하며 그림 수만으로 결함을 만들지 않았다. [구체적 상태·흐름 후보와 Reference 한계](visualization-reference-followups.md)에 필요한 보강을 정리했다. 기존 Java/OS 60 SVG와 Wave 1 평가는 변경하지 않았다.

## 이전 결과와 누적 진행률

Wave 1의 54 Concept / 162 Question 근거·발견·당시 summary는 그대로 보존한다. Wave 2와 초기 `review-notes.json`의 샘플은 8 Concept / 16 Question이 겹친다. 이번 전체 검토 근거를 활성 inventory에 연결하고 원래 샘플은 `priorSampleReview`로 남겼다. 과거 Content Quality Wave의 PASS는 `PRIOR_REVIEWED`로 존중하며 이번 KEEP으로 일괄 변환하지 않았다. 새로운 명백한 문제만 W2 ID로 기록한다. 초기 LEX 발견과 Wave 1 발견을 삭제하거나 해결 처리하지 않았다.

| 누적 전수 직접 검토 | 완료 / 전체 | 완료율 |
| --- | ---: | ---: |
| LearningArea | 10 / 15 | 66.67% |
| Topic | 67 / 134 | 50.00% |
| Concept | 207 / 721 | 28.71% |
| Question | 496 / 2,525 | 19.64% |
| Concept + Question | 703 / 3,246 | 21.66% |

초기 부분 검토를 포함한 고유 직접 접근은 Concept 230 / Question 557이다. 전수 완료 수에 포함하지 않은 `CURRENT_PARTIAL`은 23 / 61, 새 개별 근거 없는 `NEEDS_REVIEW`는 491 / 1,968이다. **품질 미확정 NEEDS_REVIEW는 505 Concept / 1,968 Question**이며 Concept 505에는 초기 부분 검토 미확정 14개가 포함된다. 누적 품질은 Concept KEEP 164 / ENHANCE 52, Question KEEP 536 / ENHANCE 21이다. [현재 summary](../wave-2-summary.json)와 [전체 Area 요약](../area-summary.md)을 기준으로 다음 범위를 정한다.

## 재실행과 후속 사용

저장소 루트에서 기존 Python/PyYAML로 실행한다.

```powershell
python docs/content-audit/learning-experience-2026/audit.py
python docs/content-audit/learning-experience-2026/audit.py --check
git diff --check
git diff efe73a15da14c996bd08344181d4d6f87073803d -- content frontend/public/learning
```

generate와 `--check` 모두 Wave 2의 153/334 키·49 Topic·Reference 관계, source hash, 발견 인용 및 품질 판정 일관성을 검증한다. Wave 1 파생 snapshot은 쓰지 않고 원래 overlay로 재현하여 비교한다. 전체 canonical/Curriculum/자산 945 파일의 기준선 검증도 유지한다. Python 구문 검사는 AST parse로 하며 불필요한 bytecode를 생성하지 않는다.

후속 구현 범위는 기존 #202(Database), #203(Spring/Backend/Security), #222(Reference 접근/학습 가치)에만 연결한다. 새 Issue/PR나 구현은 만들지 않는다. 이 감사는 **ChatGPT 최종 콘텐츠 품질 검토 후** 다음 단계에 활용한다. Wave 2 검토 완료가 15 Area 전체 감사 완료나 후속 수정 승인·완료를 뜻하지 않는다.

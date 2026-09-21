# CSForge Jev Content Quality — Phase A

이 디렉터리는 CSForge runtime과 분리된 offline benchmark harness이다. canonical Concept/Question, Spring backend, frontend, import pipeline에는 의존하지 않는다.

## Dataset

`data/phase-a-candidates.jsonl`은 PR #58, #59, #100, #107, #109에서 실제로 사람이 수정한 before/after pair를 바탕으로 만든 60개 Gold candidate이다. 6개 LearningArea마다 5개 caseGroup을 두었고, 각 group은 historical `BEFORE`와 individually reviewed `AFTER` 한 행으로 구성한다. synthetic negative는 만들지 않았다.

Human Gold delta를 반영한 BEFORE severity는 P0=8, P1=5, P2=14, NONE=3이며, 60개 전체 row에서는 AFTER 30개가 추가되어 P0=8, P1=5, P2=14, NONE=33이다. P2는 blocking defect가 아닌 difficulty-direction example이다. OS deadlock/condition-variable/semaphore BEFORE는 semantic hard-negative로 NONE이다.

`data/phase-a-case-spec.json`은 pair 선택과 rationale의 provenance manifest이고, `data/manifest.json`은 dataset/rubric/model version을 고정한다. 각 row의 `source`에는 PR, path, before ref, after ref, commit, version이 있다.

PR #58, #59, #60, #100, #107, #109, #110과 관련 Content V2 diff를 확인했다. 이 Phase A slice에는 #58, #59, #100, #107, #109의 substantive pair만 선별했고, #60의 diagram/reference 보강, #110의 migration-role 재작성, 그리고 database keyset-pagination diagram finding은 이 harness에 섞지 않았다.

`manifest.json`의 `criterionSupport`는 positive support가 없는 `answerExplanationConflict`, `linkedConceptMisalignment`, Concept의 `layerBoundaryConfusion`, `learningObjectiveGap`, `causalOrStateFlowGap`를 `positiveSupport: 0`과 `recallEvaluable: false`로 명시한다. 이런 criterion의 recall은 성공한 것처럼 계산되지 않고 `null`/not-applicable로 남는다. `difficultyFitDistribution`은 `TOO_EASY=1`, `APPROPRIATE=38`, `TOO_HARD=13`이다.

## Harness

- `src/rubric.ts`: Question/Concept를 atomic `Noul`·`Choice` 질문으로 분리한다. `needsHumanReview` 같은 composite 질문은 만들지 않는다.
- `src/policy.ts`: calibrated threshold를 외부 입력으로 받아 `PASS` 또는 `REVIEW`를 계산한다. threshold가 없거나 일부만 있으면 `UNCALIBRATED`로 남긴다.
- `src/client.ts`: 공식 TypeSafe direct HTTP API와 pinned `jev-1.13.0`을 사용한다. API key는 `TYPESAFE_API_KEY` 환경변수에서만 읽는다. 성공 응답도 requested answer ID/type, Noul range, Choice option/probability/confidence, usage를 검증하고 malformed body는 `INVALID_RESPONSE`로 기록한다.
- `src/runner.ts`: requested/resolved model, rubric/dataset version, latency, token usage, raw typed answers, probabilities, policy result, error/timeout을 JSONL result에 기록한다.
- `src/metrics.ts`: criterion precision/recall, P0/P1 recall, P2+NONE FPR, 3-class `difficulty_fit` accuracy/confusion, area/kind/question-type/language breakdown, latency p50/p95, tokens/cost, API failure/invalid response/timeout/uncalibrated availability, repeated-run disagreement을 계산한다. Balanced Phase A에서는 Human Review Reduction을 `null`로 두며, 비균형 실행에서는 정상 정책 평가 전체의 PASS 비율로 계산한다.

## Validation and run

```text
npm install
npm run typecheck
npm test
npm run validate
npm run benchmark
```

`npm run benchmark`는 `TYPESAFE_API_KEY`가 없으면 API를 호출하지 않고 다음을 출력한다.

```text
HARNESS READY
BENCHMARK NOT RUN — TYPESAFE_API_KEY unavailable
```

Threshold calibration은 아직 확정하지 않았다. 실행 시 `JEV_POLICY_THRESHOLDS_JSON`으로 calibrated 값을 주입할 수 있다. 결과 파일은 `results/`에 생성되며 `.gitignore`로 raw run이 commit되지 않도록 했다.

언어 실험은 manifest의 일부 caseGroup에 대해 `Korean rubric + Korean state`와 `English rubric + Korean state`를 모두 실행하도록 runner가 준비되어 있다. canonical state 자체는 번역하지 않는다.

## Review risks

- BEFORE→AFTER diff만으로 모든 row를 defect로 만들지 않았다. 특히 difficulty-only P2, OS semantic hard-negative, network under-specified scenario의 criterion 범위를 Human Gold rationale에 맞춰 분리했다.
- Phase A가 balanced historical set이므로 review reduction을 production estimate로 해석할 수 없다.
- `linkedConcepts`에는 실제 state에 제공되는 title/summary만 넣었고 rubric도 이를 learning focus로 표현한다. 실제 curriculum objective가 state에 없으므로 보이지 않는 objective까지 판정하지 않는다.
- threshold가 아직 없으므로 실제 benchmark 결과의 PASS/REVIEW를 성공 기준으로 읽을 수 없다.

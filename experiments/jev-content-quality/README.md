# CSForge Jev Content Quality — Phase A / Phase A.1 / Phase A.2 / Phase B

이 디렉터리는 CSForge runtime과 분리된 offline benchmark harness이다. canonical Concept/Question, Spring backend, frontend, import pipeline에는 의존하지 않는다.

## Dataset

### Phase A — development/calibration diagnostic

`data/phase-a-candidates.jsonl`은 PR #58, #59, #100, #107, #109에서 실제로 사람이 수정한 before/after pair를 바탕으로 만든 60개 Gold candidate이다. 6개 LearningArea마다 5개 caseGroup을 두었고, 각 group은 historical `BEFORE`와 individually reviewed `AFTER` 한 행으로 구성한다. synthetic negative는 만들지 않았다.

Human Gold delta를 반영한 BEFORE severity는 P0=8, P1=5, P2=14, NONE=3이며, 60개 전체 row에서는 AFTER 30개가 추가되어 P0=8, P1=5, P2=14, NONE=33이다. P2는 blocking defect가 아닌 difficulty-direction example이다. OS deadlock/condition-variable/semaphore BEFORE는 semantic hard-negative로 NONE이다.

`data/phase-a-case-spec.json`은 pair 선택과 rationale의 provenance manifest이고, `data/manifest.json`은 dataset/rubric/model version을 고정한다. 각 row의 `source`에는 PR, path, before ref, after ref, commit, version이 있다.

PR #58, #59, #60, #100, #107, #109, #110과 관련 Content V2 diff를 확인했다. 이 Phase A slice에는 #58, #59, #100, #107, #109의 substantive pair만 선별했고, #60의 diagram/reference 보강, #110의 migration-role 재작성, 그리고 database keyset-pagination diagram finding은 이 harness에 섞지 않았다.

`manifest.json`의 `criterionSupport`는 positive support가 없는 `answerExplanationConflict`, `linkedConceptMisalignment`, Concept의 `layerBoundaryConfusion`, `learningObjectiveGap`, `causalOrStateFlowGap`를 `positiveSupport: 0`과 `recallEvaluable: false`로 명시한다. 이런 criterion의 recall은 성공한 것처럼 계산되지 않고 `null`/not-applicable로 남는다. `difficultyFitDistribution`은 `TOO_EASY=1`, `APPROPRIATE=38`, `TOO_HARD=13`이다.

## Harness

- `src/rubric.ts`: Question/Concept를 atomic `Noul`·`Choice` 질문으로 분리한다. `needsHumanReview` 같은 composite 질문은 만들지 않는다.
- `src/policy.ts`: raw result에 candidate threshold를 offline으로 적용해 `PASS` 또는 `REVIEW`를 계산한다. `null` threshold는 Phase A calibrated evaluation에서 해당 criterion을 명시적으로 disable하며, 누락된 threshold는 `UNCALIBRATED`로 남긴다.
- `src/client.ts`: 공식 TypeSafe direct HTTP API와 pinned `jev-1.13.0`을 사용한다. API key는 `TYPESAFE_API_KEY` 환경변수에서만 읽는다. 성공 응답도 requested answer ID/type, Noul range, Choice option/probability/confidence, usage를 검증하고 malformed body는 `INVALID_RESPONSE`로 기록한다.
- `src/runner.ts`: threshold와 독립적으로 Jev를 호출하고 requested/resolved model, rubric/dataset version, instruction language, latency, token usage, raw typed answers와 probabilities를 JSONL에 보존한다. Raw run의 policy는 항상 `UNCALIBRATED`이다.
- `src/calibration.ts`: primary language `ko`의 raw Noul probability로 observed-threshold sweep을 만들고 criterion별 TP/FP/FN/TN, precision/recall과 Phase A `candidateThreshold`를 산출한다. Positive support가 없는 criterion은 `UNSUPPORTED_IN_PHASE_A`와 `null` threshold로 남긴다.
- `src/metrics.ts`: overall quality는 primary language `ko`만 사용해 criterion precision/recall, P0/P1 recall/FNR, P2+NONE FPR, 3-class `difficulty_fit`, area/kind/question-type breakdown을 계산한다. Manifest의 language experiment case만 ko/en paired comparison으로 분리한다. Latency, tokens/cost와 API failure/invalid response/timeout은 실제 ko/en request 전체를 집계한다.

## Validation and run

```text
npm install
npm run typecheck
npm test
npm run validate
npm run benchmark
npm run benchmark:holdout
npm run benchmark:weak-holdout
npm run benchmark:phase-b
npm run calibrate -- results/phase-a-run-....jsonl
npm run metrics -- results/phase-a-run-....jsonl --thresholds results/calibration-....json
```

`npm run benchmark`는 `TYPESAFE_API_KEY`가 없으면 API를 호출하지 않고 다음을 출력한다.

```text
HARNESS READY
BENCHMARK NOT RUN — TYPESAFE_API_KEY unavailable
```

권장 흐름은 `raw benchmark → offline calibration → candidate threshold config → offline policy application → metrics`이다. Threshold를 바꿀 때 Jev API를 다시 호출하지 않는다. `calibrate`가 만드는 `results/calibration-*.json`은 `candidateThresholds`와 같은 데이터에 다시 적용한 diagnostic gate metrics를 포함하며, production threshold나 일반화 성능을 뜻하지 않는다. `metrics --thresholds`는 calibration report 전체 또는 `number | null` threshold map을 받을 수 있다. 결과 파일은 `.gitignore` 상태다.

이 calibration 흐름은 Phase A에만 적용된다.

언어 실험은 manifest의 일부 caseGroup에 대해 `Korean rubric + Korean state`와 `English rubric + Korean state`를 모두 실행한다. Overall model-quality denominator는 `ko`만 사용하고, `en`은 같은 case의 paired language comparison에서만 평가한다. Canonical state 자체는 번역하지 않는다.

### Phase A.1 — frozen Rubric V2 historical holdout

`data/phase-a1-holdout.jsonl`은 Human Gold review를 마친 **21 BEFORE/AFTER pair(42 rows)**의 독립 historical holdout이다. `datasetKind`는 `FROZEN_HISTORICAL_HOLDOUT`, rubric은 `csforge-content-quality-v2`, model pin은 `jev-1.13.0`이다. PR #23, #25, #81의 실제 수정만 사용했고 synthetic defect는 없다. 기존 Phase A 60 rows와 `contentKey`가 겹치지 않는다.

Rubric V2는 다음 criterion만 요청한다.

- Question: `material_technical_error`, `multiple_defensible_answers`
- MULTIPLE_CHOICE Question에만 추가: `weak_distractor`
- Concept: `material_technical_error`

`response_shape_mismatch`, `difficulty_fit`, `answer_explanation_conflict`, `linked_concept_misalignment`, `layer_boundary_confusion`, `learning_objective_gap`, `causal_or_state_flow_gap`은 V2 request에 포함하지 않는다. Failure scenario 자체와 authored educational falsehood를 구분하는 ko/en 문구는 holdout mining 전에 고정한 proposal wording을 그대로 사용한다.

Phase A.1은 threshold calibration dataset이 아니다. 첫 실행 목적은 raw probability separation 확인이며 결과는 `UNCALIBRATED`로만 기록한다. V1 threshold는 rubric 의미가 달라진 V2의 성능 threshold로 재사용하지 않는다. `calibrate`에 frozen holdout 결과가 들어오면 fail-fast하고, holdout metrics에도 threshold 적용을 허용하지 않는다.

Phase A.1 결과를 본 뒤 threshold나 rubric을 바꾸고 같은 holdout에서 다시 측정한 값을 최종 성능이라고 주장하면 안 된다. 변경이 필요하면 이 holdout은 개발 데이터로 소진된 것으로 취급하고 새로운 untouched holdout을 확보해야 한다.

Phase A.1 결과에서 `weak_distractor`는 반복 신호를 보였지만, `material_technical_error`는 분리 성능이 악화되었고 `multiple_defensible_answers`는 positive support가 부족했다. 따라서 `materialTechnicalError`는 `SUSPENDED_AFTER_A1_POOR_SIGNAL`, `multipleDefensibleAnswers`는 `INSUFFICIENT_SUPPORT`로 기록하고 Phase A.2 request에는 포함하지 않는다.

### Phase A.2 — independent weak-distractor-only frozen holdout

`data/phase-a2-weak-distractor-holdout.jsonl`은 Human Gold를 확정한 **20 BEFORE/AFTER pair(40 rows)**의 독립 historical holdout이다. `datasetKind`는 `FROZEN_WEAK_DISTRACTOR_HOLDOUT`, dataset version은 `phase-a2-weak-distractor-holdout-2026-09-22`이다. PR #20, #22, #25의 실제 수정만 사용했고 synthetic defect는 없다. Phase A와 Phase A.1 모두와 `contentKey` overlap이 없으며 PR #81 lineage를 제외했다.

Phase A.2 profile은 frozen Rubric V2에서 `weak_distractor`만 요청한다. 기존 ko/en `weak_distractor` definition을 그대로 필터링해 사용하며 `material_technical_error`, `multiple_defensible_answers`, `response_shape_mismatch`, `difficulty_fit` 또는 Concept criterion을 요청하지 않는다. 모든 row는 `MULTIPLE_CHOICE`다.

Gold support는 positive BEFORE 10 rows와 negative applicable 30 rows다. Positive pair의 BEFORE는 `weakDistractor=true`, P1이고 AFTER는 false/NONE이다. Negative pair는 BEFORE와 AFTER 모두 false/NONE이다. 출처는 3개 PR, 8개 LearningArea에 분포하지만 여러 positive가 같은 review commit을 공유하므로 source correlation이 남아 있다.

`npm run benchmark:weak-holdout`은 Phase A.2 dataset만 읽고 raw probability를 `UNCALIBRATED`로 기록한다. Calibration이나 policy를 호출하지 않으며 PASS/REVIEW 결론과 threshold를 만들지 않는다. `calibrate`는 이 dataset을 fail-fast하고, `metrics --thresholds`도 거부한다.

Phase A.2의 목적은 PR #81 editorial campaign 밖에서도 `weakDistractor` 신호가 일반화되는지 확인하는 것이다. A.2 결과를 본 뒤 rubric wording이나 threshold를 바꾸면 A.2는 consumed development data가 되며 final holdout evidence로 다시 사용할 수 없다.


### Phase B — natural current-content weak-distractor evaluation

Phase B는 historical BEFORE/AFTER benchmark를 반복하지 않는다. `main`의 고정 SHA `0f254ccdac91d480cdcde65d22ca9e6bc30b23c0`에서 현재 `MULTIPLE_CHOICE` Question을 가져와, Phase A/A.1/A.2에서 사용한 모든 `contentKey`를 먼저 제외한 뒤 자연 분포를 유지한 120개 slice를 고정했다.

이번 round는 historical holdout에서 반복 신호가 확인된 `weak_distractor`만 평가한다. `material_technical_error`는 Phase A.1에서 signal이 악화되어 중단 상태이고, `multiple_defensible_answers`는 positive support가 부족하므로 Phase B request에 포함하지 않는다.

Area distribution은 Java 21, Spring 23, Database 10, Backend Engineering 22, Operating Systems 22, Network & HTTP 22이다. Spring과 Database는 historical-overlap 제외 후 남은 eligible MC를 모두 포함하고, 나머지 영역은 `contentKey` 정렬 후 deterministic evenly-spaced selection을 사용했다. Jev score는 selection에 사용하지 않았고 synthetic defect나 class balancing도 하지 않았다.

Human Gold는 Jev Phase B 실행 전에 전수 검토하여 `weakDistractor=true` 28개, false 92개로 고정했다. true는 오답 중 하나 이상이 같은 주제의 plausible misconception/realistic mistake라고 보기 어려울 만큼 무관하거나 명백히 우스워 제거법을 과도하게 쉽게 만드는 경우다. 단순히 틀린 선택지라는 이유만으로 true로 표시하지 않았다.

Phase B 결과는 threshold calibration에 사용하지 않는다. 첫 실행은 raw `UNCALIBRATED` probability만 기록하며 threshold 적용도 거부한다. 평가는 ROC-AUC와 score distribution 외에 **상위 10/20/30/40/50% review budget에서의 recall·precision**을 본다. 목적은 현재 CSForge 문제에서 weak distractor의 자연 prevalence와 사람이 검토해야 할 양을 실제로 얼마나 줄일 수 있는지 측정하는 것이다.

## Review risks

- BEFORE→AFTER diff만으로 모든 row를 defect로 만들지 않았다. 특히 difficulty-only P2, OS semantic hard-negative, network under-specified scenario의 criterion 범위를 Human Gold rationale에 맞춰 분리했다.
- Phase A가 balanced historical set이므로 review reduction을 production estimate로 해석할 수 없다.
- `linkedConcepts`에는 실제 state에 제공되는 title/summary만 넣었고 rubric도 이를 learning focus로 표현한다. 실제 curriculum objective가 state에 없으므로 보이지 않는 objective까지 판정하지 않는다.
- Phase A candidate threshold는 동일한 작은 historical set에서 고르고 진단하므로 production threshold나 holdout 성능으로 해석할 수 없다. Phase B에서는 natural slice와 calibration/holdout 분리가 필요하다.

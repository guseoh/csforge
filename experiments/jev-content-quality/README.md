# CSForge Jev Content Quality — Phase A

이 디렉터리는 CSForge runtime과 분리된 offline benchmark harness이다. canonical Concept/Question, Spring backend, frontend, import pipeline에는 의존하지 않는다.

## Dataset

`data/phase-a-candidates.jsonl`은 PR #58, #59, #100, #107에서 실제로 사람이 수정한 before/after pair를 바탕으로 만든 60개 candidate이다. 6개 LearningArea마다 5개 caseGroup을 두었고, 각 group은 historical `BEFORE`와 reviewed `AFTER` 한 행으로 구성한다. synthetic negative는 만들지 않았다.

Candidate label은 최종 Gold가 아니다. `content/AGENTS.md`의 P0/P1/P2 기준을 적용한 Codex의 evidence-based proposal이며, 이후 ChatGPT human review에서 확정해야 한다.

`data/phase-a-case-spec.json`은 pair 선택과 rationale의 provenance manifest이고, `data/manifest.json`은 dataset/rubric/model version을 고정한다. 각 row의 `source`에는 PR, path, before ref, after ref, commit, version이 있다.

PR #58, #59, #60, #100, #107, #110과 관련 Content V2 diff를 확인했다. 이 Phase A slice에는 #58, #59, #100, #107의 substantive pair만 선별했고, #60의 diagram/reference 보강과 #110의 migration-role 재작성은 현재 6개 area × 5 pair 균형을 깨거나 동일 rubric defect로 해석하기 어려워 provenance 검토 대상에서 제외했다.

## Harness

- `src/rubric.ts`: Question/Concept를 atomic `Noul`·`Choice` 질문으로 분리한다. `needsHumanReview` 같은 composite 질문은 만들지 않는다.
- `src/policy.ts`: calibrated threshold를 외부 입력으로 받아 `PASS` 또는 `REVIEW`를 계산한다. threshold가 없거나 일부만 있으면 `UNCALIBRATED`로 남긴다.
- `src/client.ts`: 공식 TypeSafe direct HTTP API와 pinned `jev-1.13.0`을 사용한다. API key는 `TYPESAFE_API_KEY` 환경변수에서만 읽는다.
- `src/runner.ts`: requested/resolved model, rubric/dataset version, latency, token usage, raw typed answers, probabilities, policy result, error/timeout을 JSONL result에 기록한다.
- `src/metrics.ts`: criterion precision/recall, P0/P1 recall, FNR/FPR, area/kind/question-type/language breakdown, latency p50/p95, tokens/cost, failure/timeout, repeated-run disagreement을 계산한다. Balanced Phase A에서는 Human Review Reduction을 `null`로 둔다.

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

- BEFORE→AFTER diff가 존재한다는 사실만으로 label을 확정하지 않았다. 특히 scenario 보강과 난도 조정은 candidate rationale이며 Human Gold 확인이 필요하다.
- Phase A가 balanced historical set이므로 review reduction을 production estimate로 해석할 수 없다.
- Korean state에서 `linkedConcepts` title/summary가 충분히 보이는지, language variant 차이가 criterion별로 안정적인지 검토해야 한다.
- threshold가 아직 없으므로 실제 benchmark 결과의 PASS/REVIEW를 성공 기준으로 읽을 수 없다.

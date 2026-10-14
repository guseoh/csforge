# Issue #200 — 학습 경험 품질 기준선

- 초기 감사일: 2026-10-12, Wave 3: 2026-10-13 (Asia/Seoul)
- 기준선: 최신 `origin/main` 확인 후 생성한 `audit/issue-200-learning-experience`, `efe73a15da14c996bd08344181d4d6f87073803d`
- 범위: 15 LearningArea / 134 Topic / 721 Concept / 2,525 Question
- Reference: 1,043 관계 / 625 고유 URL. 기존 이미지: Java 27 + OS 33 = 60 SVG, 현재 60개 모두 연결(ALT 대괄호 파서 누락을 Wave 4에서 정정).
- [Issue #200](https://github.com/guseoh/csforge/issues/200), [Roadmap #199](https://github.com/guseoh/csforge/issues/199)

## 현재 누적 결과 — Wave 4 세 Topic (2026-10-14)

[현재 Wave4](wave-4/README.md)는 language-types10C/55Q·object-model12C/68Q·api-design5C/28Q를 합쳐 **3Topic/27C/151Q**, C KEEP19/보강8, Q KEEP144/보강7이다. 새 발견 누적P0 4/P1 3/P2 2와 기존LEX-002 P2 계승1그룹은 별도다. 기존 두 Topic 원본/당시 snapshot을 보존하고 [Reference 개별 관계 sidecar](wave-4/reference-relations.json)로 같은 Topic의 Concept 간에도 검증을 격리한다.

최신 누적 전수 항목 **603/721C(83.63%)·1,835/2,525Q(72.67%)·119/134Topic**, 완료 Area14/부분Java1. Java15Topic/118C/690Q의새전수검토가남았다. 근거 NEEDS_REVIEW115C/671Q, 품질미확정117C/671Q. [신규 api-design 결과](wave-4/api-design-report.md), [관계 격리 수정](wave-4/reference-isolation.md), [최신 summary](wave-4/summary.json), [발견](wave-4/findings.md), [검증](wave-4/validation.md)을 따른다. 기존 두 Topic 완료 당시598C/1,807Q와44Reference관계의 수량은 [불변 snapshot](wave-4/snapshots/two-topic-summary.json)에 보존한다. Wave4/Issue200 전체 완료가 아니다.

### 첫 language-types 실행 당시 기록

[첫 Topic 결과](wave-4/language-types-report.md): **10C/55Q 전수 검토**, C KEEP6/보강4, Q KEEP51/보강4. 새 발견 P0 2/P1 2/P2 0과 기존 LEX-002 P2 1그룹을 분리한다. Reference 20관계 중 관련 의미19/미확정1, SVG4개 소스 의미 확인이며 새 render QA는 아니다. 기존 Quality PR #178의 해결 근거를 재확인하고 보존했다.

누적 전수 항목 **586/721C(81.28%)·1,739/2,525Q(68.87%)·117/134 Topic**, 완료 Area14/부분 Area1. Java17 Topic/135C/786Q는 새 전수 검토가 남았고 기존 partial3C/19Q를 포함한다. 근거 NEEDS_REVIEW132C/767Q, 품질 미확정134C/767Q. [당시 summary](wave-4/snapshots/language-types-summary.json), [당시 검증](wave-4/language-types-validation.md)을 따른다. Wave 4/Issue #200 전체 완료가 아니다.

## Wave 3 시점의 누적 결과 — 불변 기록

[Wave 3 전수 의미 검토](wave-3/README.md)에서 CA·DSA·OS·Network의 **49 Topic / 369 Concept / 1,188 Question** 전체를 직접 읽었다. 새 발견 100개 그룹은 **P0 30 / P1 27 / P2 43**, 계승 발견을 포함한 보강 대상은 55 Concept / 76 Question이다. 기존 발견 4개는 별도 계승하며 Wave 1·2 결과와 원래 근거를 보존한다. CURRENT_VERIFIED는 검토 근거 수준이며 KEEP 또는 수정 완료를 뜻하지 않는다.

누적 전수 완료는 **14/15 Area / 116/134 Topic / 576/721 Concept(79.89%) / 1,684/2,525 Question(66.69%)**다. Java 145 Concept / 841 Question의 전수 검토는 남아 있으며, 초기 부분 검토 4 Concept / 25 Question과 새 개별 근거 없는 **141 Concept / 816 Question NEEDS_REVIEW**를 구분한다. 품질 미확정은 아래 표와 다르다. Wave 3 완료를 Issue #200 전체 감사 완료로 선언하지 않는다. ChatGPT 최종 콘텐츠 품질 검토 후 후속 작업에 사용한다.

| 대상 | KEEP | TARGETED_ENHANCE | REWRITE_REQUIRED | 품질 NEEDS_REVIEW |
| --- | ---: | ---: | ---: | ---: |
| Concept | 476 | 102 | 0 | 143 |
| Question | 1,614 | 95 | 0 | 816 |

[Wave 3 개별 근거](wave-3/README.md#개별-검토-근거), [새 발견](wave-3-findings.md), [계승 발견](wave-3-carried-findings.json), [누적 summary](wave-3-summary.json), [도식·Reference·#201/#202 최소 범위](wave-3/visualization-reference-followups.md)를 따른다. 원래 Reference 445관계 중 299관계의 관련 의미를 대조했고 146관계는 NEEDS_REVIEW다. 원래 링크를 미확인으로 유지하면서 대체 공식 자료·개별 코드/수치 추론의 근거를 분리했다. OS 33 SVG의 소스 의미 검토는 새 render/Reader QA 완료와 다르다.

## Wave 1·2 시점의 기준선 기록

아래의 수량·“현재”·미완료 범위는 Wave 2 당시의 역사 기록이다. 최신 누적 상태는 위의 현재 누적 결과와 wave-4/summary.json을 따른다.

전수 **인벤토리와 구조 대조**, [Wave 1 직접 의미 검토](wave-1/README.md)를 보존하고 [Wave 2](wave-2/README.md)를 추가했다. Wave 1은 소형 6 Area의 18 Topic / 54 Concept / 162 Question, Wave 2는 Spring·Database·Backend Engineering·Security의 49 Topic / **153 Concept / 334 Question 전체 본문·답·모든 선택지·rationale·modelAnswer·acceptedAnswers·explanation**을 직접 읽은 근거다. 누적 전수 완료는 **207/721 Concept(28.71%) / 496/2,525 Question(19.64%)**, 10/15 Area다. 해당 범위의 근거는 `CURRENT_VERIFIED`이며 품질 판정은 별도다. 다른 5 Area의 새 전수 의미 검토는 미완료다. 전체 의미 감사 완료나 기존 Wave 대체를 선언하지 않는다. 이 Draft는 ChatGPT 최종 검토 뒤 후속 대상으로 사용하며 Issue를 자동으로 닫지 않는다.

| 대상 | KEEP | TARGETED_ENHANCE | REWRITE_REQUIRED | NEEDS_REVIEW |
| --- | ---: | ---: | ---: | ---: |
| Concept | 164 | 52 | 0 | 505 |
| Question | 536 | 21 | 0 | 1,968 |

초기 PR 감사의 39 Concept / 98 Question은 `review-notes.json`에 그대로 보존한다. Wave 1과 겹치는 8 / 21 및 Wave 2와 겹치는 8 / 16은 새 전체 검토 근거로 연결하며 원래 판단은 `priorSampleReview`에 남긴다. 현재 고유 직접 접근 수는 230 / 557이고, 누적 전수 완료는 207 / 496이다. 나머지 초기 샘플 23 / 61은 `CURRENT_PARTIAL`로 구분한다. 품질 NEEDS_REVIEW 505 Concept는 초기 부분 검토 미확정 14 + 새로운 개별 검토 없는 491이다. Question NEEDS_REVIEW는 1,968이다. 과거 Area PASS는 `PRIOR_REVIEWED` 근거로 보존하며 새 KEEP의 근거로 자동 사용하지 않는다. Wave 1 summary는 당시 수량의 불변 snapshot이며 현재 누적 수량은 Wave 2 summary를 따른다.

초기 [6개 발견](findings.md)과 새 [Wave 1 12개 발견](wave-1-findings.json)을 구분한다. 새 P0 1 / P1 7 / P2 4 그룹은 **11 Concept / 9 Question**의 정밀 보강 대상이다. 특히 `messaging.core.delivery.ordering.q1`은 A/B 모두 타당한 단일 정답 오류다. 전면 재작성이나 수량 quota의 근거는 없다. 검토 완료는 수정 완료를 뜻하지 않는다.

[Wave 2 34개 발견](wave-2-findings.md)은 P0 5 / P1 23 / P2 6, **34 Concept / 9 Question**의 정밀 보강 대상이다. 핵심 오류는 Bean 초기화 도식 순서, HAVING/row lock acceptedAnswers의 요구 불충족, commit 후 outbox 기록, 비밀번호 일치만으로 인증 성공을 단정하는 전제다. 기존 초기·Wave 1 발견을 수정하거나 삭제하지 않았다. Wave 2의 미완료 항목은 0이며 전체 Issue #200의 품질 미확정 항목은 위 표와 같다.

## 방법과 근거 수준

1. `AGENTS.md`, MVP의 Concept/Question/import 계약, `content/AGENTS.md`, 두 README와 15개 Curriculum의 정책·objective·level/density/visualization을 확인했다.
2. canonical 영역은 `content/curriculum/*.yaml`의 디렉터리로 제한했다. `examples`, README, fixture, benchmark, generated pack을 집계에서 제외했다. DSA의 디렉터리는 `dsa`, Topic Area slug는 `data-structures-algorithms`, key prefix는 `dsa.core`이다.
3. 모든 Topic, Concept front matter/body, Question JSON을 파싱해 키·관계·순서·level·선행 관계·참조 메타데이터·이미지 경로를 대조했다. JSON/YAML 중복 property를 거절한다. 이미지 query string(`?v=2`)은 자산 경로에서 분리한다.
4. 이전 Phase A 7개 발견을 먼저 재확인했다. [차이](prior-delta.md), [현재 상태](prior-delta.json), [기존 PR 보고](external-evidence.json), [실제 병합/ancestor 증거](pr-merge-evidence.json)를 분리했다. PR 본문의 과거 Draft 문구보다 실제 병합 메타데이터를 따른다.
5. 15개 Area의 위험 주제와 기존 지적, 새 이상 후보를 순차적으로 읽었다. 직접 검토는 문제의 필요성→상태/흐름→예제 결과→실패 경계→trade-off→Question 요구를 대조했다. `review-notes.json`에 contentKey별 근거/검토 범위/소스 hash를 남겼다. 이 hash는 판정 대상을 고정할 뿐 품질 점수가 아니다.
6. `NONE/TEXT/DIAGRAM`에서 ASCII·timeline·상태 표도 동등한 시각화일 수 있다. fence/table/image 유무는 후보 신호만 만든다. 본문 글자 수나 그림 개수로 판정하지 않았다.
7. 초기 canonical Reference 17개 직접 대조 기록을 보존했다. Wave 1의 82 고유 canonical URL 중 78개는 관련 내용/역할을 대조했고 4개는 상세 접근 NEEDS_REVIEW다. etcd 보장 절과 NIST withdrawn 판본의 Wave 1 근거를 유지한다. Wave 2는 209 관계/171 고유 URL 중 206 관계의 관련 주장·역할을 대조했다. JPA specification 2관계와 Version API 1관계는 대상 페이지 상세 접근 NEEDS_REVIEW다. RFC9110의 짧은 URL 접근 미확정은 동일 공식 `.html`로 확인한 의미 근거와 별도로 기록한다. 원문 전체나 모든 625 URL의 새 검증을 주장하지 않는다.
8. 초기 감사에서 확인한 기존 60 SVG의 XML·소스 관계와 배포 URL 근거를 보존했다. 당시 모두 HTTP200/SVG/소스 일치(줄바꿈 차이 허용)이며 브라우저에서는 값 전달/CAS/공유 메모리/페이지 폴트 4개만 독립 SVG 화면으로 확인했다. Wave 2의 이미지 참조는 0이지만 기존 ASCII·상태 표·timeline을 개별로 평가했다. 모든 Concept Reader의 dark/light/mobile/human usage QA 완료나 배포 증거의 새 갱신을 뜻하지 않는다.

## 산출물 탐색

| 파일 | 용도 |
| --- | --- |
| [inventory.json](inventory.json) | 134 Topic, 721 Concept: key/path/objective/level/density/visualization/그림/Reference/Question/판정/근거 |
| [question-inventory.json](question-inventory.json) | 2,525 Question: key/path/arrayIndex/prompt/type/difficulty/status/Concept links/답안 구조/hash/판정. 실제 정답·해설은 source JSON에서 확인 |
| [area-summary.md](area-summary.md), [JSON](area-summary.json) | 15개 Area 집계·개별 검토·유지 근거·추가 검토 범위 |
| [findings.md](findings.md), [review-notes.json](review-notes.json) | 변경 대상과 정확한 인용/수정 방향/기존 결정 차이/후속 Issue |
| [wave-1/README.md](wave-1/README.md), 6개 Area 수동 JSON | Topic별 직접 읽기와 Concept·Question별 의미 근거, 도식·Reference 평가 |
| [wave-1-summary.json](wave-1-summary.json), [wave-1-findings.json](wave-1-findings.json) | 54/162 완료·잔여 재집계 및 새 12개 발견 원문 |
| [wave-2/README.md](wave-2/README.md), 4개 Area 수동 JSON | 153/334 전체 개별 근거·source hash·관련 공식 문서 확인 범위 |
| [wave-2-summary.json](wave-2-summary.json), [발견 JSON](wave-2-findings.json), [발견 보고](wave-2-findings.md) | Wave 2 완료 및 전체 누적 품질/근거 수량, 34개 발견의 인용·원문 위치 |
| [Wave 2 도식·Reference·후속 범위](wave-2/visualization-reference-followups.md) | 상태/흐름 후보, 접근 미확정 출처, 기존 #202/#203/#222의 최소 델타 |
| [wave-3/README.md](wave-3/README.md), 4개 Area 수기 JSON | 369/1,188 전체 개별 의미 근거·hash·도식·Reference 및 확인 한계 |
| [wave-3-summary.json](wave-3-summary.json), [발견 보고](wave-3-findings.md), [계승 발견](wave-3-carried-findings.json) | 최신 누적 집계, 새 100개 발견·원문 인용/위치, 기존 4개 재확인 |
| [visualization.md](visualization.md), [asset-inventory.json](asset-inventory.json) | 기존 그림 유지 근거와 상태/흐름별 선별 후보 |
| [references.md](references.md), [reference-inventory.json](reference-inventory.json) | 모든 URL 관계/metadata/직접 확인 수준과 개선 제안 |
| [prior-delta.md](prior-delta.md), [prior-delta.json](prior-delta.json) | Phase A 및 후속 Wave의 차이 |
| [followups.md](followups.md) | #201~#207/#222의 확정 대상과 검토 대기 범위 |
| [candidates.json](candidates.json) | 자동 발견 10개: 명시 시각화 신호 없음9 + 순서 차이1. 결함/수정 확정 목록과 다름 |
| [source-manifest.json](source-manifest.json) | canonical/Curriculum/자산의 파일별 SHA256과 Git baseline 검증 |
| [deployment-evidence.json](deployment-evidence.json) | 실제 배포 ID/SHA/URL/HTTP 응답/바이트 대조 |

## 재실행 및 검증

저장소 루트에서 Python과 이미 사용 가능한 PyYAML 6.0.3으로 실행한다. 새로운 패키지 설치나 product runtime dependency를 추가하지 않았다.

```powershell
python docs/content-audit/learning-experience-2026/audit.py
python docs/content-audit/learning-experience-2026/audit.py --check
git diff --check
git diff efe73a15da14c996bd08344181d4d6f87073803d -- content frontend/public/learning
```

첫 명령은 현재 inventory와 Wave 3 파생 보고서를 생성한다. Wave 1·2 파생 snapshot은 쓰지 않고 원래 overlay로 재현해 비교한다. 두 번째는 파일을 쓰지 않고 일관성을 확인한다. 수동 `review-notes.json`, `wave-1/*.json`, `wave-2/*.json`, `wave-3/*.json`의 판정을 알고리즘으로 만들거나 변경하지 않는다. Concept/개별 Question object/Curriculum/Topic 및 Wave 3 SVG hash가 바뀌면 낡은 근거를 거절한다. Wave 1의 216 key, Wave 2의 487 key, Wave 3의 1,557 key와 Topic·Reference 관계·발견 인용/추가 인용·key·ID·계승 발견을 확인한다. CRLF는 LF로 정규화하고 canonical/Curriculum/자산 945 파일의 기준선 Git object를 경로별 필터로 대조한다.

외부 배포가 같은 기준선인지 먼저 확인한 후 필요할 때만 `python docs/content-audit/learning-experience-2026/verify-assets.py`로 기존 deployment URL의 자산 증거를 갱신한다. 네트워크가 필요하며 날짜/응답이 달라질 수 있다. 이미지 파일을 저장하거나 생성하지 않는다. 외부 URL의 성공은 교육적 PASS 판정에 사용하지 않는다.

이 감사는 Import Preview/Apply, DB, Backend/Frontend build/test를 실행하지 않았다. product data/code가 바뀌지 않는 증거 작업에 bootstrap 테스트를 실행하면 Apply까지 일어나므로 제외 범위와 맞지 않는다. 구조 검증은 전체 import schema/domain 검증을 대체하지 않는다.

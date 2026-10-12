# Issue #200 — 학습 경험 품질 기준선

- 감사일: 2026-10-12 (Asia/Seoul)
- 기준선: 최신 `origin/main` 확인 후 생성한 `audit/issue-200-learning-experience`, `efe73a15da14c996bd08344181d4d6f87073803d`
- 범위: 15 LearningArea / 134 Topic / 721 Concept / 2,525 Question
- Reference: 1,043 관계 / 625 고유 URL. 기존 이미지: Java 26 + OS 34 = 60 SVG.
- [Issue #200](https://github.com/guseoh/csforge/issues/200), [Roadmap #199](https://github.com/guseoh/csforge/issues/199)

## 결론과 검토 한계

전수 **인벤토리와 구조 대조**를 보존하고 [Wave 1 직접 의미 검토](wave-1/README.md)를 추가했다. 소형 6 Area의 18 Topic / **54 Concept / 162 Question 전체 본문·답·모든 선택지·rationale·modelAnswer·explanation**을 직접 읽고 개별 근거를 기록했다. 해당 범위의 근거는 `CURRENT_VERIFIED`이며, 품질은 KEEP 또는 TARGETED_ENHANCE로 따로 판정한다. 다른 9 Area의 새 전수 의미 검토는 미완료다. 전체 721/2,525 의미 감사 완료나 기존 Wave 대체를 선언하지 않는다. 이 Draft는 ChatGPT 최종 검토 뒤 후속 대상으로 사용하며 Issue를 자동으로 닫지 않는다.

| 대상 | KEEP | TARGETED_ENHANCE | REWRITE_REQUIRED | NEEDS_REVIEW |
| --- | ---: | ---: | ---: | ---: |
| Concept | 50 | 19 | 0 | 652 |
| Question | 227 | 12 | 0 | 2,286 |

초기 PR 감사의 39 Concept / 98 Question은 `review-notes.json`에 그대로 보존한다. Wave 1과 겹치는 8 / 21은 새 근거로 대체하며 원래 판단은 `priorSampleReview`에 남긴다. 현재 고유 직접 접근 수는 85 / 239이고, **이번 전수 완료는 54 / 162**다. 나머지 초기 샘플 31 / 77은 `CURRENT_PARTIAL`로 구분한다. 품질 NEEDS_REVIEW 652 Concept는 초기 부분 검토 미확정 16 + 새로운 개별 검토 없는 636이다. Question NEEDS_REVIEW는 2,286이다. 과거 Area PASS는 `PRIOR_REVIEWED` 근거로 보존하며 새 KEEP의 근거로 자동 사용하지 않는다.

초기 [6개 발견](findings.md)과 새 [Wave 1 12개 발견](wave-1-findings.json)을 구분한다. 새 P0 1 / P1 7 / P2 4 그룹은 **11 Concept / 9 Question**의 정밀 보강 대상이다. 특히 `messaging.core.delivery.ordering.q1`은 A/B 모두 타당한 단일 정답 오류다. 전면 재작성이나 수량 quota의 근거는 없다. 검토 완료는 수정 완료를 뜻하지 않는다.

## 방법과 근거 수준

1. `AGENTS.md`, MVP의 Concept/Question/import 계약, `content/AGENTS.md`, 두 README와 15개 Curriculum의 정책·objective·level/density/visualization을 확인했다.
2. canonical 영역은 `content/curriculum/*.yaml`의 디렉터리로 제한했다. `examples`, README, fixture, benchmark, generated pack을 집계에서 제외했다. DSA의 디렉터리는 `dsa`, Topic Area slug는 `data-structures-algorithms`, key prefix는 `dsa.core`이다.
3. 모든 Topic, Concept front matter/body, Question JSON을 파싱해 키·관계·순서·level·선행 관계·참조 메타데이터·이미지 경로를 대조했다. JSON/YAML 중복 property를 거절한다. 이미지 query string(`?v=2`)은 자산 경로에서 분리한다.
4. 이전 Phase A 7개 발견을 먼저 재확인했다. [차이](prior-delta.md), [현재 상태](prior-delta.json), [기존 PR 보고](external-evidence.json), [실제 병합/ancestor 증거](pr-merge-evidence.json)를 분리했다. PR 본문의 과거 Draft 문구보다 실제 병합 메타데이터를 따른다.
5. 15개 Area의 위험 주제와 기존 지적, 새 이상 후보를 순차적으로 읽었다. 직접 검토는 문제의 필요성→상태/흐름→예제 결과→실패 경계→trade-off→Question 요구를 대조했다. `review-notes.json`에 contentKey별 근거/검토 범위/소스 hash를 남겼다. 이 hash는 판정 대상을 고정할 뿐 품질 점수가 아니다.
6. `NONE/TEXT/DIAGRAM`에서 ASCII·timeline·상태 표도 동등한 시각화일 수 있다. fence/table/image 유무는 후보 신호만 만든다. 본문 글자 수나 그림 개수로 판정하지 않았다.
7. 초기 canonical Reference 17개 직접 대조 기록을 보존했다. Wave 1의 82 고유 canonical URL 중 78개는 관련 내용/역할을 대조했고 4개는 상세 접근 NEEDS_REVIEW다. etcd API guarantees의 이전 부분 확인은 이번 Wave 관계에서 보장 절 직접 확인으로 보완했다. NIST withdrawn 판본은 접근 가능한 Reference의 품질 문제로 기록한다. 원문 전체나 모든 625 URL의 새 검증을 주장하지 않는다.
8. 기존 60 SVG의 XML·소스 관계와 배포 URL을 전수 대조했다. 모두 HTTP200/SVG/소스 일치(줄바꿈 차이 허용)다. 브라우저에서는 값 전달/CAS/공유 메모리/페이지 폴트 4개만 독립 SVG 화면으로 확인했다. 모든 Concept Reader의 dark/light/mobile/human usage QA 완료를 뜻하지 않는다.

## 산출물 탐색

| 파일 | 용도 |
| --- | --- |
| [inventory.json](inventory.json) | 134 Topic, 721 Concept: key/path/objective/level/density/visualization/그림/Reference/Question/판정/근거 |
| [question-inventory.json](question-inventory.json) | 2,525 Question: key/path/arrayIndex/prompt/type/difficulty/status/Concept links/답안 구조/hash/판정. 실제 정답·해설은 source JSON에서 확인 |
| [area-summary.md](area-summary.md), [JSON](area-summary.json) | 15개 Area 집계·개별 검토·유지 근거·추가 검토 범위 |
| [findings.md](findings.md), [review-notes.json](review-notes.json) | 변경 대상과 정확한 인용/수정 방향/기존 결정 차이/후속 Issue |
| [wave-1/README.md](wave-1/README.md), 6개 Area 수동 JSON | Topic별 직접 읽기와 Concept·Question별 의미 근거, 도식·Reference 평가 |
| [wave-1-summary.json](wave-1-summary.json), [wave-1-findings.json](wave-1-findings.json) | 54/162 완료·잔여 재집계 및 새 12개 발견 원문 |
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

첫 명령은 10개 JSON 보고서와 `area-summary.md`를 생성한다. 두 번째는 파일을 쓰지 않고 일관성을 확인한다. 수동 `review-notes.json`과 `wave-1/*.json`의 판정을 알고리즘으로 만들거나 변경하지 않는다. Concept/개별 Question object/Curriculum/Topic hash가 바뀌면 낡은 근거를 오류로 거절한다. Wave의 6 Area/18 Topic/216 key·Reference 관계 누락/중복과 발견 인용·key·ID도 확인한다. CRLF는 LF로 정규화하고 source의 기준선 Git object를 경로별 필터로 대조한다.

외부 배포가 같은 기준선인지 먼저 확인한 후 필요할 때만 `python docs/content-audit/learning-experience-2026/verify-assets.py`로 기존 deployment URL의 자산 증거를 갱신한다. 네트워크가 필요하며 날짜/응답이 달라질 수 있다. 이미지 파일을 저장하거나 생성하지 않는다. 외부 URL의 성공은 교육적 PASS 판정에 사용하지 않는다.

이 감사는 Import Preview/Apply, DB, Backend/Frontend build/test를 실행하지 않았다. product data/code가 바뀌지 않는 증거 작업에 bootstrap 테스트를 실행하면 Apply까지 일어나므로 제외 범위와 맞지 않는다. 구조 검증은 전체 import schema/domain 검증을 대체하지 않는다.

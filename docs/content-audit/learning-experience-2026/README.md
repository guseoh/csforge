# Issue #200 — 학습 경험 품질 기준선

- 감사일: 2026-10-12 (Asia/Seoul)
- 기준선: 최신 `origin/main` 확인 후 생성한 `audit/issue-200-learning-experience`, `efe73a15da14c996bd08344181d4d6f87073803d`
- 범위: 15 LearningArea / 134 Topic / 721 Concept / 2,525 Question
- Reference: 1,043 관계 / 625 고유 URL. 기존 이미지: Java 26 + OS 34 = 60 SVG.
- [Issue #200](https://github.com/guseoh/csforge/issues/200), [Roadmap #199](https://github.com/guseoh/csforge/issues/199)

## 결론과 검토 한계

전수 **인벤토리와 구조 대조**를 완료했다. 이번에 직접 읽은 Concept는 39개, Question은 98개이다. 이는 기존 Quality Wave의 전수 검토를 대체하는 새 721개/2,525개 의미 검토가 아니다. 충분히 대조하지 못한 항목을 KEEP/PASS로 간주하지 않았다. 15개 Area의 이번 최종 판정은 모두 `NEEDS_REVIEW`이고, 이전 Wave/Phase A의 Area PASS 근거는 별도로 보존한다. 이 Draft를 ChatGPT가 최종 검토한 뒤 확정 대상만 다음 단계에 사용한다. Issue를 자동으로 닫지 않는다.

| 대상 | KEEP | TARGETED_ENHANCE | REWRITE_REQUIRED | NEEDS_REVIEW |
| --- | ---: | ---: | ---: | ---: |
| Concept | 8 | 8 | 0 | 705 |
| Question | 95 | 3 | 0 | 2,427 |

Concept `NEEDS_REVIEW` 705개 중 23개는 이번에 본문을 직접 읽었으나 모든 출처/Question/그림의 대조가 끝나지 않은 항목이고, 682개는 새 개별 의미 검토를 수행하지 않았다. Question은 98개 전체 전제·선택지/acceptedAnswers/modelAnswer·해설을 대조했으며 정답 오류는 발견하지 않았다. `NEEDS_REVIEW`는 수정 지시나 이전 PASS 취소가 아니다. `REWRITE_REQUIRED` 0도 전수 정확성 보증을 뜻하지 않는다.

확정 선별 제안은 [findings.md](findings.md)의 P1 1개 그룹(두 MC 문항), P2 5개 그룹이다. P1은 사실/정답 오류가 아니라 반복된 비현실적 오답 설계다. ChatGPT는 특히 그 심각도와 보강 필요성을 확인해야 한다. 전면 재작성, Question 수 quota, 그림 수 quota의 근거는 없다.

## 방법과 근거 수준

1. `AGENTS.md`, MVP의 Concept/Question/import 계약, `content/AGENTS.md`, 두 README와 15개 Curriculum의 정책·objective·level/density/visualization을 확인했다.
2. canonical 영역은 `content/curriculum/*.yaml`의 디렉터리로 제한했다. `examples`, README, fixture, benchmark, generated pack을 집계에서 제외했다. DSA의 디렉터리는 `dsa`, Topic Area slug는 `data-structures-algorithms`, key prefix는 `dsa.core`이다.
3. 모든 Topic, Concept front matter/body, Question JSON을 파싱해 키·관계·순서·level·선행 관계·참조 메타데이터·이미지 경로를 대조했다. JSON/YAML 중복 property를 거절한다. 이미지 query string(`?v=2`)은 자산 경로에서 분리한다.
4. 이전 Phase A 7개 발견을 먼저 재확인했다. [차이](prior-delta.md), [현재 상태](prior-delta.json), [기존 PR 보고](external-evidence.json), [실제 병합/ancestor 증거](pr-merge-evidence.json)를 분리했다. PR 본문의 과거 Draft 문구보다 실제 병합 메타데이터를 따른다.
5. 15개 Area의 위험 주제와 기존 지적, 새 이상 후보를 순차적으로 읽었다. 직접 검토는 문제의 필요성→상태/흐름→예제 결과→실패 경계→trade-off→Question 요구를 대조했다. `review-notes.json`에 contentKey별 근거/검토 범위/소스 hash를 남겼다. 이 hash는 판정 대상을 고정할 뿐 품질 점수가 아니다.
6. `NONE/TEXT/DIAGRAM`에서 ASCII·timeline·상태 표도 동등한 시각화일 수 있다. fence/table/image 유무는 후보 신호만 만든다. 본문 글자 수나 그림 개수로 판정하지 않았다.
7. 17개 canonical Reference URL은 이번에 관련 내용을 확인했다. etcd 1개는 접근만 확인하고 의미 대조 미완료, 나머지 607개는 이번 직접 검증 미완료다(man7 접근 실패 1개 포함). 단순 접근 실패를 존재하지 않는 출처/P0로 판정하지 않았다. 모든 URL의 학습 가치가 새로 확인됐다고 주장하지 않는다.
8. 기존 60 SVG의 XML·소스 관계와 배포 URL을 전수 대조했다. 모두 HTTP200/SVG/소스 일치(줄바꿈 차이 허용)다. 브라우저에서는 값 전달/CAS/공유 메모리/페이지 폴트 4개만 독립 SVG 화면으로 확인했다. 모든 Concept Reader의 dark/light/mobile/human usage QA 완료를 뜻하지 않는다.

## 산출물 탐색

| 파일 | 용도 |
| --- | --- |
| [inventory.json](inventory.json) | 134 Topic, 721 Concept: key/path/objective/level/density/visualization/그림/Reference/Question/판정/근거 |
| [question-inventory.json](question-inventory.json) | 2,525 Question: key/path/arrayIndex/prompt/type/difficulty/status/Concept links/답안 구조/hash/판정. 실제 정답·해설은 source JSON에서 확인 |
| [area-summary.md](area-summary.md), [JSON](area-summary.json) | 15개 Area 집계·개별 검토·유지 근거·추가 검토 범위 |
| [findings.md](findings.md), [review-notes.json](review-notes.json) | 변경 대상과 정확한 인용/수정 방향/기존 결정 차이/후속 Issue |
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

첫 명령은 이 디렉터리의 8개 JSON 보고서와 `area-summary.md`를 생성한다. 두 번째는 파일을 쓰지 않고 결과 일관성을 확인한다. 수동 `review-notes.json`을 알고리즘으로 판정/수정하지 않는다. Concept hash 또는 개별 Question object hash가 달라지면 낡은 수동 근거를 오류로 거절한다. text file SHA256은 CRLF를 LF로 정규화해 Git autocrlf 환경 사이에서 재현 가능하게 한다. source가 기준선 Git tree와 달라져도 Git의 경로별 필터를 적용한 object hash로 거절한다. 발견 사항의 인용·key·중복 ID도 검증한다.

외부 배포가 같은 기준선인지 먼저 확인한 후 필요할 때만 `python docs/content-audit/learning-experience-2026/verify-assets.py`로 기존 deployment URL의 자산 증거를 갱신한다. 네트워크가 필요하며 날짜/응답이 달라질 수 있다. 이미지 파일을 저장하거나 생성하지 않는다. 외부 URL의 성공은 교육적 PASS 판정에 사용하지 않는다.

이 감사는 Import Preview/Apply, DB, Backend/Frontend build/test를 실행하지 않았다. product data/code가 바뀌지 않는 증거 작업에 bootstrap 테스트를 실행하면 Apply까지 일어나므로 제외 범위와 맞지 않는다. 구조 검증은 전체 import schema/domain 검증을 대체하지 않는다.

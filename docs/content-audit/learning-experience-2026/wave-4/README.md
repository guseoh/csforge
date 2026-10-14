# Wave 4 Java — 두 Topic 누적 감사

2026-10-14, 기준선 `efe73a15da14c996bd08344181d4d6f87073803d`, 기존 Draft PR #223/브랜치 `audit/issue-200-learning-experience`. 이번 Delta는 object-model 12C/68Q 및 다중 Topic 누적 검증기 보완이다. canonical/Curriculum/SVG/DB/제품을 변경하지 않는다.

| Topic | C / Q 전수 완료 | C KEEP / 보강 | Q KEEP / 보강 | 새 P0 / P1 / P2 |
| --- | ---: | ---: | ---: | ---: |
| language-types | 10 / 55 | 6 / 4 | 51 / 4 | 2 / 2 / 0 |
| object-model | 12 / 68 | 10 / 2 | 65 / 3 | 1 / 1 / 1 |
| 합계 | **22 / 123** | **16 / 6** | **116 / 7** | **3 / 3 / 1** |

새 발견7그룹과 기존 LEX-002 P2 계승1그룹을 별도 집계한다. 두 Topic의 CURRENT_VERIFIED 항목은22C/123Q, 품질 NEEDS_REVIEW/REWRITE_REQUIRED는0이다. Reference 확인 한계와 확정 오류는 별도이며 검토 완료가 무결점/교정 완료를 뜻하지 않는다.

## Topic 근거·보존

- [language-types 수기 ledger](topics/java--language-types.json)는 기존 commit393d098의 byte/hash/판정/발견/Reference/SVG/probe 근거 그대로다. [당시 보고서](language-types-report.md), [당시 검증](language-types-validation.md), [단일 Topic 당시 summary](snapshots/language-types-summary.json)를 원래 Git object에서 보존했다. snapshot 안의 당시/현재/다음 표현은 첫 실행 시점의 기록이다.
- [object-model 수기 ledger](topics/java--object-model.json)와 [신규 의미 검토 결과](object-model-report.md)에 12C/68Q 전체의 개별 근거/80 source hash/실제 발견을 기록했다.
- [누적 발견](findings.md), [발견 JSON](findings.json), [기존 계승](carried-findings.json), [Reference 미확정·문제](reference-issues.json), [최신 summary](summary.json), [검증](validation.md)을 함께 사용한다.

## 누적 처리의 경계

load_wave는 각 Topic 원본을 `topicLedgers`로 보존하고 Area에 topics/Concept/Question/발견/계승/SVG를 합산한다. 이전 `ledgers[area]=data` 덮어쓰기와 단일 Topic 고정 총계를 제거했다. 총계는 명시적으로 승인한 WAVE_4_TOPICS의 수량으로 검증하며 임의 Topic을 완료 처리하지 않는다.

Reference source마다 실제 Concept key와 Topic 범위를 보존한다. 동일 URL을 다른 Topic에서 확인해도 현재 relation의 확인 수준·근거·접근 상태를 자동 승격하지 않는다. object-model의 JLS8을 NEEDS_REVIEW로 바꾼 메모리 안의 회귀 fixture에서도 language-types JLS8은 CURRENT_VERIFIED, object-model은 NEEDS_REVIEW, 미검토 Topic은 근거 없음으로 남는다. 원본 파일을 수정하는 테스트가 아니다. Topic별 중복 source URL, item key/hash, SVG의 중복/낡은 hash를 거절하고 probe는 있는 Topic에서만 원본 코드를 검증한다.

canonical Reference는 **44관계/35 URL**. 관련 내용 검토43관계 CURRENT_VERIFIED / language-types D2 1관계 NEEDS_REVIEW다. 이43관계에는 **확정 오류가 있는 constructor Reference 1관계**도 포함되며 qualityIssueIds 및 findings에서 P0로 별도 표시한다. 관련 절 검토와 출처 품질을 혼동하지 않는다.

기존 language-types의 SVG4개 소스 의미 및 probe, 새 object-model의 제한된 초기화/Reference probe를 각각 보존한다. object-model은 본문 이미지0이며 ASCII·표·코드의 실제 설명 효과로 판단했다. 전체 runtime/성능 및 Reader/mobile/theme/human QA는 완료로 주장하지 않는다.

## 누적 진행률·후속

완료 Area14/부분 Java1, **118/134 Topic**, **598/721C(82.94%)·1,807/2,525Q(71.56%)** 전수 검토다. Java는 **2/18 Topic·22/145C·123/841Q**만 완료했다. 남은 새 전수 범위16 Topic/123C/718Q에는 기존 partial3C/19Q가 포함되며, 전체 근거 NEEDS_REVIEW120C/699Q와 품질 미확정122C/699Q를 구별한다. J-A는2/6 Topic·22/44C·123/240Q다.

#201의 최소 보강은 기존 language-types 범위와 신규 초기화 설명1C/오답 feedback3Q, constructor Reference1C다. #222와 constructor 출처 오류1관계 및 D2 미확정1관계를 조정한다. 후속 구현·새 Issue/PR·merge는 하지 않는다. 다음 Topic은 `java.core.api-design`이며 이번 의미 검토 범위에 포함하지 않는다. **Wave4/Java/Issue200 전체 감사 완료가 아니다.** ChatGPT 최종 콘텐츠 품질 검토 후 다음 단계에 활용한다.

## 재실행

```powershell
python docs/content-audit/learning-experience-2026/wave-4/check-accumulation.py
python docs/content-audit/learning-experience-2026/wave-3/checkpoint-topic.py docs/content-audit/learning-experience-2026/wave-4/topics/java--language-types.json
python docs/content-audit/learning-experience-2026/wave-3/checkpoint-topic.py docs/content-audit/learning-experience-2026/wave-4/topics/java--object-model.json
python docs/content-audit/learning-experience-2026/audit.py
python docs/content-audit/learning-experience-2026/audit.py --check
java docs/content-audit/learning-experience-2026/wave-4/probes/ObjectModelProbe.java
git diff --check
```

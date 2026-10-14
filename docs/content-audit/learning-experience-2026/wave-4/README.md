# Wave 4 Java — 세 Topic 누적 감사

2026-10-14, 기준선 `efe73a15da14c996bd08344181d4d6f87073803d`, 기존 Draft PR #223/브랜치 `audit/issue-200-learning-experience`. 이번 Delta는 Reference 관계 격리와 api-design5C/28Q 의미 검토다. canonical/Curriculum/SVG/DB/제품은 변경하지 않는다.

| Topic | C / Q 전수 완료 | C KEEP / 보강 | Q KEEP / 보강 | 새 P0 / P1 / P2 |
| --- | ---: | ---: | ---: | ---: |
| language-types | 10 / 55 | 6 / 4 | 51 / 4 | 2 / 2 / 0 |
| object-model | 12 / 68 | 10 / 2 | 65 / 3 | 1 / 1 / 1 |
| api-design | 5 / 28 | 3 / 2 | 28 / 0 | 1 / 0 / 1 |
| 합계 | **27 / 151** | **19 / 8** | **144 / 7** | **4 / 3 / 2** |

새 발견9그룹과 기존 LEX-002 P2 계승1그룹은 별도다. 검토된27C/151Q는 CURRENT_VERIFIED이며 REWRITE_REQUIRED/품질 NEEDS_REVIEW0이다. 의미 검토 완료는 교정 완료 또는 무결점 판정이 아니다.

## 근거와 보존

- 기존 [language-types 원본](topics/java--language-types.json) 및 [object-model 원본](topics/java--object-model.json)은 Git81484fb와 bytes 동일하다. 판정·발견7그룹·LEX-002·SVG4개·probe를 보존한다.
- [첫 Topic 보고서](language-types-report.md)/[당시 검증](language-types-validation.md)/[단일 Topic snapshot](snapshots/language-types-summary.json), [object-model 보고서](object-model-report.md), [두 Topic 당시 snapshot](snapshots/two-topic-summary.json)은 역사적 수량과 검토 한계의 기록이다.
- [api-design의33개 개별 근거](topics/java--api-design.json)/[신규 보고서](api-design-report.md), [누적 발견](findings.md)/[JSON](findings.json), [계승](carried-findings.json), [최신 summary](summary.json), [검증](validation.md)을 함께 사용한다.

## Reference의 실제 귀속

[관계별 수기 sidecar](reference-relations.json)와 [격리 수정 설명](reference-isolation.md)을 기준으로 `(contentKey, URL)`만 검증 근거를 부여한다. Topic 원본의 URL 확인 상태를 같은 Topic의 다른 Concept 또는 다른 Topic에 자동 전파하지 않는다. canonical 관계 집합/Reference 객체/hash의 누락·중복·무관한 URL·오래된 근거를 거절한다. supportingEvidence도 해당 Concept의 canonical/별도 보조 관계로 확인해야 한다.

기존44관계(43검토/1미확정)를 개별 대응하고 신규9관계를 직접 검토했다. 누적 **53관계/42 URL**, 의미 근거 **52 CURRENT_VERIFIED/1 NEEDS_REVIEW(D2)**다. 이52관계에는 확정 P0 오류가 있는 constructor/factory 출처2관계가 포함되며 [reference-issues.json](reference-issues.json)의 qualityIssueIds로 분리한다. 문서 전문 검증·모든 snippet 실행 PASS가 아니다.

기존 SVG4개 소스 검토와 두 probe를 보존한다. api-design 이미지 참조는0이며 실제 ASCII·코드·표가 목표에 충분한지 확인했다. 신규 제한 컴파일은 includeClosed 누락/한 줄 제거 성공/missing static의 호출 오류만 대조했다. runtime 전체·성능·Reader/mobile/theme/human QA는 미완료다.

## 누적 진행률·후속

완료 Area14/부분 Java1, **119/134 Topic**, **603/721C(83.63%)·1,835/2,525Q(72.67%)** 전수 검토다. Java **3/18Topic·27/145C·151/841Q**, 잔여 **15Topic/118C/690Q**(기존 partial3C/19Q 포함). 전체 근거 NEEDS_REVIEW115C/671Q와 품질 미확정117C/671Q를 구별한다. J-A는3/6Topic·27/44C·151/240Q다.

#201에 신규Builder 예시 연결1C와 정확한 factory본문을 유지한 Reference1C만 권장하고 #222와 출처1관계 교체/한정을 조정한다. 기존 두 Topic/Wave1~3 후속 범위는 보존하며 구현하지 않는다. 다음 `java.core.object-contracts`5C/31Q는 이번에 의미 검토하지 않았다. **Wave4/Java/Issue200 전체 완료가 아니다.** ChatGPT 최종 콘텐츠 품질 검토 후 다음 단계에 활용한다.

## 재실행

```powershell
python docs/content-audit/learning-experience-2026/wave-4/check-accumulation.py
python docs/content-audit/learning-experience-2026/wave-3/checkpoint-topic.py docs/content-audit/learning-experience-2026/wave-4/topics/java--language-types.json
python docs/content-audit/learning-experience-2026/wave-3/checkpoint-topic.py docs/content-audit/learning-experience-2026/wave-4/topics/java--object-model.json
python docs/content-audit/learning-experience-2026/wave-3/checkpoint-topic.py docs/content-audit/learning-experience-2026/wave-4/topics/java--api-design.json
python docs/content-audit/learning-experience-2026/audit.py
python docs/content-audit/learning-experience-2026/audit.py --check
python docs/content-audit/learning-experience-2026/wave-4/probes/check-api-design.py
git diff --check
```

Probe는 JDK25 javac와 쓰기 가능한 OS 임시 디렉터리가 필요하다. 감사 generate/--check와 의미 ledger 검증은 컴파일러/네트워크를 요구하지 않는다.

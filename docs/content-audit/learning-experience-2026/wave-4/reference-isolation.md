# Reference 검증의 관계 단위 격리

2026-10-14, 기존 원본 `java--language-types.json`·`java--object-model.json`과 당시 snapshot은 수정하지 않는다. 같은 Topic의 URL 상태를 모든 Concept에 복제하던 증거 귀속 결함을 수정했다. 기존 품질 판정/발견의 오류를 새로 주장하는 변경은 아니다.

[reference-relations.json](reference-relations.json)이 Wave4 canonical Reference 의미 검증의 기준이다. 각 `(contentKey, URL)`에 **관련 절·학습 목적의 수기 basis, evidenceLevel, 한계, 실제 Concept 경로/hash, canonical front matter Reference 객체**를 저장한다. 기존44관계는 이전에 직접 읽은 해당 Concept의 Reference 축과 관련 절을 한 관계씩 다시 대응한 `PRIOR_DIRECT_REVIEW_RELATION_RECONCILIATION`이다. URL 상태를 자동 복사해 판정을 생성하지 않았다. D2 본문을 새로 확인했다고 주장하지 않는다.

| 범위 | 관계 | CURRENT_VERIFIED | NEEDS_REVIEW |
| --- | ---: | ---: | ---: |
| 기존 language-types | 20 | 19 | 1 |
| 기존 object-model | 24 | 24 | 0 |
| 신규 api-design | 9 | 9 | 0 |
| 합계 | **53** | **52** | **1** |

52의 검토 완료에는 constructor 글의 기존 P0 오류1관계와 factory 글의 신규 P0 오류1관계가 포함된다. 관계 학습 가치의 대조와 무결점 품질을 구별하며 두 오류는 qualityIssueIds와 reference-issues.json에 표시한다. D2 미확정 및 기존 URL 접근 한계는 유지한다.

`load_wave()`는 원본 Topic의 `sources`를 역사적 URL 기록으로 보존하되, 그 상태를 Wave4 관계에 전파하지 않는다. sidecar와 **canonical 관계 집합이 완전히 일치**해야 한다. 중복/누락·무관한 URL·Reference 객체 불일치·오래된 source hash는 검증 오류다. `scoped_sources()`는 한 Concept key만 일치시켜 같은 Topic의 다른 Concept와 다른 Topic 모두 격리한다. accessVerification 역시 해당 관계에서 가져온다. 미검토 Java의 URL은 새 근거로 승격되지 않는다.

`supportingEvidence`도 한 Concept의 실제 canonical 관계 또는 별도 `supportingRelations`의 확인을 요구한다. 이번 보조3관계는 Integer API→factory, List.copyOf→Builder, JLS14.1→method contract에만 귀속한다. 동일 URL을 다른 Concept에서 읽었거나 Topic URL 기록에 verified가 있다는 이유로 승인하지 않는다.

[회귀 검사](check-accumulation.py)는 기존 누적·snapshot·key/hash 검사와 함께 같은 Topic A verified/B NEEDS_REVIEW, Topic 간 동일 URL, 미검토 key, supporting 근거 차용 거절,44관계/두 원본 byte 보존, 관계 중복·누락·무관한 URL·오래된 hash·변경된 인용·누락된 supporting 관계를 검사한다. 메모리 안의 fixture만 바꾸며 원본 ledger/canonical을 수정하지 않는다. [두 Topic 당시 요약](snapshots/two-topic-summary.json)은 Git81484fb의 원본 bytes다.

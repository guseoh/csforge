# #278 Batch — J-object-contracts

기준: `refactor` `786b25a9f4d0a08477e9c87da34122730037962b`, 검토일 2026-10-28 KST.

**5 Concept / 31 Question 전수 검토 완료.** 구현·검증 기록이며 독립 리뷰 승인을 대신하지 않습니다.

## Concept 검토

| Concept | #277 목표 / 결과 | 정확성·설명·문체·Markdown 검토 |
| --- | --- | --- |
| `comparable-natural-order` | NONE / NO_VISUAL_NEEDED | 부호·추이성·0 비교의 제3값 일관성 보강, BigDecimal·오버플로·TreeSet 경계 |
| `comparator-custom-order` | V1 / DONE | 동률 분기 V1, reversed의 적용 범위와 고유 tie-break·null 정책 확인 |
| `equals-contract` | NONE / NO_VISUAL_NEEDED | record 예시와 별도 필드 골격 구분, 동등성 계약과 상속 비대칭 검토, 분기 ASCII를 문장으로 통합 |
| `hashcode-contract` | V1 / DONE | Money 생성자 보완, 동등성의 단방향 해시 함의·충돌·가변 키·영구 ID 경계 |
| `tostring-diagnostics` | NONE / NO_VISUAL_NEEDED | 진단 표현·비밀 노출·순환·호출 비용·직렬화 계약 분리 확인; 기존 설명 유지 |

본문의 유효한 합쇼체·예시·학습 순서를 유지했습니다. 구조 ASCII는 필요한 도식/문장으로 통합하고, 코드·수학 관계·실제 출력 표본은 보존했습니다. NONE 항목에 억지로 도식을 추가하지 않았습니다.

## Question 전수 검토

prompt·정답·선택지와 근거·해설/모범 답안·난이도·Concept 연결 31개를 모두 대조했습니다. 2개만 필요한 교정을 했고 나머지 29개는 유지했습니다. **정답 키·난이도·문항/선택지 key와 순서·Concept 연결은 모두 유지**했습니다.

| Question | 교정 근거 |
| --- | --- |
| `equals-contract.q2` | Money→Voucher와 역방향 비교의 비대칭 원인이 하위 타입 검사임을 정확히 설명 |
| `comparator-custom-order.q1` | 항상 0인 Comparator 자체가 불법이라는 오해를 제거하고 자동 동작을 가정하는 오답으로 정리 |

모든 문항의 KEEP/CORRECTED 판정, 변경 필드와 검토 대상 SHA-256은 [review.json](review.json)에 있습니다.

## 도식과 Reference

이 Topic에는 교체할 기존 외부 SVG가 없습니다.

외부 SVG 파일 자체는 이전에 저장된 Markdown과의 호환을 위해 보존했습니다. 이번 canonical 본문은 승인된 inline 선언을 사용합니다. Java 기존 SVG 27개와 다른 Java Topic/Network 파일은 변경하지 않았습니다.

기존 공식 JLS/Java SE 25 API 참조와 relationNote를 검토했습니다. 전체 URL과 확인 방식은 [공통 Reference 기록](../java-batch/references.json)에 있습니다. D2 보조 자료는 역사적 구현/인코딩 사례로 유지하며 Java 25 규범으로 사용하지 않습니다.

## 검증

- 격리 PostgreSQL: 이 Topic 전체 Preview **ERROR=0**, Apply 성공, 동일 파일 재Preview **37개 전부 UNCHANGED**, 재Apply 후에도 개인 이력 동일.
- 5개 Concept에 진도·북마크·노트·quiz/attempt/선택지·오답·복습 이력을 심고 업데이트 전후를 비교했습니다. 이력 8개 테이블과 모든 Question/선택지 ID·정답·연결을 보존했습니다.
- 실제 Markdown 전체 렌더링과 선언 검증은 Frontend Topic별 테스트에서 수행했습니다. 다크/라이트 × 1440px/390px 브라우저 검사에서 도식 대체 오류·SVG 텍스트 넘침이 없었습니다.
- Java 25 compiler/API 프로브, 전체 Backend 54 suite/190 tests(실패 0·skip 1), 최종 콘텐츠 4 suite/10 tests(실패·skip 0), Frontend 73 files/529 tests와 lint/build, Compose 검증 통과.
- 명령·통합 테스트 범위와 결과는 [Batch 보고서](../java-batch/README.md), [검증 집계](../java-batch/verification.json), [브라우저 기록](../java-batch/browser-qa.json)을 참조하세요.

## 보존과 남은 범위

`contentKey`, Topic/slug/title/level/status/order, 문항 정답과 선택지 식별자를 보존했습니다. DB schema·Reader/Quiz 전체 구조·운영 데이터는 변경하지 않았습니다. `J-object-model`은 기존 독립 리뷰 대기 상태로 유지합니다. 기존 공통 UI 디자인/라이트 제목 대비는 [후속 재검토 목록](../java-batch/design-followups.md)에 기록했습니다.

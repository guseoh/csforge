# 선별 수정 제안

기준선과 검토 한계는 [README](README.md)를 따른다. 아래는 **초기 샘플 감사의 6개 발견**이며 source 인용/contentKey는 [review-notes.json](review-notes.json)에 보존한다. 초기 P0 0 / P1 1그룹 / P2 5그룹이다. 새 Wave 1은 별도 [상세 목록](wave-1/README.md), [12개 발견 원문](wave-1-findings.json)에 있고 P0 1 / P1 7 / P2 4그룹이다. 새 P0는 ordering.q1의 A/B 복수 정답 문제다. 초기와 새 발견을 섞어 P0가 없다고 보고하지 않는다.

| ID / 심각도 | contentKey / 파일 | 문제와 최소 변경 | 후속 |
| --- | --- | --- | --- |
| LEX-001 / P1 | `java.core.concurrency.atomic-cas.q2` — [concurrency/questions.json](../../../content/java/concurrency/questions.json); `network-http.core.http-state-intermediary.trusted-proxy-boundary.q1` — [intermediary/questions.json](../../../content/network-http/http-state-intermediary/questions.json) | CAS B/C `변수가 삭제되었다`/`다른 모든 스레드가 종료되었다`, Proxy D `어떤 HTML 태그를 브라우저가 렌더링할지`는 목표와 무관한 제거형 오답이다. 예상값/실제값 불일치·갱신 미적용, 외부 Forwarded 위조·홉 정책의 실제 misconception으로 해당 선택지만 교체. 정답 key/type/difficulty 유지. | #201 / #202 |
| LEX-002 / P2 | `java.core.language-types.pass-by-value` — [본문](../../../content/java/language-types/pass-by-value.md), [기존 SVG](../../../frontend/public/learning/java/pass-by-value.svg) | 3단계 caller→A 경로 `M253 448 H650`가 value box와 라벨을 통과한다. 두 변수의 선/행을 분리해 재대입 이후의 참조 관계를 분명하게 한다. 본문/문제/이미지 identity 유지. | #201 |
| LEX-003 / P2 | `computer-architecture.core.virtual-memory-hardware.multi-level-page-table` — [본문 metadata](../../../content/computer-architecture/virtual-memory-hardware/multi-level-page-table.md), [Curriculum](../../../content/curriculum/computer-architecture.yaml) | canonical60 / Curriculum50. TLB40→현재→huge-page70 상대 순서는 정상이다. 의도 확인 후 order metadata만 일치시킨다. P1 학습 순서 오류로 과장하지 않는다. | #201 |
| LEX-004 / P2 | `dsa.core.dynamic-programming.initialization-order`, `dsa.core.dynamic-programming.space-optimization` — [초기화](../../../content/dsa/dynamic-programming/initialization-order.md), [공간 최적화](../../../content/dsa/dynamic-programming/space-optimization.md) | 타당한 설명/Question이 있지만 `TEXT` 상태 추적은 없다. weight2/value3/capacity4에서 순방향 dp4=6(같은 물건 재사용), 역순 dp4=3을 보여주는 작은 표. 초기화는 순서, 공간 최적화는 이전/현재 행 보관 경계로 책임 구분. | #202 |
| LEX-005 / P2 | `computer-architecture.core.virtual-memory-hardware.tlb.q1` — [questions.json](../../../content/computer-architecture/virtual-memory-hardware/questions.json) | 대상 종류를 묻는데 해설에 전제 없는512 계산이 나온다. q1은 data cache/translation/permission 차이에 집중하고 수치 계산은 이미 전제를 준 q3에 유지. 정답 C 유지. | #201 |
| LEX-006 / P2 | `security.core.authn-authz.authentication` — [본문/Reference](../../../content/security/authn-authz/authentication.md) | password overview는 유효하다. credential 검증과 context 형성을 따라 읽으려면 공식 DaoAuthenticationProvider/Form Login의 해당 실행 절이 더 직접적이다. 기존 URL global metadata를 임의 변경하지 않고 관계의 직접성만 선택 개선. | #222 |

두 P1 문항의 정답이 틀렸다는 발견은 없다. 현재 본문이 제공하는 계약을 실제로 이해했는지 변별하기 어려운 오답 설계 문제다. [AtomicInteger](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html), [RFC7239 §8.1](https://www.rfc-editor.org/rfc/rfc7239#section-8.1)과 본문을 대조하고, 오답이 왜 틀렸는지 같은 주제의 판단으로 설명할 수 있도록 범위를 제한한다.

`REWRITE_REQUIRED` 확정 항목은 없다. LEX-001의 severity와 선별 범위는 ChatGPT 최종 품질 검토에서 확인한다. 이전 #178/#185/#198 PASS 전체를 취소하지 않는다. [자동 후보](candidates.json)의 다른 항목은 검토 대기이며 이 표의 수정 지시로 간주하지 않는다.

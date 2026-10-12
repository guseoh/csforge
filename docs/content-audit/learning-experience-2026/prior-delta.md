# 이전 감사와 차이

Phase A baseline은 `d021928a...`, 이번은 `efe73a15...`다. Phase A 원본을 수정하지 않고 현재 해소 상태를 [prior-delta.json](prior-delta.json)에 기록했다.

| 기존 ID / severity | 현재 | 근거 / 해결 이력 |
| --- | --- | --- |
| CAA-PA-001 / P1 | RESOLVED | shared-memory curriculum/canonical 모두 L2. 동기화·publish·crash 설명과 q1~q3 확인. #138 / PR#139 |
| CAA-PA-002 / P1 | RESOLVED | Java의 everyConcept/minimumByDifficulty/minimumTotal/MC-first quota 제거. objective/Topic/Area 설계 규칙. PR#139 |
| CAA-PA-003 / P1 | RESOLVED | 15 YAML 모두 minimumPerConcept 없음. 기존 문제를 quota 충족 목적으로 추가하지 않음. PR#139 |
| CAA-PA-004 / P1 | RESOLVED | Curriculum Foundations README가 15개 Area authoring source 역할과 공통 계약 우선순위를 명시. PR#139 |
| CAA-PA-005 / P2 | RESOLVED | pruning 분기 제거/overlapping fib(3) 중복 호출 ASCII가 학습 목표를 직접 표현. PR#141 |
| CAA-PA-006 / P2 | RESOLVED | UDP delivery/order, ACK/retry, PKI chain, TLS handshake/termination, HTTP header/body, PUT replacement 7개 모두 기존 의미 있는 ASCII 존재. PR#141 및 #185/#198 후속 검토 |
| CAA-PA-007 / P1 | RESOLVED | authentication.q3가 비밀번호 검증 true/false→authenticated identity/SecurityContext 설치/비설치를 검증. PR#141 |

Topic134/Concept721은 같고, Question2524→2525(+1), Security73→74(+1)이다. 다른14개 Area Question 수는 동일하다. 수/type/difficulty 분포는 이전 report의 상수가 아니라 현재 source로 재계산했다. 같은3문항 형태나 정확한 난이도 개수는 그 자체로 결함이 아니다.

[PR#178~#192](external-evidence.json)는 15개 Area 전수 품질 Wave의 근거다. [PR#198](https://github.com/guseoh/csforge/pull/198)은 Network127 Concept/381 Question의 한국어 교정이며, [PR#168](https://github.com/guseoh/csforge/pull/168)은 1,159 DESCRIPTIVE/SCENARIO self-check 감사다. 해당20개 관련 PR(#137/#139/#141/#168/#178~#192/#198)의 merge commit은 모두 이번 baseline의 ancestor임을 검증했다. 과거 PR 본문의 Draft/Open 문구는 현재 상태를 나타내지 않는다.

이번 LEX-001은 두 MC 선택지의 새 직접 관찰이고 #167의 DESCRIPTIVE/SCENARIO 범위와 중복되지 않는다. LEX-004는 이미 해소된 pruning/overlapping 문제를 다시 열지 않는다. LEX-006도 해소된 인증 objective 공백과 별개의 Reference 동선 P2이다. CA order와 TLBq1, 값 전달 그림의 배치에만 국소 제안을 한다. 이전 PASS를 스타일 통일 목적의 재작성 근거로 사용하지 않는다.

현재 자동 normalized answer/explanation similarity≥0.85 후보는0이다. 이는 기존 #167의 의미 검토를 다시 수행한 수치가 아니며 self-check 품질 PASS나 새 평가 schema 필요성 판정으로 사용하지 않는다. 예컨대 TLBq1의 질문 밖512 계산은 이 신호가 발견하지 못하는 수동 P2이다.

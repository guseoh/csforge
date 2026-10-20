# Issue #201 — Computer Architecture 정밀 교정

## 2차 #201 — Computer Architecture 시작 (2026-10-20)

- 상위 Issue: [#201](https://github.com/guseoh/csforge/issues/201)
- Base main: `2911f82f702b0cc3d0482a4df473288775513566` (**OS PR #251 squash merge 완료**)
- 별도 branch: `content/issue-201-ca-corrections`
- 대상: **61 Concept / 183 Question**. OS/Java 재수정과 Production Import는 비범위.
- 근거: `docs/content-audit/learning-experience-2026/wave-3/computer-architecture.json` (10건 = P0 2/P1 5/P2 3, carried P2 2건 LEX-003/LEX-005) 및 `wave-3-findings.json`. 원본 감사 기록은 덮어쓰지 않는다.

## 첫 번째 P0 최소 교정

| Finding | 대상 | 반영 내용 |
| --- | --- | --- |
| W3-CA-002 | `datapath-control.control-unit.q3` | 정상 메모리 읽기라는 prompt 조건에서는 오류 결과를 **0x1080의 잘못된 값 로딩**으로 제한. 보호/page fault는 해당 전제를 제거했을 때의 별도 조건으로 구분 |
| W3-CA-010 | `performance.pipeline-branch-impact.q1` | B=1.2의 실제 오답 계산 경로를 `0.20 × 0.50 × 12`로 교정. 모든 분기 실패=2.4와 진짜 정답=0.12를 구분 |

위 2 Question은 `contentKey`, `questionType`, `difficulty`, `correctChoiceKey`, `conceptKeys`, 선택지 개수·키·순서를 유지하고 해설만 수정했다.

## 다음 실행 순서

1. P1 5건의 학습 흐름·주소 변환·거짓 공유·RISC-V 호출 ABI·갱신 손실 전제 검토 및 최소 수정. 하드웨어 walker와 software TLB refill은 공식 자료로 재대조.
2. 선택적 P2 3건과 carried 2건은 현재 canonical/Curriculum과 재대조하고 **교육 효과 있는 것만** 채택. 이미 고쳐진 사항을 중복 변경하지 않는다.
3. **61 Concept / 183 Question 전수 품질·정답/연결/순서·Reference/도식 리뷰**, 변경 inventory, JSON/MD 구조 검사.
4. 공식 ISA/ABI/MMU/TLB/캐시 일관성 근거 대조, 격리 PostgreSQL Preview ERROR0→Apply→exact UNCHANGED/개인 이력 불변, 최신 CI, 해당 Reader SVG 사용성.
5. ChatGPT 최종 리뷰 + 필요한 Human Usage Check 완료 전까지 **Draft / 미병합**, Production DB 변경하지 않음. OS Slice를 다시 열지 않음.

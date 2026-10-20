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


## 2차 #201 — CA 교정 및 검증 결과 (2026-10-20)

### Wave3 Finding 처리

| ID | 우선순위 | 처리 |
| --- | --- | --- |
| W3-CA-002 | P0 | 정상 메모리 읽기 전제를 유지한 잘못된 주소 `0x1080` 결과로 제한 |
| W3-CA-010 | P0 | 분기 CPI 오답 1.2의 실패율 50% 오류 계산 명시 |
| W3-CA-001 | P1 | RV64 표준 psABI의 `S → S-32 → S` 프레임 상태표와 `ra/s0` 보존·복구 코드 |
| W3-CA-004 | P1 | cache-line.q3의 심화 false-sharing Concept 직접 연결 및 해설 보강 |
| W3-CA-005 | P1 | 희소 다단계 테이블의 하위 테이블 미할당 근거를 큰 페이지와 분리 |
| W3-CA-006 | P1 | MMU, TLB, page-table-walk 세 본문에 hardware walker와 software refill 경계 |
| W3-CA-007 | P1 | lost update 전제 `x=0`과 read/add/write 교육 모델 명시 |
| W3-CA-003 | P2 | branch-prediction.q3의 중복 CPI 계산 대신 방향 적중·목적지 실패·복구 시나리오 |
| W3-CA-008 | P2 | 캐시 절충 조사 '절충으로' 교정 |
| W3-CA-009 | P2 | 트랩 권한 수준의 조사 '수준으로' 교정 |
| LEX-003 | P2 이관 | 다단계 페이지 테이블 displayOrder 60→50으로 Curriculum의 50과 일치 |
| LEX-005 | P2 이관 | tlb.q1 해설을 주소 변환·권한 캐시 본래 질문에 집중 |

원본 `docs/content-audit/learning-experience-2026/wave-3/computer-architecture.json`은 변경하지 않았다. 다른 Area와 Production DB도 변경하지 않았다.

### 검증 범위

- **전체 61 Concept**: canonical Markdown/frontmatter 61개 파일의 키·Reference 선언·코드 펜스 짝·기본 상태·주제별 정렬 구조 검사 이상 0; 본문 SVG 이미지 경로 추가 누락 없음. 최신 교정의 고위험 7개 Concept 의미·실행 상태를 직접 대조.
- **전체 183 Question**: JSON 10개 파일의 key 중복, 모든 유형별 정답·modelAnswer·explanation·객관식 61문항의 choice/rationale, 단답 14문항 acceptedAnswers 구조 검사 이상 0. 유형 MC 61/서술 49/시나리오 59/단답 14; 난도 EASY/MEDIUM/HARD 각 61.
- 질문 연결 총 **184개 모두 존재하는 Concept key**. `memory-hierarchy.cache-line.q3`의 신규 `multicore-memory.false-sharing` cross-topic 연결만 의도적으로 추가. 기존 183개 key·유형·난도·정답 키·상태·선택지 내용/순서 변경 0. 변화된 Question 7개와 Concept 7개를 중심으로 문항 전제와 실행 결과를 검토.
- 독립적인 새로운 183문항 전수 수기 재채점을 했다는 주장은 하지 않는다. 기존 Wave3 전체 감사 ledger의 Concept 61/Question 183 검토를 계승하고 이번 14건의 수정 영향 및 전체 구조 재검증을 수행했다.
- **공식 출처 대조**: [RISC-V psABI Procedure Calling Convention](https://github.com/riscv-non-isa/riscv-elf-psabi-doc/blob/master/riscv-cc.adoc)의 stack 16-byte alignment·callee-saved register, [RISC-V privileged ISA](https://docs.riscv.org/reference/isa/priv/supervisor.html)의 page-table walk 모델, [Linux MIPS TLB exception handler source](https://kernel.googlesource.com/pub/scm/linux/kernel/git/ralf/linux/+/ea0dc0dc1c1dca25e50384e300a528db57ee7de5/arch/mips/mm/tlbex.c)의 R4000 refill 경로 확인. 기존 Reference metadata는 변경하지 않음.

### 격리 PostgreSQL 실제 변경 회귀 검증

- [CA regression #39381153637](https://github.com/guseoh/csforge/actions/runs/39381153637) **historical-ca-import SUCCESS**. 실제 이전 `main 2911f82`의 13개 변경된 canonical 파일(Concept MD 7 + Question JSON 6)을 git archive로 가져왔다.
- 교정 콘텐츠로 bootstrap 완료 → 이전 snapshot의 14항목 원복 → 교정본 Preview ERROR0·Apply UPDATED14 → 동일 파일 exact reimport 112항목 UNCHANGED → 전체 canonical exact bootstrap UNCHANGED.
- 기존 `concept.id`, `question.id`, 객관식 선택지 ID와 개인 노트, 퀴즈 응답, 오답 노트, 복습 일정·이력·세션 스냅샷 불변 확인. 전부 **독립 Testcontainers PostgreSQL**, 운영 DB 수정 없음.

### 실제 Reader 검증

- [CA regression #39381633511](https://github.com/guseoh/csforge/actions/runs/39381633511) `reader-browser` **SUCCESS**: 브라우저 Chromium에서 실제 React `/concepts/:id` route에 저장소의 RISC-V 함수 호출·페이지 테이블 순회 Markdown을 주입해 **2 Concept × 라이트/다크 × 375/1280px = 8 cases PASS**.
- 코드 블록·가로 넘침·줄바꿈 토글·스택 프레임 상태표·소프트웨어 refill 설명 존재 및 JS 오류 0 확인. 실제 API 데이터는 fixture이므로 Cloud 로그인·Production DB 실사용을 검증한 것으로 주장하지 않음. Screenshot 8장 저장.
- 새 `asm` 코드 펜스가 텍스트로만 표시되는 가독성 문제를 해결하려고 공유 Reader의 언어 라벨에 `Assembly`를 최소 추가했다.

### 마무리 게이트

- [ ] 일회성 `CaCorrectionSnapshotIntegrationTest`, browser script, Workflow를 검증 증거 보존 후 PR에서 제거. 최종 Reader 어셈블리 라벨 포함 Repository Validation 최종 HEAD 통과 확인.
- [ ] 최종 PR diff·review threads·base drift 및 mergeable 재조회. 별도 사용자 승인 없이 병합하지 않음.

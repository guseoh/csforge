# Issue #222 R2 — CA UMD 브라우저 접근 게이트

기준 `main 57e6d460eca009a5bd2aaa06fd88810565e0ceb6`, 2026-10-19 KST. DSA 원 URL 본문을 실제로 읽을 수 있었던 동일 in-app browser에서 UMD canonical 8 URL을 각각 탐색했다. **8/8 `403 Forbidden` / `You don't have permission to access this resource.`** 본문만 표시되었다. PDF도 PDF viewer/도표 대신 동일 Forbidden 문서였다.

## 원 URL별 결과

| canonical URL | 관계 수 | 브라우저 결과 | 관계별 판정 |
| --- | ---: | --- | --- |
| https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html | 7 | Forbidden 본문 | 7 ACCESS_UNRESOLVED |
| https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html | 7 | Forbidden 본문 | 7 ACCESS_UNRESOLVED |
| https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html | 4 | Forbidden 본문 | 4 ACCESS_UNRESOLVED |
| https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf | 3 | Forbidden HTML, PDF 미열람 | 3 ACCESS_UNRESOLVED |
| https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html | 7 | Forbidden 본문 | 7 ACCESS_UNRESOLVED |
| https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html | 6 | Forbidden 본문 | 6 ACCESS_UNRESOLVED |
| https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html | 4 | Forbidden 본문 | 4 ACCESS_UNRESOLVED |
| https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html | 6 | Forbidden 본문 | 6 ACCESS_UNRESOLVED |
| **전체** | **44** | **8/8 접근 제한 재현** | **직접 검증 0, 보류 44** |

관계 identity와 학습 범위는 [기존 44관계 추적표](umd-44-relationship-review.md#44관계-원본-추적)의 **각 contentKey×URL 행**에 위 원 URL별 이번 브라우저 결과를 대응한다. 학습 적합성·출판 버전·도표의 정확성을 이번 원본에서 확인할 수 없었다. 선행 기록의 Linux/RISC-V/다른 UMD 강의는 별도 URL의 보조 근거이며 44개 원본을 검증한 근거가 아니다. 원본을 읽지 못한 상태에서 전역 title/recommendation이나 본문을 추정 교정하지 않는다.

## 결정과 남은 조건

- canonical/Question/identity/metadata 변경 0, 확인된 404 0, 확인된 자료 결함 0. 403만으로 일괄 교체하지 않는다. 현대 ISA ordering·JMM과 옛 MIPS 강의, false sharing·Linux page table 구현을 혼합하지 않는 선행 범위 제한을 유지한다.
- **CA 잔여 44관계 해결 완료 아님**. 원본 본문/PDF를 읽을 수 있는 환경 또는 소유자가 제공하는 검증 가능한 공식 원본이 있어야 학습 적합성·버전 판정을 마칠 수 있다. 접근 제어를 우회하지 않는다.
- 기존 #233 IEEE / #234 JMH는 이미 main에 병합되었으므로 재작업하지 않는다. #240의 대표 URL 접근 기록과 이번 실제 브라우저 8 URL 전수 결과를 구분한다.
- 감사 전용으로 신규 Import Apply/idempotency·Reader UI 회귀 검증 해당 없음. 이번 브라우저 외부 접근 확인을 Reader UI QA PASS라고 표시하지 않는다. main reconcile 15 Area/721 Concept/1,042관계/622 URL 및 17 verified/131 pending 불변.
- 사용자 검토/승인 전 병합하지 않는다. Production DB/Import/수동 배포/Issue 종료 없음. 다음 독립 단계는 OS 14관계다.

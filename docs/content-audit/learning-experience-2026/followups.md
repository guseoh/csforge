# 후속 Issue 권장 범위

확정 수정 scope와 검토 대기 scope를 구분한다. `NEEDS_REVIEW`는 자동 작성 backlog가 아니다. 각 후속 Issue는 현재 main/이전 Wave와 대조해 검토한 후, 필요한 파일만 최소 변경한다. 이번 Issue에서는 후속 구현·새 Issue 생성·Import·이미지 생성을 하지 않는다.

| Issue | 선별 수정 제안 | 검토 대기 및 제외 |
| --- | --- | --- |
| [#201](https://github.com/guseoh/csforge/issues/201) Java·OS·CA | LEX-001 CASq2 선택지 B/C(P1), LEX-002 기존 pass-by-value SVG 경로(P2), LEX-003 multi-level-page-table order 정합(P2), LEX-005 TLBq1 설명 범위(P2) | 기존 OS shared-memory L2 수정/이미지 재생성 반복 금지. HashMap/JVM/GC/JMM·프로세스/스레드·Cache/Pipeline 전체 의미·primary source 검토 대기 |
| [#202](https://github.com/guseoh/csforge/issues/202) Network·DB·DSA | LEX-001 trusted-proxy-boundary.q1 D 선택지(P1), LEX-004 DP initialization-order/space-optimization의 작은 상태 trace(P2) | 기존9개 P2 도식은 해소, 새 이미지 대량 생성 금지. DB/tls reviewed samples 유지. 구조·정렬·탐색·HTTP/TCP 전체의 source/Question 재검토 대기 |
| [#203](https://github.com/guseoh/csforge/issues/203) Spring·Backend·Security | 이번 감사에서 필수 본문 rewrite 확정 없음. LEX-006과 관련 인증 흐름 source 정밀 확인은 #222와 중복 소유하지 않음 | 이미 고친 authentication.q3/ConfigurationProperties/rollback·proxy 내용 재구현 금지. 소스/남은 Question/설명 경계 전수 검토 뒤 실제 target만 선택 |
| [#204](https://github.com/guseoh/csforge/issues/204) 소형6 Area | 이번 직접 샘플에서는 core state/failure 설명의 P0/P1 발견 없음. Area 전수 PASS는 미선언 | Cache fill race, broker vs DB commit, resource request/limit, queue law, quorum/fencing, sync/async 상태가 기존에 있음. 각각9 Concept/27 Question, 합54/162를 source와 재대조하고 target 확정 |
| [#205](https://github.com/guseoh/csforge/issues/205) Cache·Messaging 확장 | 확장 Concept 확정 없음 | 현재 objective coverage/동작 경계의 추가 의미 검토 후 실제 새 학습 목표 필요성을 결정. Concept 수/난이도 quota 충족 금지 |
| [#206](https://github.com/guseoh/csforge/issues/206) Infrastructure·Performance 확장 | 확장 Concept 확정 없음 | 기존 request/limit/JVM memory, Little law·cardinality·SLO/incident 내용을 먼저 검토. 현재9개가 작다는 이유만으로 확장하지 않음 |
| [#207](https://github.com/guseoh/csforge/issues/207) Distributed·System Design 확장 | 확장 Concept 확정 없음 | 기존 clocks/partial failure/replication/quorum/leader/lease/saga/CAP와 설계 요구/경계를 보존. Dynamo/Chubby primary와 남은 objectives의 부족을 확인한 뒤 curriculum delta 선정 |
| [#222](https://github.com/guseoh/csforge/issues/222) Reference 이용성 | LEX-006 overview→provider→form success 처리 절의 직접 학습 동선(P2) | 이번 제안은 source 관계의 직접성이다. UI/API 기능 추가는 #222의 별도 승인 scope에서 판단. 다른606+ 미확인URL을 broken 목록으로 변환하거나 metadata 일괄 교체하지 않음 |

ChatGPT gate는 P1 두 문항과 P2 선별의 타당성·severity, KEEP8의 본문/문제/출처 근거, `NEEDS_REVIEW` 처리의 정직성, 해결된 Phase A 지적 재작업 여부를 확인한다. 이후 Area별 전수 검토·최소 수정·Import preview/error0/exact idempotency·history 보존·human learning QA는 해당 후속 Issue에서 수행한다. 이 감사 PR의 merge는 별도 명시 승인 전 수행하지 않는다.

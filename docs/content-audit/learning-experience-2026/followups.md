# 후속 Issue 권장 범위

확정 수정 scope와 검토 대기 scope를 구분한다. `NEEDS_REVIEW`는 자동 작성 backlog가 아니다. 각 후속 Issue는 현재 main/이전 Wave와 대조해 검토한 후, 필요한 파일만 최소 변경한다. 이번 Issue에서는 후속 구현·새 Issue 생성·Import·이미지 생성을 하지 않는다.

| Issue | 선별 수정 제안 | 검토 대기 및 제외 |
| --- | --- | --- |
| [#201](https://github.com/guseoh/csforge/issues/201) Java·OS·CA | LEX-001 CASq2 선택지 B/C(P1), LEX-002 기존 pass-by-value SVG 경로(P2), LEX-003 multi-level-page-table order 정합(P2), LEX-005 TLBq1 설명 범위(P2) | 기존 OS shared-memory L2 수정/이미지 재생성 반복 금지. HashMap/JVM/GC/JMM·프로세스/스레드·Cache/Pipeline 전체 의미·primary source 검토 대기 |
| [#202](https://github.com/guseoh/csforge/issues/202) Network·DB·DSA | LEX-001 trusted-proxy-boundary.q1 D 선택지(P1), LEX-004 DP initialization-order/space-optimization의 작은 상태 trace(P2) | 기존9개 P2 도식은 해소, 새 이미지 대량 생성 금지. DB/tls reviewed samples 유지. 구조·정렬·탐색·HTTP/TCP 전체의 source/Question 재검토 대기 |
| [#203](https://github.com/guseoh/csforge/issues/203) Spring·Backend·Security | 이번 감사에서 필수 본문 rewrite 확정 없음. LEX-006과 관련 인증 흐름 source 정밀 확인은 #222와 중복 소유하지 않음 | 이미 고친 authentication.q3/ConfigurationProperties/rollback·proxy 내용 재구현 금지. 소스/남은 Question/설명 경계 전수 검토 뒤 실제 target만 선택 |
| [#204](https://github.com/guseoh/csforge/issues/204) 소형6 Area | Wave 1 전수54/162에서 W1-CACHE-001~002, MSG-001~002, INFRA-001~004, PERF-001, DS-001, SYS-001~002: 11 Concept / 9 Question 정밀 보강. P0 ordering.q1 단일 정답부터 수정 | [정확한 key·경로·최소 변경](wave-1/README.md). 기존 충분한 설명/ASCII/문항은 유지. 새 Concept·수량 quota·전체 rewrite 근거 없음. 이번 완료는 감사 완료이며 수정 구현은 제외 |
| [#205](https://github.com/guseoh/csforge/issues/205) Cache·Messaging 확장 | 확장 Concept 확정 없음 | 현재 objective coverage/동작 경계의 추가 의미 검토 후 실제 새 학습 목표 필요성을 결정. Concept 수/난이도 quota 충족 금지 |
| [#206](https://github.com/guseoh/csforge/issues/206) Infrastructure·Performance 확장 | 확장 Concept 확정 없음 | 기존 request/limit/JVM memory, Little law·cardinality·SLO/incident 내용을 먼저 검토. 현재9개가 작다는 이유만으로 확장하지 않음 |
| [#207](https://github.com/guseoh/csforge/issues/207) Distributed·System Design 확장 | 확장 Concept 확정 없음 | 기존 clocks/partial failure/replication/quorum/leader/lease/saga/CAP와 설계 요구/경계를 보존. Dynamo/Chubby primary와 남은 objectives의 부족을 확인한 뒤 curriculum delta 선정 |
| [#222](https://github.com/guseoh/csforge/issues/222) Reference 이용성 | LEX-006 overview→provider→form success 처리 절의 직접 학습 동선(P2), Wave 1의 접근 미완료4 URL·구체 절 안내 | source 관계의 직접성이다. UI/API 기능 추가는 #222의 별도 scope에서 판단. 미확인 URL을 broken 목록으로 변환하거나 metadata 일괄 교체하지 않음 |

Wave 1의 NIST superseded Reference 수정은 #204의 본문 출처 변경으로, 접근 미완료 LINE/Kakao/Princeton/ACM 4 URL의 동선 재확인은 #222와 조정한다. #205~#207 확장 scope는 여전히 미확정이다. 이번 근거만으로 신규 학습 목표나 기능을 만들지 않는다.

ChatGPT gate는 새 P0 복수 정답과 P1 조건 누락, P2 보강 필요성·severity, CURRENT_VERIFIED와 품질 KEEP의 분리, Reference 접근 한계 및 초기 근거 보존을 확인한다. 이후 최소 수정·history 보존·human learning QA는 해당 후속 Issue에서 수행한다. 이 감사 PR을 병합하지 않는다.

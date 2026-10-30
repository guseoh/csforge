# Issue #222 R2 — Network & HTTP 잔여 1관계 직접 검토

기준 `main 57e6d460eca009a5bd2aaa06fd88810565e0ceb6`, 2026-10-19 KST.

관계는 `network-http.core.http-cache.intermediary-cache` × https://tech.kakao.com/posts/345 다. 실제 in-app browser에서 제목·날짜뿐 아니라 **Overview / 저장 구조 / Wcache의 분산 구성 / 결론** 원문을 직접 읽었다. 제목 **분산 웹 캐시 (Wcache)의 개선과정 - Part 1**, 작성일 **2017-10-23**이 현행 title과 일치한다. 이전 웹 도구의 shell/색인만 확인한 기록과 이번 직접 본문 성공을 구분한다.

## 관계 판정: KEEP / DIRECT_CONTENT_VERIFIED

- 저장 구조: BigFile/block 쓰기, SQLite metadata, 메모리 LRU hash table과 disk 접근 차이가 현행 recommendation의 저장 구조에 해당한다.
- 분산 구성: round robin 배치의 중복 저장 → consistent hashing의 분산 → hot item 집중 → 1차 SSD·2차 HDD의 계층 분리라는 원인·결과를 읽었다. 현행 relationNote의 **적중률·인기 항목·계층 분리와 운영 절충**이 그 내용과 직접 대응한다.
- 이 자료는 HTTP 중간 캐시의 운영 사례다. `Vary`/신선도/재검증·인증 응답 재사용 등 프로토콜의 보장 근거는 Concept의 **RFC 9111**이다. Wcache 저장 엔진/라우팅 구현을 HTTP 캐시 전체의 필수 설계로 확대하지 않는다.
- 결론의 TPS/95% hit 수치는 **2017년 글에 적힌 당시 사례**로만 취급한다. 현재 카카오 서비스 성능을 새로 측정한 근거가 아니다. Part 2를 읽지 않았으며 Part 1 검증 결과를 그 URL로 전파하지 않는다.

## 변경·검증·완료 경계

새 Reference 결함 0, canonical 교정 0. 기존 Concept/Question identity, URL·title·전역 metadata 및 recommendation/relationNote 유지. R1/R3 및 #229의 쿠키 교정은 재작업하지 않는다.

감사 문서만 변경하므로 신규 Import Apply/idempotency·Reader UI 회귀 검증 해당 없음. 이번 외부 브라우저 열람을 CSForge Reader UI full QA라고 기록하지 않는다. `git diff --check`와 현재 `(contentKey, URL)` identity를 확인한다. PR HEAD Repository Validation은 별도 확인한다.

이번 직접 확인 제안 1관계는 최종 reconcile에서만 기존 ledger에 합산하며, 독립 Draft 생성만으로 main의 17 verified/131 pending이 변경되었다고 보고하지 않는다. 사용자 검토/승인 전 병합 금지, Production DB/Import/수동 배포/Issue 종료 없음.

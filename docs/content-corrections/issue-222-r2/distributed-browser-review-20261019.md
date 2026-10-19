# Issue #222 R2 — Distributed Systems 원 URL 2관계 검토

기준 `main 57e6d460eca009a5bd2aaa06fd88810565e0ceb6`, 2026-10-19 KST. 이전 [접근 보류 기록](os-distributed-network-followup.md#2-distributed-systems-원래-2관계--논문의-실재-및-작성자-원고는-확인-원-url-접근은-보류)을 실제 브라우저 및 공식 PDF와 대조했다. canonical·Question·전역 metadata 변경은 없다.

## 1. Saga — KEEP / DIRECT_CONTENT_VERIFIED

- 관계: `distributed.core.coordination.saga-compensation` × https://www.cs.princeton.edu/research/techreps/598 .
- 실제 브라우저에서 **SAGAS**, Garcia-Molina/Salem, **TR-070-87**, 20 pages, Abstract와 공식 PDF 링크를 확인했다. 원 페이지의 Date 표시는 `1987-01-00`이지만 PDF 자체의 날짜는 **January 7, 1987**이다. 웹 도구의 과거 403과 이번 브라우저 성공을 구분한다.
- 원 페이지가 연결하는 https://www.cs.princeton.edu/techreports/1987/070.pdf 는 웹 PDF 조회 도구에서는 403이었으나 공개 HTTP 다운로드가 성공했다. **20쪽 스캔 PDF**이므로 pypdf의 빈 추출 결과를 읽기 성공으로 간주하지 않고, bundled pypdfium2로 PDF pp.1–5를 렌더링한 뒤 **Abstract와 본문 인쇄쪽 1–3(파일 pp.3–5)**를 육안으로 읽었다.
- 실제 확인한 §1 Introduction: LLT가 자원을 오래 점유하는 문제, 다른 트랜잭션과 interleave되는 부분 트랜잭션, 항공 예약·취소 사례, `T1...Tn` 또는 `T1...Tj,Cj...C1` 실행. 보상은 **semantic undo이며 시작 전 DB 상태를 반드시 복원하지 않는다**. 그 사이 다른 트랜잭션이 바꾼 좌석 수를 단순 덮어쓰면 안 된다는 설명이 현행 Concept의 물리적 rollback/업무 보상 구분과 직접 맞는다.
- 적용 한계: 1987년 원 모델과 현대 microservice의 orchestration/choreography·outbox·idempotency 운영 정책을 동일한 논문 계약으로 보지 않는다. 그런 내용은 Concept의 다른 자료 및 설계 책임이다. 현행 원 모델 안내를 KEEP하며 논문 전문을 전부 검증했다고 주장하지 않는다.

## 2. CAP — KEEP_PENDING_ACCESS / ORIGINAL_FULLTEXT_UNRESOLVED

- 관계: `distributed.core.coordination.cap-tradeoffs` × https://dl.acm.org/doi/10.1145/564585.564601 .
- 실제 브라우저에서 정확한 논문 제목·저자 Gilbert/Lynch, **SIGACT News 33(2), pp.51–59, 2002-06-01**, DOI와 Abstract를 직접 읽었다. **이번에는 canonical landing page가 403이 아니다.** 색인 조회만의 결과도 아니다.
- 페이지는 `ARTICLE FREE ACCESS`와 **View online with eReader** 링크를 제공한다. 필요한 쿠키만 선택하고 소개 modal을 닫은 뒤 그 실제 링크 `https://dl.acm.org/doi/epdf/10.1145/564585.564601`로 이동했지만 **Reader environment loading**만 표시되었다. 관련 정의·정리 본문을 읽지 못했으므로 원 URL을 DIRECT_CONTENT_VERIFIED로 승격하지 않는다. 유료 Premium 안내가 있으나 그것만으로 논문 paywall이라고 단정하지 않는다.
- Abstract의 비동기 모델 불가능성/부분 동기 모델 논의는 주제에 맞는다. 그러나 이번 원 ACM 경로에서는 atomic/available/partition의 정확한 정의를 전문으로 확인하지 못했다. 기존 MIT 저자 원고의 §2.1–2.3/§3.1 직접 확인은 [선행 기록](os-distributed-network-followup.md)에 있으며 별도 증거로 유지한다.
- Concept의 linearizability·정상 노드의 요청 종료·네트워크 분할 중 양 보장 불가라는 안내와 서지/초록의 충돌은 없다. DOI가 틀리거나 자료가 사라졌다는 결론도 없다. **보류 1관계**로 남기고 URL을 추정 대체하지 않는다.

## 단계 결과와 검증

| 대상 | 신규 직접 관련 절 확인 | 본문 게이트 보류 | canonical 교정 |
| --- | ---: | ---: | ---: |
| Saga / CAP 2관계 | 1 | 1 | 0 |

감사 전용으로 신규 Import Apply/idempotency·Reader UI 회귀 검증은 해당 없음. 외부 사이트의 eReader 시도는 CSForge Reader full QA가 아니다. `git diff --check` 및 관계 identity 2건을 확인한다. main 기존 verified 17/pending 131은 이 독립 Draft로 변경되지 않으며 최종 reconcile에서 제안 1건만 통합한다. 사용자 검토/승인 전 병합 금지, Production DB/Import/수동 배포/Issue 종료 없음. 다음 단계는 Network & HTTP 1관계다.

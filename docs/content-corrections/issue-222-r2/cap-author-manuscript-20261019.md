# Issue #222 R2 — CAP 학습 자료 보완

기준 main `e0dbadfbf0691e079b8d2e20d623aceb8bad5103`. UMD #247과 독립된 main 기반 Draft이다. 기존 103개 검증 관계를 재감사하거나 변경하지 않는다.

## 관계별 결정과 버전

| 관계 | 결정 | 실제 확인 범위 / 남은 한계 |
|---|---|---|
| `distributed.core.coordination.cap-tradeoffs` → [ACM DOI](https://dl.acm.org/doi/10.1145/564585.564601) | KEEP_BIBLIOGRAPHY / CONTENT_ACCESS_UNRESOLVED | 실제 브라우저에서 제목·Seth Gilbert/Nancy Lynch·ACM SIGACT News 33(2)·2002-06-01·pp. 51–59·동일 abstract 확인. PDF/eReader는 로딩 단계, 실제 Download PDF 경로의 GET은 403. 출판본 전문 DIRECT_CONTENT_VERIFIED로 승격하지 않는다. |
| 같은 Concept → [MIT 저자 원고](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer6.pdf) | ADD / DIRECT_CONTENT_VERIFIED | [Nancy Lynch 공식 논문 목록](https://groups.csail.mit.edu/tds/lynch-pubs.html)의 2002년 동일 논문 항목의 `.pdf`가 이 URL로 직접 연결된다. 13쪽 PDF를 GET으로 받고 §2.1–2.3·§3.1을 읽고 pp. 3–4를 렌더링해 확인했다. |
| 같은 Concept → 기존 etcd failure modes | PRESERVE | URL·metadata·displayOrder·relationNote 그대로 보존. 이번 보완의 직접 검증 대상으로 재집계하지 않는다. |

ACM 권호/출판일은 출판 페이지 기준이다. MIT 논문 목록의 페이지 표기 `48–51`은 ACM의 `51–59`와 다르므로 복제하지 않는다. MIT 제공 파일의 PDF metadata 생성·수정일은 2019-05-14이고 서버 수정 시각도 서지 출판일이 아니다. 파일명의 `6`을 판번호로 해석하거나 최신/최종 accepted version이라고 이름 붙이지 않는다. 저자·제목·논문 목록의 직접 연결로 출판 관계는 확인되지만 **ACM 최종 판면과 문구의 동등성은 미확인**이다.

원고 파일 SHA-256: `4b41927d8e4981d22e0484331b2f2d5d4ac86b268a9fbf62e092227f41fcd3df` (13쪽). 원고 PDF를 저장소에 복제하지 않고 검증한 URL과 checksum만 기록한다.

## 기술적 대조와 최소 변경

§2.1의 consistency는 linearizability이다. §2.2는 실패하지 않은 노드의 모든 요청이 결국 응답해야 하지만 시간 상한은 두지 않는다. §2.3은 임의의 메시지 손실을 모델링한다. §3.1의 정리는 그러한 실행을 포함하는 비동기 read/write 객체에 관한 것이다. 기존 Concept의 정의·분할 중 절충·정상 상태 비용과의 구분에 교정할 결함은 확인하지 못했으므로 **본문·Question·identity는 그대로 유지**한다.

원고에 접근할 수 있다는 사실을 ACM 전문을 읽었다는 근거로 쓰지 않는다. DOI relationNote는 서지 역할/접근 한계를 명시하고 MIT 관계를 order 3으로 추가한다. 기존 DOI/etcd order 1/2와 공유 metadata를 보존한다. MIT recommendation은 전역 자료 소개, relationNote는 직접 읽을 절과 버전 경계로 분리한다.

ledger에는 직접 읽은 MIT 관계 1건만 추가하며 `supplementsUrl`로 원 DOI를 추적한다. 이 독립 브랜치의 수치는 **104 verified / 기존 원문 45 pending**(UMD 44 + ACM 1)이다. UMD #247과 결합하면 **148 verified / ACM 전문 1 pending**이며 45개 학습 목적에 읽을 자료가 생긴다. `148/0` 또는 원 URL 45건 VERIFIED라고 표시하지 않는다.

## 검증과 미해결 후속 조치

- `reconcile.py`: PASS. 독립 브랜치 15 Area / 721 Concept / 1,043 relations / 623 URLs / metadata·관계·표시 순서 중복 0. 기존 103행 동일, 직접 검증 MIT 1행 추가; 원 ACM pending 유지.
- `gradlew.bat test --tests com.guseoh.csforge.importcontent.CapAuthorManuscriptIntegrationTest --console=plain`: PASS (1 test, failures/errors/skipped 0). Windows CRLF 처리만 테스트에서 정규화한 뒤 재실행 성공. Preview/Apply updated=1/errors=0, 반복 Preview unchanged=1, full exact reimport unchanged=3,380/errors=failed=0. Concept/Question ID·Reference ID·개인 노트·학습 상태 보존.
- 실제 HTTP Import도 별도 DB `csforge-r2-reader-cap`(:15483), backend :18083에서 검증. 기존 2관계 복원 → corrected 3관계 Preview/Apply 각각 updated=1/errors=0. 이미 심어 둔 personal_note, quiz_session, attempt, wrong_note, review_schedule, review_history, concept_progress 데이터와 721 Concept/2,525 Question ID가 모두 동일. exact bootstrap unchanged=3,380.
- Reader :15174, 1280×720, light/dark에서 DOI·etcd·MIT 3관계, 서지/학습 범위·장문 제목 줄바꿈, Tab으로 MIT까지 진입, `_blank`/`noopener noreferrer`, 가로 넘침 없음 확인. 다른 viewport를 검증했다고 주장하지 않는다.
- Concept 본문과 Reference 외 frontmatter, DOI 공유 metadata, etcd 관계, 기존 ledger 103행 보존 검사 및 `git diff --check`: PASS.
- 최종 HEAD Repository Validation 실행 결과·URL은 PR 설명에 기록한다.

남은 1건은 ACM 출판본 전문 직접 접근 및 MIT 원고와의 문구/판면 비교이다. 공식 Download PDF/eReader가 실제 PDF를 제공하는 환경에서 출판본을 확보하고 정의·Theorem 1을 비교해야 한다. 403은 broken 판정이 아니다. 학습자는 지금 연결한 MIT 원고로 정의·증명을 읽을 수 있다.

Draft 유지. ChatGPT 전체 리뷰·사용자 승인 전 병합 금지. Production Import·수동 배포·Issue #222 종료 없음.

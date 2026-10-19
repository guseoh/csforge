# Issue #222 R2 — 순차 후속 검토 및 완료 판단 자료

기준 `main 57e6d460eca009a5bd2aaa06fd88810565e0ceb6`, 2026-10-19 KST. 원격 main을 재조회해 동일 SHA임을 확인했다. 이번 순서는 **DSA → Computer Architecture → Operating Systems → Distributed Systems → Network & HTTP**다. 독립 Draft PR은 서로의 병합을 전제로 하지 않으며 모두 최신 main에서 분기했다.

## 선행 상태와 중복 방지

- [#240](https://github.com/guseoh/csforge/pull/240): Draft·미병합, HEAD `36ea1a64a2c6e5d8c4927417e8023b08edd27be8`, [Repository Validation #39191034085](https://github.com/guseoh/csforge/actions/runs/39191034085) **completed/success** 확인. 저자 GitHub 구현 보조 검증을 canonical Princeton HTML 성공으로 취급하지 않는 경계를 유지했다. 새 DSA PR은 실제 원 URL 브라우저 본문 게이트를 다룬다.
- 기존 R2 #227/#229/#230/#231/#232/#233/#234/#235/#237/#238/#239의 main 병합 이력을 확인했다. #232 여섯 DSA 안내, #231 OSTEP 범위 한정, #239 io_uring 보류/cgroups v1 안내는 유효하여 재수정하지 않았다.
- R1 #225와 R3 #236은 재작업하지 않았다. 이번에 새 canonical P0/P1 교정 사유는 확인하지 못했고 감사·근거 ledger만 변경한다. 외부 원문 전체의 무오류 인증과 관련 절의 직접 열람은 서로 다른 주장이다.

## 단계별 결과와 CI 추적

| 단계 | Draft PR / 불변 evidence commit | 새 직접 관련 절 확인 | 보류 | 정규 Repository Validation |
| --- | --- | ---: | ---: | --- |
| DSA | [#241](https://github.com/guseoh/csforge/pull/241) / `b687307f` | 70 | 0 | [#39192401273](https://github.com/guseoh/csforge/actions/runs/39192401273), SUCCESS 확인 |
| CA UMD | [#242](https://github.com/guseoh/csforge/pull/242) / `7c88ccc` | 0 | 44 | [#39192496368](https://github.com/guseoh/csforge/actions/runs/39192496368), SUCCESS 확인 |
| OS | [#243](https://github.com/guseoh/csforge/pull/243) / `f5dcbbd8af11cba88f8e6b2e8c68bce83ec0b26a` | 14 | 0 | [#39194703061](https://github.com/guseoh/csforge/actions/runs/39194703061), SUCCESS 확인 |
| Distributed | [#244](https://github.com/guseoh/csforge/pull/244) / `076dc22b` | 1 Saga | 1 CAP | [#39193091577](https://github.com/guseoh/csforge/actions/runs/39193091577), 최종 결과는 PR checks 참조 |
| Network | [#245](https://github.com/guseoh/csforge/pull/245) / `78a24a7e` | 1 | 0 | [#39193168933](https://github.com/guseoh/csforge/actions/runs/39193168933), 최종 결과는 PR checks 참조 |
| **이번 잔여 대상** | **131관계** | **86** | **45** | 최종 reconcile PR checks도 별도 확인 |

각 단계 문서에 원 URL, 관계 identity, 실제 읽은 절, 적용 버전 및 추천에서 제외한 범위를 기록했다. CA는 기존 44관계 추적표에 원 URL 8개 각각의 실제 브라우저 Forbidden 결과를 대응하며 원문을 읽은 것으로 처리하지 않는다. Distributed는 Saga의 연결 공식 스캔 PDF 본문을 직접 렌더링하여 읽었지만 CAP의 ACM eReader 로딩 실패는 별도 보류한다.

이 PR의 `verified-relations.json`은 **기존 17행을 그대로 보존하고 위 86행만 추가**한다. 각 새 행의 `evidenceDocument`는 해당 독립 PR의 **전체 commit SHA로 고정한 GitHub blob URL**이다. 따라서 근거 PR이 아직 main에 없더라도 판정 근거를 추적할 수 있고 같은 파일을 중복 cherry-pick하지 않는다. 독립 근거 PR들이 모두 승인되었다는 뜻은 아니다.

## 실제 로컬 reconcile 결과

기존 검증기를 수정하지 않고 다음 명령을 실행했다.

```powershell
python docs/content-corrections/issue-222-r2/reconcile.py --out .tmp-r2-final-report.json
git diff --check
```

| 검사 | main 기준 | 이번 ledger 제안 |
| --- | ---: | ---: |
| LearningArea / Concept | 15 / 721 | 15 / 721 |
| Reference 관계 / 고유 URL | 1,042 / 622 | 1,042 / 622 |
| 전역 metadata 충돌 | 0 | 0 |
| Concept 내 URL 중복 / displayOrder 중복 | 0 / 0 | 0 / 0 |
| 수동 원문 관련 절 확인 KEEP | 17 | **103** |
| 비Java 역사적 후속 후보 | 131 | **45** |

추가 검증으로 새 판정의 `(contentKey, URL)` 86개가 현행 canonical의 실제 미확정 관계와 정확히 일치하는지, 기존 17개/중복 identity가 보존되는지 검사했다. DSA 표 70행·OS 표 14행을 원 URL에 대응하고 Saga/Network 각 1행만 더했으며 **CAP/UMD 및 Java R1 관계의 무단 승격은 없다**. 기존 Wave1~4 원본 기록과 canonical 전체는 그대로다. `historicalFlaggedRelations=163`은 과거 flag 수이므로 이번 수동 판정 후에도 그대로이며, 이를 잔여 45와 혼동하지 않는다.

Import payload/Reader/API/DB schema/프로덕션 Java 코드는 변경하지 않았다. 따라서 **신규 Apply·exact reimport·history-preservation·Reader UI 회귀 QA는 해당 없음**으로 분류하며 실행한 것처럼 표시하지 않는다. 실제 외부 원문 브라우저/PDF 열람은 수행했으나 CSForge Reader의 viewport·theme·keyboard UI QA와는 별개다. 선행 콘텐츠 교정의 격리 Import/Reader 검증 결과는 기존 #235/#239 근거에 있으며 재실행하지 않는다. 이번 정규 CI는 저장소 기존 backend tests/build·frontend lint/tests/build·Compose 검증을 실행한다.

## 미해결 45관계와 #222 완료 판단

1. **Computer Architecture UMD 44관계 / 8 URL:** 실제 브라우저에서도 모두 Forbidden. 7 HTML·1 PDF의 본문·버전·관련 도표를 직접 검증하지 못했다. 정확한 관계 목록은 main의 [44관계 추적표](umd-44-relationship-review.md#44관계-원본-추적), 새 관측은 #242다. 403은 404/죽은 링크/자료 오류가 아니다. 접근 가능한 정당한 원본 경로 또는 자료 소유자의 공식 제공본이 필요하다.
2. **Distributed CAP 1관계:** `distributed.core.coordination.cap-tradeoffs` × `https://dl.acm.org/doi/10.1145/564585.564601`. 원 페이지의 서지·초록은 직접 열리지만 연결 eReader는 `Reader environment loading`만 보여 정의/정리 본문을 읽지 못했다. 기존 MIT 저자 원고 증거를 ACM URL 직접 성공으로 바꾸지 않는다. 원 ACM 본문을 읽을 수 있는 정상 경로가 필요하다.

따라서 **요청 순서의 후속 검토와 근거 PR 작성은 마쳤지만 R2 완료 판정은 보류**한다. 103/45는 이 Draft ledger의 검증 결과이며 **미병합 main은 여전히 17/131**이다. 남은 45개를 오류 건수로 표현하지 않는다. #222는 Open 유지, 사용자가 완료/종료 여부를 판단할 자료만 제공한다.

모든 새 PR 및 #240은 Draft·미병합으로 유지한다. 감사 전용 PR도 임의 병합하지 않는다. 이후 Content Pack 교정이 필요해지면 ChatGPT 전체 품질 리뷰·사용자 승인 및 해당 Import/Reader 검증을 별도로 완료해야 한다. 이번 작업에서 Production DB 변경·Import·수동 배포는 수행하지 않았다.

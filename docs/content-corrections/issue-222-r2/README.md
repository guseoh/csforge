# Issue #222 — R2 과거 Reference 감사 ↔ 최신 canonical 대조

기준 `main`: `2862a92d9208153678f3b618df90fafe37cb2e09` (R1 #225 병합 후).

목표는 Wave 1~4에서 이미 검토한 자료를 다시 처음부터 심사하지 않고, 현재 canonical의 Reference와 **관계별로** 대응해 남아 있는 검토 범위만 식별하는 것이다.

## 검증 구분

- 과거 Wave 1~3의 `sources`에는 Area 내 **URL 단위** 상태가 포함되며 같은 URL이 여러 Concept에서 쓰인다는 이유만으로 모든 관계를 직접 검증 완료로 승격하지 않는다.
- Wave 3 `wave-3-reference-issues.json`은 일부 기존 미확정/접근 상태를 가진 관계의 스냅샷이다. 전체 Reference 목록이 아니며 **현시점 미확정 전부로 해석하지 않는다**.
- Java Wave 4 `reference-relations.json`은 과거 원본 근거다. PR #225 R1에서 보완·삭제·한정 판정했고 원본 기록을 덮어쓰지 않는다.
- 개별 외부 페이지 직접 열람과 검색 색인, 브라우저 접근/HTTP status는 검증 수준이 다르다. 외부 접근 실패만으로 dead link라 단정하지 않는다.
- 본 reconcile 결과의 `historicalFlaggedRelations`는 **재검토 후보**이지 자동 오류 수/품질 FAIL 수가 아니다.

## 실행

```bash
python -m pip install pyyaml
python docs/content-corrections/issue-222-r2/reconcile.py --out /tmp/csforge-r2-reference-report.json
```

현재 15 Area, 721 Concept의 Markdown frontmatter를 모두 읽고 Concept별 중복 URL, displayOrder 중복, 동일 URL의 전역 메타데이터 충돌을 검사한다. 출력 JSON은 **현재 Reference 전체 관계**와 4개 Wave의 교차 기록 및 Area별 요약을 포함한다. CI에 연결할 경우 일회성 workflow는 검증 후 삭제한다.

## 현재 직접 확인한 교정 후보

1. **#226** Infrastructure & Cloud `backup-restore`: NIST SP 800-34 Rev1 `/r1/final` 2010-11-11 Withdrawn → `/r1/upd1/final` 공식 개정판 교체.
2. **#227** Security `user-details`: 제목은 UserDetailsService이나 실제 URL은 UserDetails 페이지였으므로 공식 `user-details-service.html`로 교정.

둘 다 독립 Draft Content Pack이며 실제 Import/idempotency/Human Usage 최종 검증 전에는 병합하지 않는다.

## R2 이후 범위

Wave 1~4의 과거 미확정 데이터와 최근 수정 사항을 대조해 사라진 관계와 여전히 미확정인 관계를 구분하고, **실제 결함**이 발견된 Area만 최소 Content Pack PR로 교정한다. 별도 승인 없이는 merge, Production Import, 배포하지 않는다. 전체 #222에는 R3 Reader UX도 별도로 남아 있다.

## 실행 완료 집계 · 2026-10-17

[GitHub Actions #38992591096](https://github.com/guseoh/csforge/actions/runs/38992591096)에서 전체 721 Concept/1,038 관계/621 URL을 실제로 읽어 전역 metadata 충돌 0, 같은 Concept URL 중복 0, displayOrder 중복 0을 검증했고 **CI SUCCESS**. 전체 JSON은 Actions Artifact `csforge-r2-reference-gap-report`로 보존.

과거 대조 후보 **168관계** 중 **Java R1에서 검토했던 15관계**는 재심사 대상으로 취급하지 않는다. 초기 비Java 후보는 **153관계**. 이후 `verified-relations.json`의 5개 관계는 공식/원문과 실제 Concept를 다시 대조한 **독립 후속 판정**이며, 과거 감사 원본은 수정하지 않았다. 이 5개를 제외하면 **비Java 미해결 후보 148관계**다. 이 수는 오류 개수가 아니며 구체적 URL 접근/개념 의미 검수 대기 숫자다.

이번 재검토에서 URL은 그대로 KEEP으로 판정한 5개는 다음이다.

| Concept | 외부 자료 | 확인된 적용 범위 |
|---|---|---|
| `backend.core.concurrency-transaction.optimistic` | Jakarta Persistence 3.2 `@Version` | 표준 optimistic conflict 감지. 재시도 정책 보장은 별개 |
| `spring.core.data-jpa.entity-lifecycle` | Jakarta Persistence 3.2 Spec | 영속성 컨텍스트/Entity 상태·merge 명세 |
| `spring.core.data-jpa.fetch-plan` | Jakarta Persistence 3.2 Spec | entity graph·fetch join 관련 절 |
| `messaging.core.semantics.message-model` | LINE Kafka 플랫폼 사례 | 작업 큐/플랫폼 사례. Command/Event의 규범적 계약 아님 |
| `performance.core.observability.signals-context` | 카카오 MATRIX 운영 사례 | 지표·분산 추적·운영 분석 사례. OTel API 계약 아님 |

추가로 Network & HTTP의 RFC-to-be 10025 저자 원고는 2026년 7월 발행 형식의 머리글을 포함하지만, **RFC Editor 공식 Queue는 2026-10-17 기준 Final Review**로 표시한다. 따라서 출판 완료로 해석하지 않고, 기존 RFC 10025 안내 3관계의 교정은 독립 Draft [#229](https://github.com/guseoh/csforge/pull/229)에서 추적한다. 원문 접근 제한만으로 404/삭제를 판단하지 않는다.

## R2 관계 대조 검증 완료

- 기준: 일회성 [Repository Validation #38992865607](https://github.com/guseoh/csforge/actions/runs/38992865607) SUCCESS. 전체 JSON 증거: `csforge-r2-reference-gap-report` Artifact.
- 전체 **15Area / 721 Concept / 1,038 관계 / 621URL**, 글로벌 URL 메타 충돌 **0**, Concept 내 URL 중복 **0**, displayOrder 중복 **0**.
- Wave 3 과거 186개 원본 관계 **전부 최신 canonical에 존재**, 그중 NEEDS_REVIEW 146개 (CA46/DSA70/OS26/Network4).
- Java Wave 4 과거 272관계 중 PR #225에서 5관계 제거 → 현재 267. 옛 NEEDS_REVIEW 16 중 1관계 제거/15관계 R1에서 판정 완료. 증거 원본의 상태 변경 아님.
- 중복 제거 기준 비Java 과거 미확정 후보 **153관계**, 이 가운데 5개를 독립 원문 대조해 KEEP 판단; **남은 148관계**는 오류 확정 수가 아닌 후속 검토 대기 건수.
- 일회성 workflow 검사 스텝 제거 후 기존 Repository Validation 정의로 복귀; 본 PR에는 **감사 코드·기록·결정 근거만 포함**.

## R2 후속 정리 — 2026-10-17 (OSTEP 원문·중복 PR)

- **중복 PR #226 종료**: 같은 NIST `backup-restore` 변경을 독립 재작성한 [#230](https://github.com/guseoh/csforge/pull/230)에 old→new Testcontainers 회귀 검증까지 포함되어 단일 진행 PR로 채택. #226은 병합하지 않음.
- **발행 상태 교정 [#229](https://github.com/guseoh/csforge/pull/229)**: HTTP 쿠키 3관계가 참조하던 RFC-to-be 10025는 공식 RFC Editor Final Review 페이지에서 아직 미출판이다. 정식 RFC 6265와 변경 가능한 6265bis draft를 분리했다. 실제 old→new / Reader 최종 게이트는 별도.
- **Operating Systems OSTEP 원문 직접 확인**: [Chapter 26 PDF](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf)의 서론·26.1·26.2·26.3 원문을 확인해 11개 관계를 Concept별로 대조. **10관계 KEEP**은 `verified-relations.json`에 각 근거·제한을 추가했고, 사용자 스레드 매핑까지 보장하는 듯한 relationNote 1관계는 [#231](https://github.com/guseoh/csforge/pull/231) Draft로 최소 한정 수정. 원문 전체가 자동 검증되었다는 뜻은 아니다.
- 원래 집계 **비Java 과거 미확정 153관계**, 직접 검증 5→**15관계**, **잔여 후보 148→138관계**로 내려간다. 이 수치는 오류·실패 수가 아니고, #229/#230/#231의 미병합 수정을 자동 반영해 감한 값도 아니다. 정확한 수치는 `reconcile.py` 재실행 후 확정한다.
- R2 브랜치 자체는 **감사/근거 전용**이며 canonical 수정·운영 DB 적용·병합 없음. [#227](https://github.com/guseoh/csforge/pull/227), [#229](https://github.com/guseoh/csforge/pull/229), [#230](https://github.com/guseoh/csforge/pull/230), [#231](https://github.com/guseoh/csforge/pull/231)은 별도의 독립 교정 Draft PR이다.

## DSA 70관계 / 18URL 1차 독립 대조

- [DSA 관계별 재검토 및 검색 색인·공식 저자 코드 근거](dsa-preliminary.md) 추가. 70관계/18URL을 전부 추적하고, 원문 읽을 범위 점검이 우선인 7관계를 구분.
- Princeton 7개 canonical URL 직접 확인은 403, 일부 본문·저자 코드는 검색 색인에서 확인. **직접 원문 검증으로 승격하지 않고** DSA 70관계는 계속 후속 검토 대기.
- 이 업데이트는 canonical 변경/새 확정 결함/추가 15건 VERIFIED를 의미하지 않으며 현재 R2 감사 집계 **15 verified / 138 pending 유지**. 다른 교정 PR과 중복 수정 없음.

## R2 DSA/CA 관계 단위 후속 검사 — 2026-10-17

- [DSA 70관계 / 18개 고유 URL 조사표](dsa-preliminary.md): 선행 7개 Concept와 Princeton 공식 출처의 indexed excerpt·저자 Java 구현을 대조, **6관계 scope-note 수정 검토 권고 / 1관계 기존 안내 유지 가능**. 원래 canonical 직접 403 때문에 `DIRECT_CONTENT_VERIFIED`로 일괄 승격하지 않았다. 실제 콘텐츠 수정은 독립 검증 후 별도 PR.
- [Computer Architecture 46관계 / 10개 URL 조사표](computer-architecture-preliminary.md): UMD 강의 URL 8개에 44관계 집중, IEEE 754·OpenJDK JMH 각 1관계. `floating-point`의 IEEE document ID와 표준 DOI 관계, `hardware-memory-reordering`의 ISA/언어 계약 경계, PDF 미열람을 우선 확인 대상으로 분리.
- 2개 문서는 **전체 116관계의 기존 미확정 상태와 후속 작업을 명확하게 추적**하지만 116개 외부 본문 검증이 끝났다는 의미가 아니다. 감사 원본과 canonical key, 기존 `verified-relations.json` 15건 및 잔여 **138 후보 수치는 불변**. 링크 접근 실패를 임의 broken 판정하거나 기존 #227/#229/#230/#231 교정 PR과 중복 수정하지 않는다.

## Computer Architecture 공식 출처 추가 대조 — 2026-10-18

- [Computer Architecture 46관계 / 10 URL 추적표](computer-architecture-preliminary.md)의 기존 `undefined` 8행을 실제 관계별 추가 검토 범위로 교정. [감사 커밋](https://github.com/guseoh/csforge/commit/c59cab7c170263abb5a86ee257b41404316cffed)와 해당 커밋 CI SUCCESS.
- IEEE Xplore `8766227`(publication number)과 실제 IEEE 754-2019 개별 문서 번호 `8766229`를 구분하고, 직접 열 수 있는 [IEEE Standards Association 754-2019 공식 페이지](https://standards.ieee.org/ieee/754/6210/)와 [Oracle IEEE Arithmetic 학습 표](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_math.html)를 대조. Oracle 가이드는 754-1985 설명이며 현재 754-2019 전문이 아니라는 제한도 기록.
- **교정은 감사 PR이 아닌 독립 [Draft PR #233](https://github.com/guseoh/csforge/pull/233)에만 분리**했다. 한 Concept의 출처 개선을 CA 46개 전체의 직접 검증 완료로 전파하지 않는다.
- UMD 강의 자료 44관계는 canonical 본문 원문을 여전히 읽을 수 없어 재검토 대기. OpenJDK JMH 1관계는 공식 [openjdk/jmh](https://github.com/openjdk/jmh) 저장소 공개를 확인했으나 기존 홈페이지의 접속 제한 자체를 링크 파손으로 판정하지 않는다.
- 전체 R2 `15 VERIFIED / 138 NEEDS_REVIEW`는 과거 범위와 통합 감사의 현재 스냅샷으로 유지. 신규 PR의 수정 완료 및 Reader/Import 증거는 **별도 상태로 기록**하고, 병합 전에는 main의 완료 숫자로 재집계하지 않는다.

## 2026-10-18 UMD 44관계·JMH 1관계 개별 판정

- [UMD 44관계/8URL 관계별 조사 및 ACCESS_UNRESOLVED 보존](umd-44-relationship-review.md): 원본 7 HTML + 1 PDF 직접 접근 403/불가, 별도 메릴랜드대 공식 강의 및 Linux/RISC-V 보조 출처와 구별. 확정된 broken 0, 새 원본 검증 0. 원본 관계·global metadata·canonical 내용 변경 없음.
- JMH 1관계는 **공식 OpenJDK 저장소 README를 실제 열람하고**, 기존 openjdk.org 프로젝트 소개 URL이 이 환경에서 403을 보인다는 조건부 사용자 사용성 문제를 분리함. 접근 가능한 공식 https://github.com/openjdk/jmh 로 변경하는 독립 [Draft PR #234](https://github.com/guseoh/csforge/pull/234)를 생성해 검증. 기존 원본이 영구 dead라는 결론 아님.
- 기존 IEEE 754 교정 [Draft PR #233](https://github.com/guseoh/csforge/pull/233)과 파일·범위 중복 없음.
- 통합 감사 집계 15 verified / 138 pending을 임의 수정하지 않으며 UMD 44개도 새로 verified 분류하지 않음. #234는 교정 PR의 검증 결과가 확보될 때까지 merge/Production과 별개.

## R2 병합 후 재검증 — 2026-10-19

- 이전의 **15 verified / 138 pending**은 병합 전 `main 2862a92` 기준 snapshot이다. [병합 후 별도 QA/재집계 기록](../issue-222-postmerge/README.md) 및 [Actions #39140901504](https://github.com/guseoh/csforge/actions/runs/39140901504)에서 현행 `main 66aa3a69`을 직접 대조한 결과 **1,042관계/622URL/15Area/721Concept, 전역 충돌·중복 0, 독립 verified 15, 비Java 후속 후보 133관계**.
- Wave3 과거 186관계 중 변경된 옛 URL 5관계(IEEE1/JMH1/RFC10025 3)는 현재 canonical에 더 이상 존재하지 않는다. **다른 옛 미확정 관계에 대한 자동 VERIFIED 승격은 하지 않는다.**
- #227/#230/#231은 격리 DB + 실제 React Reader QA를 추가 수행했고, 3 Concept/5링크/18화면·키보드 새 탭, full-pack 3,380 exact UNCHANGED 검증 PASS. 원본 Waves·`verified-relations.json`을 수정하지 않았다.
- #222는 R2 나머지 133 후보의 의미 검토 및 R3 Reader UX 미완료로 **Open 유지**.

## 2026-10-19 R2 출처 직접 검증: RISC-V 2개 완료, Distributed/Network 3개 증거 구분

- [관계별 원본 재대조 및 접근 한계](os-distributed-network-followup.md): 현행 `main 2d63e679`의 **OS 2 / Distributed 2 / Network 1 관계를 독립적으로 재검토**. 동일 RISC-V canonical `priv-intro.html`이 공식 최신 버전 `isa/v20260120/priv/priv-intro.html`로 안내됨을 확인하고 **실제 Privilege Levels 문서 전체를 직접 읽어** `user-kernel-mode` / `privilege-protection`의 적용 범위를 각각 확인, `verified-relations.json`에 2개 KEEP 추가.
- Princeton Saga TR-070-87 원 URL은 403(공식 서지·Abstract 검색 인덱스만 확인); ACM CAP DOI도 403이나 MIT 저자 소속의 13쪽 논문 원고는 직접 열어 `§2.1–2.3` 및 `§3.1` 실제 내용 확인. **원래 ACM URL이 열렸다고 판정하지 않음**.
- Kakao Wcache Part 1은 원 URL 직접 open이 제목/menu shell이나 공식 같은 URL 검색 인덱스에서 저장 구조·분산·hot item·2계층의 원문 발췌가 드러남. **INDEXED_EXCERPT_ONLY**, 지금의 서비스 성능 사실로 일반화하지 않음.
- 수동 원문 직접 검증 **15→17**, 남은 비Java 후보 **133→131**은 `reconcile.py`로 재확인 대상. canonical/Question, 공유 URL metadata, 감사 원본, Production Import/배포는 변경하지 않음. Issue #222의 R3 UX는 [#236](https://github.com/guseoh/csforge/pull/236)에서 이미 병합 완료되었으므로 미완료 표시를 반복 적용하지 않음.

## 2026-10-19 Operating Systems 잔여 14관계/11 URL 전수 재검토

- [전체 contentKey×원 URL·기술 범위·접근 한계](operating-systems-14-relationship-review.md)를 기록. D2 8 URL의 직접 HTML은 메뉴 shell만, Kakao 1 URL은 title/menu, JEP491 403, OSTEP 26장 원본은 이번 timeout으로 **새 원문 직접 검증 0건**. 다만 동일 URL의 색인된 실제 본문으로 소유자–대기자 cycle, NAPI/softirq, Chrome IPC, cgroups v1, 카카오 io_uring 검토·보류 등 주제 적합성을 각각 확인했음. 검색 인덱스를 원 URL 직접 열람 증거로 승격하지 않음.
- Canonical의 독서 안내 개선 **2건**(Kakao io_uring의 '실제 성능 평가' 과장, NAVER D2 cgroups v1과 Concept v2 설정 혼동)을 발견했으며 별도 최소 교정 PR로 분리한다. 기존 Wave/verified 17/남은 131 수치는 유지하고 OS 14건을 끝났다고 임의 0으로 만들지 않음.

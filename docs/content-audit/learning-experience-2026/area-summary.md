# LearningArea별 감사 요약

15 Area 전수 구조 인벤토리를 유지한다. Wave 1·2·3의 14 Area는 본문/문항 전수 직접 검토 CURRENT_VERIFIED다. Wave 4는 Java language-types 10C/55Q만 완료했으며 Java Area는 CURRENT_PARTIAL이다. 다른 Java Topic의 초기 샘플 CURRENT_PARTIAL과 NEEDS_REVIEW는 보존한다. 과거 PASS는 PRIOR_REVIEWED이며 Wave 4/Issue #200 전체 완료가 아니다.

| Area | Topic | Concept | Question | 이번 본문 검토 | 이번 문항 검토 | Concept KEEP / ENHANCE / REVIEW |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| backend-engineering | 13 | 40 | 108 | 40 | 108 | 32 / 8 / 0 |
| cache | 3 | 9 | 27 | 9 | 27 | 7 / 2 / 0 |
| computer-architecture | 10 | 61 | 183 | 61 | 183 | 54 / 7 / 0 |
| database | 12 | 38 | 75 | 38 | 75 | 28 / 10 / 0 |
| distributed-systems | 3 | 9 | 27 | 9 | 27 | 8 / 1 / 0 |
| dsa | 12 | 84 | 293 | 84 | 293 | 72 / 12 / 0 |
| infrastructure-cloud | 3 | 9 | 27 | 9 | 27 | 6 / 3 / 0 |
| java | 18 | 145 | 841 | 13 | 74 | 6 / 5 / 134 |
| messaging-async | 3 | 9 | 27 | 9 | 27 | 7 / 2 / 0 |
| network-http | 15 | 127 | 381 | 127 | 381 | 105 / 22 / 0 |
| operating-systems | 12 | 97 | 331 | 97 | 331 | 83 / 14 / 0 |
| performance-observability-operations | 3 | 9 | 27 | 9 | 27 | 8 / 1 / 0 |
| security | 12 | 38 | 74 | 38 | 74 | 26 / 12 / 0 |
| spring | 12 | 37 | 77 | 37 | 77 | 33 / 4 / 0 |
| system-design | 3 | 9 | 27 | 9 | 27 | 7 / 2 / 0 |

검토 수에는 초기 샘플 CURRENT_PARTIAL도 포함한다. 최신 누적 전수 항목은 wave-4/summary.json의 cumulativeComplete로 구별한다. wave-1/2/3-summary.json은 당시 집계의 불변 snapshot이다. 근거는 review-notes.json 및 wave-1/2/3 ledger, wave-4/topics/*.json, 위치/연결은 inventory.json에 있다.

## backend-engineering

13 Topic 전체 curriculum·40 Concept 원문 및108 Question의 모든 선택지/rationale/accepted/model/explanation을 직접 읽고 개별 근거 작성. 공식 계약을 실제 대조하며 자동 parsing과 과거 PASS는 verdict 근거로 쓰지 않음.

이전 전수 Wave: [PR #181](https://github.com/guseoh/csforge/pull/181) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## cache

models→consistency→operations의 모든 본문과 27문항을 직접 읽고 아래 항목별 근거를 작성. 파서/키워드에 의한 의미 verdict 없음.

이전 전수 Wave: [PR #187](https://github.com/guseoh/csforge/pull/187) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## computer-architecture

10 Topic의 curriculum 목표와 전체 Concept 원문 및 모든 Question 실제 필드를 직접 읽고 개별 근거를 작성했다. 불확실 기술은 실제 공식 자료와 대조하며 source 접근 미확정과 item 의미 검토를 구별한다. 이전 발견 재확인은 새 finding으로 중복 집계하지 않는다.

이전 전수 Wave: [PR #183](https://github.com/guseoh/csforge/pull/183) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## database

12 Topic의 curriculum 목표·전체 본문·75문항의 모든 선택지/rationale/accepted/model/explanation을 직접 읽고 개별 근거를 작성. PostgreSQL 공식 버전별 자료와 실제 source를 대조하며 자동 파싱/이전 PASS로 verdict를 부여하지 않음.

이전 전수 Wave: [PR #180](https://github.com/guseoh/csforge/pull/180) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## distributed-systems

time-failure→consistency→coordination 전체 본문9/문항27 직접 읽음. Raft current-term commit·Dynamo sloppy quorum·etcd read/lease·Chubby sequencer·CAP 원저자 사본으로 주요 경계 대조.

이전 전수 Wave: [PR #191](https://github.com/guseoh/csforge/pull/191) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## dsa

12 Topic의 curriculum 목표와 전체 Concept 원문 및 모든 Question 실제 필드를 직접 읽고 개별 근거를 작성했다. 불확실 기술은 실제 공식 자료와 대조하며 Reference 접근 미확정과 item 의미 검토를 구별한다. 이전 발견 재확인은 새 finding으로 중복 집계하지 않는다.

이전 전수 Wave: [PR #182](https://github.com/guseoh/csforge/pull/182) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## infrastructure-cloud

compute→network→reliability의 9 본문/27 문항을 직접 읽고 모든 답·선택지 rationale·해설을 대조. 공식 문서는 도구 open뿐 아니라 관련 계약 부분을 확인한 범위로 평가.

이전 전수 Wave: [PR #189](https://github.com/guseoh/csforge/pull/189) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## java

language-types만의 10 Concept 전체 본문과 55 Question의 모든 실제 필드를 직접 읽었다. MC53/Scenario1/Descriptive1의 정답/모든 선택지와 rationale/모범 답안/해설, 전제·난도·중복 목표·연결을 개별 대조했다. 코드 출력은 주로 JLS/JDK 계약과 수기 상태 추론이며 제한된 4쟁점만 Java25 probe로 실제 실행했다. source hash 자동 계산은 이미 작성한 수기 판단을 고정할 뿐 PASS를 생성하지 않는다. PR178의 수정과 기존 partial 근거를 보존하며 다른 Java Topic은 미검토다.

이전 전수 Wave: [PR #178](https://github.com/guseoh/csforge/pull/178) (PRIOR_REVIEWED). 새 근거: **CURRENT_PARTIAL**. 품질: **NEEDS_REVIEW**.

## messaging-async

semantics→delivery→workflow 전체 본문/27문항의 모든 선택지·rationale·acceptedAnswers·modelAnswer·explanation을 직접 읽고 개별 판정. 출력 잘림 구간은 workflow 문항 전체로 다시 확인했다.

이전 전수 Wave: [PR #188](https://github.com/guseoh/csforge/pull/188) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## network-http

모든 Topic의 canonical Concept 본문과 연결 Question의 모든 필드를 직접 읽어 Topic별 수기 근거를 확정한 뒤 조립했다. 기술/학습 목표/깊이/흐름·상태/코드/가독성/오해/Level·순서/도식화/Reference와 개별 정답·모든 보기·rationale·acceptedAnswers/modelAnswer/explanation·모호성/난이도/목표 반복·연결을 검토했다. 자동 추출·이전 PASS·길이·이미지 수가 품질 판정 근거가 아니다. 공식 출처는 실제 읽은 관련 절의 의미만 확인했고 접근 및 추가 검토 한계는 별도로 남겼다.

이전 전수 Wave: [PR #185](https://github.com/guseoh/csforge/pull/185) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## operating-systems

All 12 Topics, 97 Concept bodies, 331 Question records and 33 unique SVG sources were directly read. Individual evidence, official-source scope and access limitations are recorded separately. SVG semantic geometry was reviewed; pixel render QA was not performed. No prior PASS was promoted without a direct read.

이전 전수 Wave: [PR #184](https://github.com/guseoh/csforge/pull/184) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## performance-observability-operations

measurement→observability→operations 본문9/문항27 직접 검토. EASY 문항의 쉬운 distractor는 입문 분류 능력으로만 인정하며 운영 숙련의 증거로 확대하지 않는다.

이전 전수 Wave: [PR #190](https://github.com/guseoh/csforge/pull/190) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## security

12 Topic 전체 curriculum·38 Concept 원문 및74 Question의 모든 선택지/rationale/accepted/model/explanation을 직접 읽고 개별 근거를 작성. 불확실한 기술 주장은 실제 공식 계약과 대조하고 도구 접근 실패·검토 한계는 구분. 자동 parsing과 이전 PASS는 verdict 근거로 쓰지 않음.

이전 전수 Wave: [PR #186](https://github.com/guseoh/csforge/pull/186) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## spring

12 Topic의 curriculum 목표·전체 Concept 본문·모든 Question 선택지/rationale/accepted/model/explanation을 직접 읽어 개별 근거를 작성. 공식 자료로 계약/불확실 주장을 대조하며 자동 파싱·이전 PASS로 verdict를 부여하지 않음.

이전 전수 Wave: [PR #179](https://github.com/guseoh/csforge/pull/179) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## system-design

requirements→architecture→reliability의 본문9와 27문항을 모두 직접 읽고 choices/rationale/accepted/model/explanation 개별 대조. 정밀 계산 및 접수/거절 상태 계약을 새 보강 대상으로 식별.

이전 전수 Wave: [PR #192](https://github.com/guseoh/csforge/pull/192) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

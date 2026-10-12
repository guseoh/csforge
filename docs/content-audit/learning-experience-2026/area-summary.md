# LearningArea별 감사 요약

15 Area 전수 구조 인벤토리를 유지한다. Wave 1의 6 Area와 Wave 2의 4 Area는 본문/문항 전수 직접 검토 CURRENT_VERIFIED, 나머지 5 Area는 새 전수 의미 검토 NEEDS_REVIEW다. 과거 PASS는 PRIOR_REVIEWED 근거로 보존한다.

| Area | Topic | Concept | Question | 이번 본문 검토 | 이번 문항 검토 | Concept KEEP / ENHANCE / REVIEW |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| backend-engineering | 13 | 40 | 108 | 40 | 108 | 32 / 8 / 0 |
| cache | 3 | 9 | 27 | 9 | 27 | 7 / 2 / 0 |
| computer-architecture | 10 | 61 | 183 | 5 | 6 | 0 / 2 / 59 |
| database | 12 | 38 | 75 | 38 | 75 | 28 / 10 / 0 |
| distributed-systems | 3 | 9 | 27 | 9 | 27 | 8 / 1 / 0 |
| dsa | 12 | 84 | 293 | 8 | 10 | 1 / 2 / 81 |
| infrastructure-cloud | 3 | 9 | 27 | 9 | 27 | 6 / 3 / 0 |
| java | 18 | 145 | 841 | 4 | 25 | 0 / 2 / 143 |
| messaging-async | 3 | 9 | 27 | 9 | 27 | 7 / 2 / 0 |
| network-http | 15 | 127 | 381 | 3 | 9 | 1 / 1 / 125 |
| operating-systems | 12 | 97 | 331 | 3 | 11 | 0 / 0 / 97 |
| performance-observability-operations | 3 | 9 | 27 | 9 | 27 | 8 / 1 / 0 |
| security | 12 | 38 | 74 | 38 | 74 | 26 / 12 / 0 |
| spring | 12 | 37 | 77 | 37 | 77 | 33 / 4 / 0 |
| system-design | 3 | 9 | 27 | 9 | 27 | 7 / 2 / 0 |

검토 수에는 이전 초기 샘플 CURRENT_PARTIAL도 포함한다. 누적 전수 완료 수는 wave-2-summary.json의 CURRENT_VERIFIED 수로 구별한다. wave-1-summary.json은 당시 집계의 불변 snapshot이다. 근거는 review-notes.json 및 wave-1/*.json, wave-2/*.json, 위치/연결은 inventory.json에 있다.

## backend-engineering

13 Topic 전체 curriculum·40 Concept 원문 및108 Question의 모든 선택지/rationale/accepted/model/explanation을 직접 읽고 개별 근거 작성. 공식 계약을 실제 대조하며 자동 parsing과 과거 PASS는 verdict 근거로 쓰지 않음.

이전 전수 Wave: [PR #181](https://github.com/guseoh/csforge/pull/181) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## cache

models→consistency→operations의 모든 본문과 27문항을 직접 읽고 아래 항목별 근거를 작성. 파서/키워드에 의한 의미 verdict 없음.

이전 전수 Wave: [PR #187](https://github.com/guseoh/csforge/pull/187) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## computer-architecture

cache replacement/ISA 경계/TLB/페이지 테이블/pipeline hazards를 읽었다. TLB miss≠fault, RAW≠WAR와 구현/ISA 경계는 설명된다. order metadata/TLBq1 설명만 P2. hardware source 및 나머지 전체 문항 대조는 미완료.

이전 전수 Wave: [PR #183](https://github.com/guseoh/csforge/pull/183) (PRIOR_REVIEWED). 새 근거: **NEEDS_REVIEW**. 품질: **NEEDS_REVIEW**.

## database

12 Topic의 curriculum 목표·전체 본문·75문항의 모든 선택지/rationale/accepted/model/explanation을 직접 읽고 개별 근거를 작성. PostgreSQL 공식 버전별 자료와 실제 source를 대조하며 자동 파싱/이전 PASS로 verdict를 부여하지 않음.

이전 전수 Wave: [PR #180](https://github.com/guseoh/csforge/pull/180) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## distributed-systems

time-failure→consistency→coordination 전체 본문9/문항27 직접 읽음. Raft current-term commit·Dynamo sloppy quorum·etcd read/lease·Chubby sequencer·CAP 원저자 사본으로 주요 경계 대조.

이전 전수 Wave: [PR #191](https://github.com/guseoh/csforge/pull/191) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## dsa

pruning/fib 중복 ASCII로 과거 누락 해소 확인. overlapping KEEP. 초기화/공간 최적화의 덮어쓰기 trace만 선택 P2. 상태 키·최적성·선택 기준의 설명을 읽었지만 남은 구조/sort/search 및 출처·문항 전수 검토는 미완료.

이전 전수 Wave: [PR #182](https://github.com/guseoh/csforge/pull/182) (PRIOR_REVIEWED). 새 근거: **NEEDS_REVIEW**. 품질: **NEEDS_REVIEW**.

## infrastructure-cloud

compute→network→reliability의 9 본문/27 문항을 직접 읽고 모든 답·선택지 rationale·해설을 대조. 공식 문서는 도구 open뿐 아니라 관련 계약 부분을 확인한 범위로 평가.

이전 전수 Wave: [PR #189](https://github.com/guseoh/csforge/pull/189) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## java

값 전달/HashMap/CAS/GC 본문·Question을 읽었다. 값 복사·동등성·원자성·root 경계를 구분하는 기존 설명은 유지할 근거가 있다. CASq2 선택지와 값 전달 SVG만 선별. JVM/JMM·출처·나머지 문항의 새 전수 검토는 미완료.

이전 전수 Wave: [PR #178](https://github.com/guseoh/csforge/pull/178) (PRIOR_REVIEWED). 새 근거: **NEEDS_REVIEW**. 품질: **NEEDS_REVIEW**.

## messaging-async

semantics→delivery→workflow 전체 본문/27문항의 모든 선택지·rationale·acceptedAnswers·modelAnswer·explanation을 직접 읽고 개별 판정. 출력 잘림 구간은 workflow 문항 전체로 다시 확인했다.

이전 전수 Wave: [PR #188](https://github.com/guseoh/csforge/pull/188) (PRIOR_REVIEWED). 새 근거: **CURRENT_VERIFIED**. 품질: **TARGETED_ENHANCE**.

## network-http

TCP handshake/TLS1.3/trusted proxy flow와 q셋을 대조했다. TLS KEEP, proxyq1 선택지만 P1 제안. 과거7개 누락은 의미 있는ASCII로 해소. #198 한국어 전수 Wave 보존; 나머지RFC/HTTP 전체 검토는 미완료.

이전 전수 Wave: [PR #185](https://github.com/guseoh/csforge/pull/185) (PRIOR_REVIEWED). 새 근거: **NEEDS_REVIEW**. 품질: **NEEDS_REVIEW**.

## operating-systems

shared-memory L2와 서로 다른VA→같은 backing, RR quantum/cost, fault 복구/COW/재시도 및 q셋을 대조했다. 기존SVG는 유지할 근거가 있으나 primary 접근과 전체 프로세스/스레드/스케줄링/VM 의미 검토는 미완료.

이전 전수 Wave: [PR #184](https://github.com/guseoh/csforge/pull/184) (PRIOR_REVIEWED). 새 근거: **NEEDS_REVIEW**. 품질: **NEEDS_REVIEW**.

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

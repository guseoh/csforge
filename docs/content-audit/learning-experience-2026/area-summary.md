# LearningArea별 감사 요약

전수 인벤토리와 현재 샘플 의미 검토를 구분한다. 모든 Area의 새 전수 의미 판정은 NEEDS_REVIEW이며 이전 PASS를 취소하지 않는다.

| Area | Topic | Concept | Question | 이번 본문 검토 | 이번 문항 검토 | Concept KEEP / ENHANCE / REVIEW |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| backend-engineering | 13 | 40 | 108 | 1 | 3 | 1 / 0 / 39 |
| cache | 3 | 9 | 27 | 2 | 3 | 0 / 0 / 9 |
| computer-architecture | 10 | 61 | 183 | 5 | 6 | 0 / 2 / 59 |
| database | 12 | 38 | 75 | 3 | 6 | 3 / 0 / 35 |
| distributed-systems | 3 | 9 | 27 | 2 | 6 | 0 / 0 / 9 |
| dsa | 12 | 84 | 293 | 8 | 10 | 1 / 2 / 81 |
| infrastructure-cloud | 3 | 9 | 27 | 1 | 3 | 1 / 0 / 8 |
| java | 18 | 145 | 841 | 4 | 25 | 0 / 2 / 143 |
| messaging-async | 3 | 9 | 27 | 1 | 3 | 0 / 0 / 9 |
| network-http | 15 | 127 | 381 | 3 | 9 | 1 / 1 / 125 |
| operating-systems | 12 | 97 | 331 | 3 | 11 | 0 / 0 / 97 |
| performance-observability-operations | 3 | 9 | 27 | 1 | 3 | 0 / 0 / 9 |
| security | 12 | 38 | 74 | 2 | 3 | 0 / 1 / 37 |
| spring | 12 | 37 | 77 | 2 | 4 | 1 / 0 / 36 |
| system-design | 3 | 9 | 27 | 1 | 3 | 0 / 0 / 9 |

판정의 근거는 review-notes.json, 원본 위치/metadata/Question 연결은 inventory.json, type/difficulty/level/density/시각화 분포는 area-summary.json에서 추적한다.

## backend-engineering

idempotency-key의 상태/fingerprint/commit 후 응답 실패/tenant/TTL과 q1~q3/Stripe 사례는 KEEP. 이전 usecase/pagination/retry/batch coverage 근거 보존, 나머지 body/Question의 새 검토는 미완료.

이전 전수 Wave: [PR #181](https://github.com/guseoh/csforge/pull/181). 새 Area 판정: **NEEDS_REVIEW**.

## cache

Cache-Aside hit≠최신/미스≠없음과 v1조회→v2commit→DEL→늦은fill race를 읽고 invalidation q셋을 대조했다. 최신 세대/전달 실패를 설명하는 기존 모델 보존. 모든 source/나머지6개Concept/q셋 의미 검토 미완료.

이전 전수 Wave: [PR #187](https://github.com/guseoh/csforge/pull/187). 새 Area 판정: **NEEDS_REVIEW**.

## computer-architecture

cache replacement/ISA 경계/TLB/페이지 테이블/pipeline hazards를 읽었다. TLB miss≠fault, RAW≠WAR와 구현/ISA 경계는 설명된다. order metadata/TLBq1 설명만 P2. hardware source 및 나머지 전체 문항 대조는 미완료.

이전 전수 Wave: [PR #183](https://github.com/guseoh/csforge/pull/183). 새 Area 판정: **NEEDS_REVIEW**.

## database

MVCC visibility/row-lock/btree 본문·Question·공식 출처는 KEEP. 문장/트랜잭션 스냅샷, 일반 SELECT/충돌 잠금, 선택도/heap 비용을 구분한다. 남은 SQL/isolation/WAL/replication 전수 의미 검토는 미완료.

이전 전수 Wave: [PR #180](https://github.com/guseoh/csforge/pull/180). 새 Area 판정: **NEEDS_REVIEW**.

## distributed-systems

고정N/R/W 교차≠linearizability/consensus, Lease만료≠실제쓰기가중단됨과 자원token검사 body/q셋을 대조했다. Dynamo/Chubby/etcd 보장 원문과 나머지7개Concept의 새 전수 검토 미완료.

이전 전수 Wave: [PR #191](https://github.com/guseoh/csforge/pull/191). 새 Area 판정: **NEEDS_REVIEW**.

## dsa

pruning/fib 중복 ASCII로 과거 누락 해소 확인. overlapping KEEP. 초기화/공간 최적화의 덮어쓰기 trace만 선택 P2. 상태 키·최적성·선택 기준의 설명을 읽었지만 남은 구조/sort/search 및 출처·문항 전수 검토는 미완료.

이전 전수 Wave: [PR #182](https://github.com/guseoh/csforge/pull/182). 새 Area 판정: **NEEDS_REVIEW**.

## infrastructure-cloud

resource-boundaries body/q1~q3와 Kubernetes source는 KEEP. request배치/CPU throttling/메모리OOM·eviction/JVM외메모리를 구분한다. 나머지 실행·네트워크·스토리지/복구 전수 검토 미완료.

이전 전수 Wave: [PR #189](https://github.com/guseoh/csforge/pull/189). 새 Area 판정: **NEEDS_REVIEW**.

## java

값 전달/HashMap/CAS/GC 본문·Question을 읽었다. 값 복사·동등성·원자성·root 경계를 구분하는 기존 설명은 유지할 근거가 있다. CASq2 선택지와 값 전달 SVG만 선별. JVM/JMM·출처·나머지 문항의 새 전수 검토는 미완료.

이전 전수 Wave: [PR #178](https://github.com/guseoh/csforge/pull/178). 새 Area 판정: **NEEDS_REVIEW**.

## messaging-async

DB commit와 offset commit 순서별 종료→유실/중복, 로컬 중복기록과 업무 변경, Kafka EOS≠외부효과를 body/q셋에서 대조했다. 다른8개Concept와 Kafka42/outbox source의 새 전수 검토 미완료.

이전 전수 Wave: [PR #188](https://github.com/guseoh/csforge/pull/188). 새 Area 판정: **NEEDS_REVIEW**.

## network-http

TCP handshake/TLS1.3/trusted proxy flow와 q셋을 대조했다. TLS KEEP, proxyq1 선택지만 P1 제안. 과거7개 누락은 의미 있는ASCII로 해소. #198 한국어 전수 Wave 보존; 나머지RFC/HTTP 전체 검토는 미완료.

이전 전수 Wave: [PR #185](https://github.com/guseoh/csforge/pull/185). 새 Area 판정: **NEEDS_REVIEW**.

## operating-systems

shared-memory L2와 서로 다른VA→같은 backing, RR quantum/cost, fault 복구/COW/재시도 및 q셋을 대조했다. 기존SVG는 유지할 근거가 있으나 primary 접근과 전체 프로세스/스레드/스케줄링/VM 의미 검토는 미완료.

이전 전수 Wave: [PR #184](https://github.com/guseoh/csforge/pull/184). 새 Area 판정: **NEEDS_REVIEW**.

## performance-observability-operations

queue증가/이용률 외 지표와 안정·동일경계 Little법칙 120/40=3초, shedding body/q셋을 대조했다. SRE자료 확인, 논문과 다른8개Concept/문항 새 전수 검토는 미완료.

이전 전수 Wave: [PR #190](https://github.com/guseoh/csforge/pull/190). 새 Area 판정: **NEEDS_REVIEW**.

## security

authentication/q3가 credential→context 성공/실패를 검증해 과거P1 해소. source 학습 동선만 P2. output-encoding은 HTML/JS code로 문맥 비교가 이미 있어 TEXT 신호 미탐지로 그림 강제 금지. OWASP/나머지문항 새 전수 대조 미완료.

이전 전수 Wave: [PR #186](https://github.com/guseoh/csforge/pull/186). 새 Area 판정: **NEEDS_REVIEW**.

## spring

self-invocation과 lifecycle의 코드/ASCII/q셋에서 바깥 트랜잭션·내부 advice 우회, 생성/초기화/자원 소유권을 구분한다. lifecycle KEEP, self-invocation은 보충 출처 재확인 대기. 나머지 framework 계약 전수 PASS 미선언.

이전 전수 Wave: [PR #179](https://github.com/guseoh/csforge/pull/179). 새 Area 판정: **NEEDS_REVIEW**.

## system-design

sync/async durable accept와 사용자완료상태/CSV작업/결제-색인경계 body/q셋을 대조했다. Messaging세부와 architecture책임을 구분하는 기존 설명 보존. Saga/gRPC source와 다른8개Concept 검토 미완료.

이전 전수 Wave: [PR #192](https://github.com/guseoh/csforge/pull/192). 새 Area 판정: **NEEDS_REVIEW**.

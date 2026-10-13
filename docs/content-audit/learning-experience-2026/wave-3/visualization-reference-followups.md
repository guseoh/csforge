# Wave 3 — 도식·Reference·후속 범위

정확한 판정·원문 인용·source hash는 [Area ledger](README.md#개별-검토-근거)와 [새 발견 보고](../wave-3-findings.md)에 있다. 이미지가 없거나 설명이 짧다는 이유로 결함을 만들지 않았다. 필요한 경우도 기존 본문의 짧은 표·ASCII·시간선이 먼저다. 이번 감사에서는 본문·그림을 수정하지 않는다.

## 도식화 추가·개선 후보

| contentKey | 구체적으로 보여 줄 상태·흐름 | 판단 |
| --- | --- | --- |
| `computer-architecture.core.isa-execution.procedure-call-machine-level` | entry SP→frame 할당→nested call의 ra/인자·보존 레지스터→return 값→SP 복원. recursion frame별 별도 상태를 표시한다. | W3-CA-001 핵심 설명 보강. 기존 PC/ra 그림은 유지 |
| `computer-architecture.core.virtual-memory-hardware.mmu`, `.page-table-walk`, `.tlb` | hardware-managed TLB의 miss→PTE walk→fill 대 software refill handler→PTE 읽기→TLB write→복귀. 실제 page fault slow path는 별도 분기다. | W3-CA-006 구현 경계. 기존 대표 walk 그림 유지 |
| `computer-architecture.core.cache-organization.replacement-policy` | full set에서 접근 순서가 LRU victim을 바꾸고 dirty victim만 write-back하는 전후 표 | 직접 읽은 기존 prose·문항은 충분해 KEEP. 새 필수 그림 대상 아님 |
| `dsa.core.complexity.invariant-correctness`, `dsa.core.search-sort.binary-search-boundary` | 비감소 정렬 전제, known-false `[0,left)`, unknown `[left,right)`, known-true `[right,n)`와 가능한 답 경계 `[left,right]`. all-false의 답 `n`도 표시한다. | W3-DSA-001/014. 코드 전체 재작성보다 불변식 설명·전제 수정 |
| `dsa.core.sequential.doubly-linked-list` | sentinel↔sentinel 빈 상태→노드 삽입 후 sentinel↔A↔sentinel. dummy가 실제 data node가 아님을 표시한다. | W3-DSA-004, 연결 Question 전에 최소 학습 모델 제공 |
| `dsa.core.hashing.resize` | n개 기존 항목→새 table의 hash/put→충돌 probe 합계. 정상 분포와 모두 같은 hash의 `1+…+n`을 비교한다. | W3-DSA-010, 무조건 선형 보장 제거 |
| `dsa.core.dynamic-programming.initialization-order` | 초기 dp→weight2/value3/capacity4에서 순방향 c2/c4의 `dp4=6` 대 역방향 c4/c2의 `dp4=3` | 기존 LEX-004 계승, 새 발견 중복 아님 |
| `dsa.core.dynamic-programming.space-optimization` | previous/current row의 읽기 대상→현재 row 덮어쓰기→이전 값을 잃는 시점·복원 metadata | 기존 LEX-004 계승, 초기화 순서 표와 역할 구분 |
| `operating-systems.core.process.process-address-space` | VA→VMA의 backing file/offset metadata, 별도로 PTE→resident PFN/특수 entry. 실제 data page와 파일 객체를 구분한다. | W3-OS-003, 기존 SVG/본문 mapping 층위 설명 보강 |
| `operating-systems.core.filesystem.allocation` | indexed 행의 logical block 번호→index entry→실제 destination data block. 기존 contiguous/linked 행과 같은 구체성을 제공한다. | W3-OS-024, 기존 SVG의 선 끝점/entry 보강 후보. source 좌표 의미만 검토 |
| `operating-systems.core.filesystem.write-flush-fsync` | BufferedWriter.write→사용자 buffer→flush가 syscall write 유발→kernel cache→fsync의 영속 경계 | W3-OS-023, write가 library인지 syscall인지 먼저 구별. 전체 그림 재제작 지시 아님 |
| `operating-systems.core.ipc.pipe` | 마지막 write-end close 때 buffer에 bytes 있음→read가 남은 bytes 반환→buffer drained→다음 read=0 | W3-OS-028. 기존 pipe SVG는 이미 drained 조건이 정확해 유지 |
| `operating-systems.core.ipc.ipc-tradeoff` | Shared Memory가 직접 공유 상태를 갖는 위치와 메시지 전달 카드의 상태 소유를 표시하거나 잘못된 continuum을 제거한다. | W3-OS-032, 기존 SVG axis/card 정렬 최소 개선 후보 |
| `network-http.core.http-message.content-length-transfer` | CL+TE 수신→reject 또는 TE 처리→응답 후 close. 전달한다면 CL 제거→TE 처리/정상화된 downstream 메시지 | W3-NET-020, 필수 연결 상태 분기를 보강 |
| `network-http.core.http-methods.patch` | 동일 strong v7 조건의 atomic increment→v8 commit→동일 v7 재시도는 412. 별도 concurrent writer로 v8이 된 경우와 원래 요청 성공을 결과 조회로 구분한다. | W3-NET-021 문항 해설의 서로 겹치는 보장 범위 보강. 본문 KEEP |
| `network-http.core.http-cache.if-none-match` | A/B 다른 개인 본문·같은 URL·분리 누락 key→A 본문이 B 요청에 잘못 선택됨→304/body 재사용. 각각 자기 본문을 정상 검증한 304와 비교 | W3-NET-027, 위험을 유일하게 추론할 상황 전제 |
| `network-http.core.http-versions.transport-head-of-line` | TCP seq gap 뒤 A/B frame 동시 대기 대 QUIC A offset gap 중 B 전달. shared congestion/QPACK 지연은 다른 분기 | 기존 ASCII와 문항이 충분해 KEEP. 선택 심화 |
| `network-http.core.http-status.redirect-status` | POST→302→GET 가능 대 POST→307→POST, 별도 결과 조회는 303 | 기존 표가 충분해 KEEP. 선택 심화 |
| `network-http.core.http-state-intermediary.trusted-proxy-boundary` | fake leftmost 입력→edge strip/rewrite→trusted hops→backend 해석 및 direct bypass 거절 | 기존 본문 충분. LEX-001 q1 D만 최소 보강 |

위 key의 약식 점 표기는 같은 Topic prefix에 붙는 전체 key다. 전체 key·파일 위치는 연결 발견 JSON에 있다. 기존 도식이 충분한 상태는 유지하고, 선택 후보를 필수 결함 수에 합산하지 않는다. CA/DSA의 구조·정렬·graph·DP와 Network TCP/TLS/HTTP·OS process/VM의 기존 text diagram도 개별 rows에서 검토했다.

## Reference 문제와 미확인 범위

| Area | 관계 | 고유 URL(Area 내) | 관련 의미 대조 | NEEDS_REVIEW 관계 |
| --- | ---: | ---: | ---: | ---: |
| CA | 68 | 25 | 22 | 46 |
| DSA | 90 | 25 | 20 | 70 |
| OS | 142 | 86 | 116 | 26 |
| Network | 145 | 46 | 141 | 4 |
| 합계 | 445 | Area 간 URL 중복 있음 | 299 | 146 |

전체 관계별 key/path/URL과 상태는 [reference-inventory.json](../reference-inventory.json)에 있으며 [Wave 3 Reference 확인 대기 목록](../wave-3-reference-issues.json)은 의미 또는 접근 NEEDS_REVIEW 관계를 추출한다. 아래는 확정한 내용 문제와 접근/학습 가치 미확인을 구분한 최소 범위다.

| 대상과 실제 근거 | 후속 최소 범위 |
| --- | --- |
| CA의 UMD 강의 target들과 IEEE2019, JMH homepage | 직접 접근 제한을 broken URL로 단정하지 않는다. 본문 모델·수치 추론과 실제 읽은 MIT/Oracle/RISC-V/Linux/OpenJDK 관련 내용을 구분한다. 원래 target의 관련 절·학습 가치/최종 URL은 #201에서 확인, 접근 UX는 #222와 조정 |
| DSA의 Princeton canonical target 18종 | 원래 페이지 전체가 도구에 열리지 않아 NEEDS_REVIEW다. 코드/상태/반례를 직접 검토했고 의심한 주장은 저자의 UF/Prim/Hash/Topological source와 공식 강의/API로 대조했다. 원래 자료를 읽었다고 승격하지 않는다. #202에서 관련 절·실제 학습 동선을 확인 |
| `operating-systems.core.threads.*`의 OSTEP intro 일부 relation | PC/stack/creation/shared counter 부분은 읽었으나 ULT mapping/blocking이나 cache cost까지 그 URL이 뒷받침하는지는 추가 확인이다. 실제 JEP444/Oracle25/Linux API 근거와 관계별 한계를 ledger에 분리. #201에서 relation 범위를 좁히거나 적절한 관련 절로 연결 |
| `operating-systems.core.deadlock.deadlock-avoidance`, `.deadlock-detection-recovery`의 UIC 자료 | 실제 필요 조건 제거/avoidance 혼동, Need/Request 부등호 및 allocation 반환 문제가 있다(W3-OS-016). Dijkstra 원고의 transcription도 무조건 승인하지 않고 Cornell 수치/의사코드와 대조했다. #201에서 정확한 동작 절 안내와 출처 한계를 보강 |
| OS의 Naver D2/Kakao 보충 글 | 제목/metadata와 본문 확인 수준이 다르다. 본문 미노출이면 비교 사례/현재 내용의 학습 가치를 미확인으로 남긴다. primary 계약의 대체 자료로 승인하지 않는다 |
| `network-http.core.local-delivery.switch-forwarding`, `.broadcast-domain` | ARP RFC826만으로 FDB/VLAN 학습 목표를 확인할 수 없다(W3-NET-001). #202에서 실제 읽은 Cisco MAC 학습/VLAN 관련 자료의 필요한 절을 연결 |
| `network-http.core.ip-routing.prefix-subnet`, `.ttl-hop-limit`, `network-http.core.udp.checksum` | IPv4 RFC791/UDP768만으로 CIDR·IPv6 Hop Limit·IPv6 checksum 조건까지 확인할 수 없다(W3-NET-004/005/010). #202에서 RFC4632/8200/8085 관련 절만 보강 |
| TLS 7 Concept와 request-journey의 DNS/routing·TCP/QUIC·TLS/QUIC 비교 | RFC8446의 해당 모델은 정확하나 2026년7월 RFC9846으로 대체된 상태 및 RFC9000/9001·5280·7239·host routing 근거를 구별한다(W3-NET-012/014). #202에서 현행 관련 절/역사 판본 한정·필요한 주장별 출처만 보강 |
| `network-http.core.http-versions.header-compression` | HPACK7541만으로 QPACK9204의 별도 streams·Required Insert Count·blocking/never-index를 배우기 어렵다(W3-NET-024). #202에서 QPACK 관련 절 추가 |
| Cookie·Set-Cookie·cookie-scope의 RFC10025 | canonical URL 접근 실패, 공식 교정본은 존재하지만 Datatracker는 In Final Review다. 관련 규칙은 교정본으로 대조했고 최종 publication 확인은 남겼다(W3-NET-029). #202에서 공표/URL 재확인 후 임시 draft/교정본 또는 최종 RFC를 올바르게 한정 |
| Network의 Kakao Wcache article 및 RFC9110/9525 일부 접근 | Kakao 제목만 보이고 본문은 미노출; 원문 학습 가치 NEEDS_REVIEW. RFC는 다른 동일 공식 문서로 관련 의미를 읽었지만 원래 URL 접근 note를 남긴다. #222와 실제 학습자 접근 확인 범위 조정 |
| Toss cache 운영 글 | 관련 배포·invalidation 사례는 읽었다. 1년이 max-age 최대라는 과거 표현을 현행 HTTP 보장으로 사용하지 않는다. 기존 recommendation이 RFC 우선·구현 예시 한정을 명시하므로 전체 글을 새 정확성 PASS하지 않는다 |

URL 접근 성공이나 CURRENT_VERIFIED 한 줄은 문서 전체의 PASS가 아니다. `sources`는 실제 읽은 관련 의미, `supplementalSources`는 추가 확인한 자료와 한계, `referenceAccess`는 접근 상태, `supportingEvidence`는 원래 Reference 미확인 상태에서 개별 본문 판정을 뒷받침한 출처/직접 모델 추론이다.

## 기존 후속 Issue별 최소 범위

| Issue | Wave 3 확정 보강 대상(계승 포함) | 새 발견 우선순위 | 최소 작업 범위 |
| --- | --- | --- | --- |
| [#201](https://github.com/guseoh/csforge/issues/201) | CA 7 Concept·7 Question, OS 14 Concept·26 Question — 합계 21C·33Q | 새 45그룹: P0 17 / P1 13 / P2 15. LEX-003/005 별도 계승 | 틀린 해설/정상 답 거절·OS 객체별 반환/신뢰 범위를 먼저 수정. SP frame·mapping 층위·SMT·I/O/IPC 조건과 기존 indexed/IPC SVG의 최소 상태 보강. 기존 shared-memory 내용/그림을 새로 재작성하지 않는다. Java는 아직 전수 검토 미완료이므로 자동 수정 대상에 넣지 않는다. |
| [#202](https://github.com/guseoh/csforge/issues/202) | DSA 12 Concept·22 Question, Network 22 Concept·21 Question — 합계 34C·43Q | 새 55그룹: P0 13 / P1 14 / P2 28. LEX-004/001의 해당 범위 별도 계승 | 복수 답·닫힌 구간·lower-bound/complexity·조건부 PATCH·Linux bind/validator 오류를 먼저 수정. 독립 문항 입력과 표현/신뢰 전제를 보강하고 필요한 Reference만 연결. DP 상태 표/기존 proxy q1 보강 계승. Wave 2 Database 발견의 소유권/범위는 변경하지 않는다. |
| [#222](https://github.com/guseoh/csforge/issues/222)와 조정 | 미접근 canonical URL·보충 글 relation 및 공식 publication 학습 경로 | 결함/접근 미확인 별도 | #201/#202가 소유한 내용·metadata 수정과 중복하지 않는다. 이번 감사는 #222 기능 구현·새 Issue를 만들지 않는다. |

REWRITE_REQUIRED·새 Concept/Question·수량 quota·대량 이미지 생성 범위는 확정하지 않았다. ChatGPT 최종 검토에서 P0의 실제 정답 성립, P1의 누락 전제, P2의 선택 보강 필요성과 미확인 Reference 한계를 확인한 뒤 후속 작업을 시작한다.

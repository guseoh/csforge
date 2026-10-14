# 도식 계약과 기존 자산

Wave 3의 전수 시각화 판단·OS SVG 소스 의미 검토 및 구체 상태/흐름 후보는 [Wave 3 도식 기록](wave-3/visualization-reference-followups.md#도식화-추가개선-후보)에 있다. 아래 Wave 1 근거는 보존한다.

Wave 1에서는 54 Concept의 현재 ASCII·표·시간선을 직접 읽고 계약과 학습 효과를 대조했다. 이 6 Area는 image/SVG 참조0이며 기존 Java/OS 60 SVG는 보존했다. 개별 유지/보강 근거는 [6개 ledger](wave-1/README.md)에 있다. 새 이미지 생성·본문 삽입은0이다.

추가 선별 후보는 Write-Behind cache 기록→ACK→DB 및 crash, invalidation check/publish race, restart/recreate 상태 수명, 같은 평균·다른 꼬리의 분포, QPS→query/bytes 환산, rejected/degraded/accepted-pending 분기다. 기존 quorum·Lease 41/42·Saga·DNS overlap·HPA delay 도식은 유지한다. 개수로 판정하지 않았다.

현재 기준선에는 Java27/OS33의 60 SVG가 있다. Java array-covariance.svg 하나는 미연결이고 나머지 59개가 본문에 연결된다. 초기 보고의 Java26/OS34 및 전부 연결이라는 설명을 인벤토리와 대조해 정정하며 자산을 수정하지 않는다. 다른 13개 Area는 image0이지만 이 차이는 품질 점수가 아니다. Database B-tree/MVCC/row-lock, Spring lifecycle/self-invocation, TLS, Distributed quorum/fencing, Cache invalidation에는 이미 의미 있는 ASCII·timeline이 있다. `DIAGRAM`은 본문과 동등한 효과의 시각화도 허용한다.

모든 source path/alt/viewBox/text label/연결 key/실제 deployment URL은 [asset-inventory.json](asset-inventory.json)에 있고 [deployment-evidence](deployment-evidence.json)는 HTTP200·SVG·소스 일치60/60을 기록한다. 실제 배포는 `efe73a15...`의 Production deployment6851629801이다. query string이 붙은 StringBuilder URL도 경로와 분리해 존재를 확인했다.

## 선별 추가·개선 후보

| 대상 | 보여줄 상태/흐름 | 판단 |
| --- | --- | --- |
| `java.core.language-types.pass-by-value` | 호출자/매개변수의 복사된 참조→공유 A→매개변수만 B로 재대입; caller→A 선이 value 라벨을 가리지 않게 배치 | LEX-002 P2. 새 이미지보다 기존 SVG 경로 수정 |
| `dsa.core.dynamic-programming.initialization-order` | 초기 dp[0..4]→물건(2,3) 순방향 c2/c4→같은 물건 두 번 반영 vs 역순 c4/c2→이전 상태만 읽음 | LEX-004 P2. 작은 상태 표/ASCII 우선 |
| `dsa.core.dynamic-programming.space-optimization` | previous/current row의 어떤 상태가 유지/폐기되는지, 값 복원용 metadata가 언제 사라지는지 | LEX-004 P2. 초기화의 같은 강의 반복 방지 |
| `computer-architecture.core.cache-organization.replacement-policy` | 가득 찬 한 set의 접근 순서→LRU victim→dirty victim이면 write-back | TEXT 신호 후보, 필요성 미확정. 기존 prose/Question 대조 후 선택 |
| `dsa.core.dynamic-programming.optimal-substructure` / `dsa.core.greedy.global-optimum-proof` | 최단 경로 구간 대체의 모순 또는 OPT 첫 선택→g 교환→남은 문제 | TEXT 신호 후보, 상태 제약·Question/자료 검토 후 선택 |

현재 선별 후보를 제외한 새 이미지 제작 scope는 확정하지 않는다. [자동 후보9개](candidates.json)는 code fence가 visualization language가 아니거나 prose로 충분할 수 있다. 예를 들어 `security.core.injection.output-encoding`은 HTML/JS 코드로 출력 위치를 이미 비교하므로 단순한 TEXT 신호 미탐지는 새 그림의 근거가 아니다. ISA 비교·data-shape·online-offline도 이번 자료만으로 수정 확정하지 않았다.

## 위험 주제 재검토 상태

| 요청한 주제 | 현재 확보한 근거 | 추가 의미 검토 |
| --- | --- | --- |
| Java 값 전달/HashMap/GC/CAS | 본문과 연결 q셋 대조. SVG가 실제 존재. CAS 그림/값 전달 그림을 배포 브라우저로 확인 | HashMap/GC 화면 및 세 출처, JVM data areas/수집기 전체·일반 JMM/동시성은 NEEDS_REVIEW |
| OS 프로세스·스레드/스케줄링/VM | shared-memory의 서로 다른 VA→backing, RR quantum, fault 복구/오류를 본문/q셋에서 대조. shared-memory/fault 그림 화면 확인 | 프로세스·스레드 전체 관계/스케줄러/페이지 교체 전수 의미 검토와 OSTEP 직접 대조 필요 |
| Network TCP/HTTP/TLS/Proxy | TCP SYN seq/ACK, TLS1.3 certificate/key/Finished, proxy trust ASCII와 q셋 대조; 이전7개 누락 해소 | TCP 상태기계·HTTP 전체/중개 경계 전수 RFC 대조 미완료 |
| DB MVCC/Lock/Index/Transaction | visibility/row-lock/btree 본문과 q셋·공식 출처 확인, 기존 timeline 유지 | 격리 이상현상·WAL·원자적 갱신·모든 transaction 문항 재대조 필요 |
| DSA 구조/정렬/탐색/DP | pruning/fib 반복 경로 유지; DP initialization/space 상태 trace 선별 | 자료구조·sort/search 전체와 남은 DP 전수 의미 검토 미완료 |
| CA Cache/Pipeline/TLB | replacement/hazards/TLB/multi-level body 확인; hazards/TLB q셋 대조 | hardware source 직접 검증, Cache 전체/forwarding 사이클·모든 문항 미완료 |
| Spring AOP/Transaction/Lifecycle | self-invocation/lifecycle call flow와 q셋 대조 | 나머지 proxy/propagation/rollback contracts의 새 전수 검토 미완료 |
| Distributed Replication/Consistency/Coordination | Wave 1 9 Concept/27 Question 전체와 Raft·Dynamo·Chubby/etcd 핵심 계약 직접 대조. 기존 diagram 유지 | CAP 응답 의미 P2 보강; ACM/Princeton 원 Reference 전문 접근 재확인. Reader 화면·사용성 QA 미완료 |

독립 SVG 화면4개만 확인했다. reader embed/다크·라이트/375px mobile/키보드·screen reader·학습 사용성까지 PASS했다고 기록하지 않는다. 후속 그림 변경은 #208의 표시 기반 이후 실제 reader에서 human QA를 해야 한다. 이번에는 이미지를 생성·수정하거나 canonical 본문에 넣지 않았다.

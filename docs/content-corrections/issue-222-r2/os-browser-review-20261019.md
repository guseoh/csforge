# Issue #222 R2 — OS 잔여 14관계 원문 검토

기준 `main 57e6d460eca009a5bd2aaa06fd88810565e0ceb6`, 2026-10-19 KST. [기존 14관계 조사](operating-systems-14-relationship-review.md)의 검색 색인/접근 보류를 실제 원 URL 본문과 대조했다. R1/R3 및 이미 병합된 #231/#239의 교정은 반복하지 않는다.

## 접근 경로

- D2 8 URL, Kakao 680, JEP491은 in-app browser에서 **제목만 아닌 실제 관련 본문**을 읽었다. 이전 웹 도구의 shell/403 기록은 당시 관측으로 유지한다.
- OSTEP 원 PDF는 브라우저 접근성 트리에 문서 본문이 없었으나, 별도 웹 PDF 도구에서 **동일 원 URL의 16쪽 PDF**를 열어 pp.1–3, §26.1–26.2의 공유 주소공간·스레드별 PC/레지스터/스택·생성 예제를 읽었다. URL은 `https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf`, 문서 VERSION 1.10. PDF 텍스트 직접 확인과 브라우저 PDF 표시 QA는 구분한다.
- 아래 14건은 각각 **KEEP / DIRECT_CONTENT_VERIFIED(기재한 절·배경 한정)**. 원문 전문의 정확성, 모든 OS Concept/Question의 full review 또는 Reader UI QA PASS 판정이 아니다.

## 관계별 판정

key에는 `operating-systems.core.` prefix를 붙인다. D2 URL prefix는 `https://d2.naver.com/helloworld/`다.

| contentKey suffix | 원 URL | 직접 읽은 절·버전 | 판단과 범위 한계 |
| --- | --- | --- | --- |
| deadlock.deadlock-detection-recovery | D2 `10963` | 2012-02-03, 데드락 상태인 경우·세 DEADLOCK_TEST owner/waiter | cycle 진단 사례 KEEP. 자동 복구/자원 회수 정책의 근거 아님 |
| deadlock.deadlock | D2 `10963` | 동일 세 스레드가 각각 다음 monitor를 기다리는 dump | 상호 보유/대기와 진행 불가의 실제 사례 KEEP |
| deadlock.resource-allocation-graph | D2 `10963` | locked/waiting-to-lock 주소를 따라 연결하는 사례 | 단일 monitor 의존 cycle 보조 KEEP. 다중 인스턴스 RAG의 cycle 충분조건으로 확대하지 않음 |
| io.async-io | https://tech.kakao.com/posts/680 | io_uring 검토, SQ/CQ·SQPOLL·Go 결합 우려·도입 보류 | #239 recommendation/relationNote가 원문과 일치. io_uring 도입/성능 측정 완료 근거 제외 |
| io.device-io-kernel-path | D2 `47667` | 2012-04-26, 인터럽트와 수신 패킷 처리·napi_schedule/net_rx_action/poll | 당시 Linux NIC→NAPI→softirq 흐름 사례 KEEP. 모든 커널/드라이버/OS 공통 계약 아님 |
| io.epoll | D2 `1469717` | 2017-12-05, nginx 도입과 문제 해결·Tomcat NIO 전환 | 당시 blocking worker와 이벤트 처리의 운영 비교 KEEP. epoll은 readiness이며 비동기 완료 API가 아님 |
| ipc.ipc-tradeoff | D2 `2922312` | 2019-03-14 번역, 브라우저 아키텍처·프로세스 분리·서비스화 | IPC 협력·격리/메모리 비용 사례 KEEP. 현대 Chrome 프로세스 정책의 규범 아님 |
| ipc.shared-memory | D2 `47656` | 2012-04-26, Binder driver·커널 메모리 주소 매핑·ioctl·IPC/RPC | kernel-mediated IPC 비교 사례 KEEP. POSIX shm의 일반 동기화/수명 규칙과 구별 |
| isolation.cgroup | D2 `7248350` | 2025-02-27, 명시적인 cgroups v1 실습·memory.limit_in_bytes·Kubernetes limit | #239의 v1/v2 분리 안내 유지. soft_limit은 지속 초과를 금지하는 hard limit이라고 해석하지 않음 |
| isolation.container-process-model | D2 `3661677` | 2019-08-01, Docker 도입·호스트 OS 종속·공유 커널·Worker/Distributor 자원 배치 | 프로세스 workload의 배포/자원 경계 사례 KEEP. overlay 성능 결과는 당시 환경 한정 |
| isolation.process-isolation | D2 `2922312` | 다중 프로세스의 장애 격리·renderer 권한 제한 | 주소/권한 경계의 사례 KEEP. 서로 다른 프로세스가 명시적 shared memory도 공유할 수 없다는 뜻 아님 |
| threads.java-virtual-thread-boundary | https://openjdk.org/jeps/491 | Delivered Release 24, Description·Diagnosing remaining cases of pinning·Future Work | monitor 획득/보유/wait 중 unmount 개선 KEEP. native/FFM callback·class initialization 등 잔여 pinning을 제거했다고 해석하지 않음 |
| threads.user-level-thread | https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf | VERSION 1.10, pp.1–3, §26.1–26.2 | #231의 기초 thread context/주소공간 한정 유지. M:N 매핑·런타임 scheduling의 직접 설명 아님 |
| virtual-memory.virtual-address-space | D2 `0128759` | 2023-08-17, 당시 ZGC marked0/marked1/remapped·mmap·ZPage | 여러 virtual view→하나의 physical backing 예시 KEEP. Java25/모든 OS의 주소 비트·RSS 3배 보장 아님 |

## 원문에 남아 있는 오해 위험과 추천 범위

`DIRECT_CONTENT_VERIFIED`는 원문과 관련 절을 읽었다는 뜻이며 원문의 모든 주장에 동의한다는 뜻이 아니다. 현행 recommendation이 다음 잘못된 일반화를 요구하지 않으므로 **추천한 사례 절에 한정해 유지**한다.

- D2 10963의 배경 설명은 OS의 CPU 배분을 Java `WAITING` 전환과 섞고 main 실행 스레드를 HotSpot `VM Thread`라 부른다. 이번 세 관계의 근거는 그 배경 설명이 아니라 **실제 monitor owner/waiter cycle dump**다. Java thread-state·VM 내부 스레드의 계약 근거로 쓰지 않는다.
- D2 1469717에서 epoll을 `Asynchronous I/O`라 부르는 표현은 readiness/completion을 구별하는 일반 정의로 쓰지 않는다. 현행 Concept의 epoll(7) 공식 근거와 이벤트 처리 사례라는 recommendation을 우선한다.
- D2 7248350의 soft limit 지속 초과 금지 표현은 정확한 hard enforcement 계약이 아니다. 현재 Concept는 v2를 설명하고 #239가 v1 사례와의 구분을 이미 명시한다. 이 글의 모든 memory policy 설명을 검증했다고 확대하지 않는다.
- D2 2922312의 프로세스별 전용 메모리 설명은 별도 매핑의 공유까지 불가능하다는 뜻으로 사용하지 않는다. shared-memory Concept의 POSIX/커널 계약과 분리한다.

새 canonical P0/P1 교정 사유는 확인하지 못했다. 기존 recommendation의 사례 범위 및 #231/#239의 한정은 유효하다. 과거 구현을 현재 일반 보장으로 확대하는 추가 변경도 하지 않는다.

## 검증과 완료 경계

- 원 URL 11개/14관계의 직접 본문 게이트는 이번 제안에서 모두 확인. 기존 OS 독립 12관계와 중복되지 않는다. 기존 ledger/main의 17 verified/131 pending은 이 독립 Draft만으로 바뀌지 않으며 최종 reconcile에서 별도 통합한다.
- 감사 문서만 변경: canonical/Question/URL/전역 metadata/Import/Reader 불변. 신규 Apply/idempotency·Reader UI 회귀 검증 해당 없음. 실제 브라우저 외부 본문 열람을 375/768/1280px Reader UI QA로 표시하지 않는다.
- `git diff --check`, 관계 identity 대조 14/14 확인. Repository Validation은 PR HEAD의 별도 CI에서 확인한다. 사용자 검토/승인 전 병합 금지. Production 변경/Import/수동 배포/Issue 종료 없음.

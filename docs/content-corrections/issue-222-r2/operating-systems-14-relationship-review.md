# Issue #222 R2 — Operating Systems 잔여 14관계 전수 조사

검토일: **2026-10-19**. 기준 `main 47a33f0627238829ff9a3afdda07c47e17ced643`, Issue [#222](https://github.com/guseoh/csforge/issues/222). 이전 OS Wave3 26 NEEDS_REVIEW 중 OSTEP 10 및 RISC-V 2개는 독립 원문 확인으로 별도 KEEP 기록되었으며, 이번 대상은 **14개 Concept–URL 관계 / 11개 URL**이다.

## 엄격한 접근 및 증거 분류

- NAVER D2 **8 URL의 직접 `open`은 모두 21줄 navigation shell**. Kakao의 직접 `open`은 제목/메뉴만 표시. OpenJDK JEP491 직접 GET 403, OSTEP Threads PDF는 이번 조회 timeout. 이것을 404/dead link/기술 오류 확정으로 바꾸지 않는다.
- 검색 엔진의 동일 URL **긴 원문 발췌(Indexed Content)**는 학습 주제의 관련성을 판단하는 근거이나, 대상 URL의 실사용 Reader에서 페이지 전문을 직접 열람한 결과가 아니다. 14관계 중 신규 `DIRECT_CONTENT_VERIFIED`는 **0건**.
- [Oracle Java25 Virtual Threads 가이드](https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html)는 JEP491의 별도 공식 보강이며 같은 Concept에 이미 등록되어 있다. 원래 OpenJDK JEP URL을 열었다고 주장하지 않는다.

## URL과 Concept를 함께 보는 14개 관계 전수 매트릭스

| contentKey | 실제 원래 Canonical URL | 이번 원문/색인 관련성 근거 | 한계·판정 |
| --- | --- | --- | --- |
| `operating-systems.core.deadlock.deadlock-detection-recovery` | [원 URL](https://d2.naver.com/helloworld/10963) | 스레드 덤프 분석하기(2012): 소유한 monitor와 대기 중인 monitor 및 실제 cycle를 보이는 검색 색인 | **PENDING ORIGINAL ACCESS**. Java 스레드의 lock-owner/waiter 진단 사례이며, 일반 RAG의 다중 자원 인스턴스·복구 알고리즘 자체는 입증하지 않음 |
| `operating-systems.core.deadlock.deadlock` | [원 URL](https://d2.naver.com/helloworld/10963) | 스레드 덤프 분석하기(2012): 소유한 monitor와 대기 중인 monitor 및 실제 cycle를 보이는 검색 색인 | **PENDING ORIGINAL ACCESS**. Java 스레드의 lock-owner/waiter 진단 사례이며, 일반 RAG의 다중 자원 인스턴스·복구 알고리즘 자체는 입증하지 않음 |
| `operating-systems.core.deadlock.resource-allocation-graph` | [원 URL](https://d2.naver.com/helloworld/10963) | 스레드 덤프 분석하기(2012): 소유한 monitor와 대기 중인 monitor 및 실제 cycle를 보이는 검색 색인 | **PENDING ORIGINAL ACCESS**. Java 스레드의 lock-owner/waiter 진단 사례이며, 일반 RAG의 다중 자원 인스턴스·복구 알고리즘 자체는 입증하지 않음 |
| `operating-systems.core.io.async-io` | [원 URL](https://tech.kakao.com/posts/680) | 실시간 메시징 성능 개선 사례(2025): io_uring SQ/CQ·SQPOLL 검토 후 Go 런타임 통합 문제로 도입 보류 | **PENDING ORIGINAL ACCESS**. 기존 recommendation의 '실제 성능을 평가'는 도입 후 성능 검증으로 오해될 수 있으므로 검토·보류로 최소 교정 |
| `operating-systems.core.io.device-io-kernel-path` | [원 URL](https://d2.naver.com/helloworld/47667) | TCP/IP 네트워크 스택 이해하기(2012): NIC interrupt, NAPI poll 및 softirq의 kernel 실행 흐름 | **PENDING ORIGINAL ACCESS**. 해당 시기의 Linux 코드 경로를 모든 최신 커널/드라이버가 반드시 따르는 계약으로 보지 않음 |
| `operating-systems.core.io.epoll` | [원 URL](https://d2.naver.com/helloworld/1469717) | HTTPS 전환 과정에서 read timeout 해결(2017): Apache prefork 문제, nginx/epoll·Tomcat NIO 전환 | **PENDING ORIGINAL ACCESS**. 특정 환경 timeout 개선이 epoll의 모든 작업 부하 성능을 보장하지 않음; epoll(7) 우선 |
| `operating-systems.core.ipc.ipc-tradeoff` | [원 URL](https://d2.naver.com/helloworld/2922312) | Chrome 다중 프로세스 아키텍처의 오류·권한 격리, IPC 및 메모리 비용(2019 Google 글 번역) | **PENDING ORIGINAL ACCESS**. 2019 Chrome 특정 구현을 현대 모든 브라우저·운영체제의 보편 설계로 일반화 금지 |
| `operating-systems.core.ipc.shared-memory` | [원 URL](https://d2.naver.com/helloworld/47656) | Android Binder 드라이버와 kernel 메모리 매핑/IPC·RPC(2012) | **PENDING ORIGINAL ACCESS**. Binder를 POSIX shm의 보편적 동기화·생명주기·원시 포인터 사용 보장으로 혼동하지 않음 |
| `operating-systems.core.isolation.cgroup` | [원 URL](https://d2.naver.com/helloworld/7248350) | Kubernetes와 cgroup CPU/memory 예시(2025): 글이 **cgroups v1 실습**을 명시하고 memory.limit_in_bytes 사용 | **PENDING ORIGINAL ACCESS**. Concept는 cgroup v2 memory.max/memory.oom.group도 다루므로 v1과 v2의 설정 키와 동작 분리 필요 |
| `operating-systems.core.isolation.container-process-model` | [원 URL](https://d2.naver.com/helloworld/3661677) | Docker 기반 분산 트랜스코더(2019): worker process 워크로드·컨테이너 배포와 자원 배치 | **PENDING ORIGINAL ACCESS**. Docker 사례가 namespaces/cgroup의 커널 계약까지 규정하지는 않음 |
| `operating-systems.core.isolation.process-isolation` | [원 URL](https://d2.naver.com/helloworld/2922312) | Chrome 다중 프로세스 아키텍처의 오류·권한 격리, IPC 및 메모리 비용(2019 Google 글 번역) | **PENDING ORIGINAL ACCESS**. 2019 Chrome 특정 구현을 현대 모든 브라우저·운영체제의 보편 설계로 일반화 금지 |
| `operating-systems.core.threads.java-virtual-thread-boundary` | [원 URL](https://openjdk.org/jeps/491) | JEP491 canonical openjdk.org 원문은 GET 403. 별도 Oracle Java25 Virtual Threads 가이드에서 JDK24+ monitor pinning 제거와 native/foreign pinning을 확인 | **PENDING ORIGINAL ACCESS**. 기존 Concept에 Oracle 25 공식 자료가 별도 연결됨; JEP 원 URL 직접 본문 검증은 아님 |
| `operating-systems.core.threads.user-level-thread` | [원 URL](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf) | OSTEP 26장 원본 이번 조회 timeout. 이전 R2는 26장의 공유 주소공간·스레드별 PC/스택을 읽고 PR #231에서 M:N 주장 한정 | **PENDING ORIGINAL ACCESS**. 기존 scope note 수정 유효; ULT 사용자 공간 스케줄링·M:N 매핑은 이 장의 직접 증거가 아님 |
| `operating-systems.core.virtual-memory.virtual-address-space` | [원 URL](https://d2.naver.com/helloworld/0128759) | ZGC의 기본 개념 이해하기(2023): 당시 ZGC 세 개의 가상 address view, mmap·ZPage | **PENDING ORIGINAL ACCESS**. 역사적 HotSpot/JDK11~17 구현 예시이지 Java25 ZGC 혹은 OS 전체의 고정 계약이 아님 |

## 원래 11개 URL 그룹의 관계 수

| URL | 관계 | 직접 열람 결과 |
| --- | ---: | --- |
| [10963](https://d2.naver.com/helloworld/10963) | 3 | D2 21줄 navigation shell |
| [680](https://tech.kakao.com/posts/680) | 1 | article title + navigation only |
| [47667](https://d2.naver.com/helloworld/47667) | 1 | D2 21줄 navigation shell |
| [1469717](https://d2.naver.com/helloworld/1469717) | 1 | D2 21줄 navigation shell |
| [2922312](https://d2.naver.com/helloworld/2922312) | 2 | D2 21줄 navigation shell |
| [47656](https://d2.naver.com/helloworld/47656) | 1 | D2 21줄 navigation shell |
| [7248350](https://d2.naver.com/helloworld/7248350) | 1 | D2 21줄 navigation shell |
| [3661677](https://d2.naver.com/helloworld/3661677) | 1 | D2 21줄 navigation shell |
| [491](https://openjdk.org/jeps/491) | 1 | 403 |
| [threads-intro.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf) | 1 | timeout |
| [0128759](https://d2.naver.com/helloworld/0128759) | 1 | D2 21줄 navigation shell |

## 수정이 필요한 독서 안내 2건 (Canonical과 감사는 별도 PR)

1. **`operating-systems.core.io.async-io` / Kakao #680**: 현행 global `recommendation`은 '실제 성능을 평가한 사례'라고 읽히지만 기사 색인에 실재하는 것은 **io_uring 기술 검토, SQ/CQ와 SQPOLL의 절충, Go 런타임 결합 우려에 의한 도입 보류**다. 해당 자료가 실제 io_uring 운영 도입·측정 결과를 제시한 것처럼 안내하지 않도록 `recommendation`과 Concept별 `relationNote`를 최소 변경한다.
2. **`operating-systems.core.isolation.cgroup` / NAVER D2 #7248350**: 기사 작성 연도는 2025년이나 예제는 **cgroups v1**(`memory.limit_in_bytes`, `memory.soft_limit_in_bytes`)을 명시한다. 현행 Concept의 **cgroups v2**(`memory.max`, `memory.oom.group`)와 읽는 층위가 다르므로 원문 URL과 shared title은 유지하고 `relationNote`만 추가해 v1 설정 예제로 한정한다.

다른 12관계는 직접 원문 접근이 되지 않는 한 **VERIFY 보류**. 2012년 Binder·TCP/NAPI·Thread dump와 2019 Chrome/Docker, 2023 ZGC의 역사적 구현 맥락을 현재 보편 계약으로 확대하지 않는다. OSTEP 사용자 스레드 근거 범위 교정 #231 및 R3 Reader #236은 이미 병합되었으므로 중복 변경하지 않는다.

## 집계와 후속 게이트

| 내용 | 결과 |
| --- | ---: |
| 기존 OS 전체 historical flagged | 26 |
| 기존 독립 verified (OSTEP10 + RISC-V2) | 12 |
| 이번 감사로 검토한 잔여 관계 | 14 |
| 이번 신규 DIRECT_CONTENT_VERIFIED | **0** |
| 이번 안내 개선 후보 | **2** |
| 원 URL 직접 미확정 관계 | **14** |

전체 R2의 **17 manual verified / 131 nonJava pending 그대로**. `reviewed`와 `DIRECT_CONTENT_VERIFIED`를 분리한다. 2개 최소 정정은 별도 canonical PR의 Testcontainers Preview/Apply + exact 3,380 UNCHANGED + 개인 학습 이력/Reader 확인을 통과한 다음 병합한다. 현재 문서는 감사 전용이며 원본 historical Wave·canonical·Production DB/배포를 변경하지 않는다.

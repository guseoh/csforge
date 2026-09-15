---
kind: concept
contentKey: operating-systems.core.ipc.ipc-tradeoff
topicContentKey: operating-systems.core.ipc
slug: ipc-tradeoff
title: "IPC Trade-off"
summary: "copy·latency·isolation·backpressure 관점에서 IPC를 선택한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/pipe.7.html"
    title: "pipe(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Pipe capacity가 제한되어 있고 full pipe에 대한 blocking write가 reader가 공간을 만들 때까지 멈출 수 있음을 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/2922312"
    title: "최신 브라우저의 내부 살펴보기 1 - CPU, GPU, 메모리 그리고 다중 프로세스 아키텍처"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "브라우저가 process를 분리해 fault와 권한 경계를 만들고 IPC로 협력하는 사례를 확인한다."
    displayOrder: 2
---
# IPC Trade-off

IPC는 하나의 성능 순위로 고르는 기술이 아니다. Process 사이에서 **data를 어떤 형태로 전달할지, kernel이 어디까지 관리할지, copy·synchronization·failure boundary를 누가 책임질지**에 따라 선택이 달라진다.

![IPC 방식별 copy, isolation, synchronization 책임 비교](/learning/operating-systems/ipc-tradeoff.svg)

| 방식 | 기본 data 경계 | 장점 | 주요 책임 |
| --- | --- | --- | --- |
| Pipe | kernel byte stream | 단순한 producer-consumer | framing, capacity, descriptor lifetime |
| Message queue | discrete message | message boundary 보존 | queue capacity, message-size limit |
| Shared memory | shared backing memory | payload copy 감소 가능 | synchronization, layout, participant lifecycle |
| Unix-domain socket | host-local socket | bidirectional socket interface | stream framing 또는 datagram semantics, endpoint lifecycle |
| Network socket | host/network socket | remote process까지 확장 | serialization, framing, network failure |

### Copy가 적다는 것과 protocol이 단순하다는 것은 다르다

Shared memory는 sender와 receiver가 같은 backing data를 직접 볼 수 있어 copy를 줄일 수 있지만 synchronization을 직접 설계해야 한다. Pipe나 socket은 kernel buffer를 사이에 두어 process memory를 분리하지만 data copy와 bounded buffer 비용을 지불한다.

### Message boundary도 선택 기준이다

Pipe와 stream socket은 byte stream이므로 application이 message framing을 정의해야 한다. Message queue는 discrete message를 보존한다. Shared memory는 byte representation과 record layout 자체를 participants가 합의해야 한다.

### Process와 host 경계가 넓어질수록 실패 모델도 커진다

Host-local IPC에서는 peer process 종료와 descriptor/endpoint lifecycle이 핵심 실패다. Network socket으로 host 경계를 넘으면 reachability와 transport failure가 추가된다. 따라서 IPC 선택은 latency 하나보다 **copy 비용, data boundary, synchronization 책임, isolation과 failure scope**를 함께 비교해야 한다.

가장 빠른 primitive를 찾는 것이 아니라, 필요한 통신 범위와 correctness를 가장 단순하게 표현하는 primitive를 선택하는 것이 핵심이다.

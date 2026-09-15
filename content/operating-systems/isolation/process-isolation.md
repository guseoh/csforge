---
kind: concept
contentKey: operating-systems.core.isolation.process-isolation
topicContentKey: operating-systems.core.isolation
slug: process-isolation
title: "Process Isolation"
summary: "process별 주소·권한 경계가 충돌을 막는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process가 resource view를 분리하는 Linux namespace와 일반 process 경계를 구분한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/2922312"
    title: "최신 브라우저의 내부 살펴보기 1 - CPU, GPU, 메모리 그리고 다중 프로세스 아키텍처"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "브라우저가 process를 분리해 fault와 권한 경계를 만들고 IPC로 협력하는 사례를 확인한다."
    displayOrder: 2
---
# Process Isolation

Process는 자신의 virtual address space와 execution/resource context를 가지는 OS의 기본 격리 단위다. 일반적인 user process는 다른 process의 memory를 임의의 pointer로 직접 읽거나 덮어쓸 수 없고, 필요한 data exchange는 IPC나 명시적으로 공유된 resource를 통해 이루어진다.

![별도 address space를 가진 process와 명시적 IPC 경계](/learning/operating-systems/process-isolation.svg)

### 분리와 공유는 동시에 존재한다

Address space는 process마다 분리되지만 kernel과 physical CPU, filesystem object, network stack 같은 system resource는 여러 process가 공유한다. `fork()`처럼 descriptor와 mapping 관계 일부를 상속하는 API도 있으므로 process가 만들어졌다고 모든 resource가 독립 복제되는 것은 아니다.

### Thread보다 강한 memory 경계를 가진다

같은 process의 thread는 heap과 많은 process resource를 공유한다. 반면 별도 process는 address-space boundary가 있기 때문에 한 process의 잘못된 user-space memory write가 다른 process의 heap을 직접 덮어쓰는 것을 막을 수 있다. 대신 process 사이 communication에는 pipe, socket, shared memory 같은 IPC가 필요하다.

### Isolation은 절대적인 분리가 아니다

Process들은 같은 kernel을 사용하고 permission, shared file, shared memory 같은 연결점을 가질 수 있다. 따라서 process isolation은 **주소 공간과 resource access를 기본적으로 분리하는 OS 경계**이지 모든 resource와 실패를 완전히 독립시키는 의미는 아니다.

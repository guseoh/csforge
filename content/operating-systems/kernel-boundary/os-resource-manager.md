---
kind: concept
contentKey: operating-systems.core.kernel-boundary.os-resource-manager
topicContentKey: operating-systems.core.kernel-boundary
slug: os-resource-manager
title: "운영체제와 자원 관리"
summary: "운영체제가 CPU·memory·device를 process에 배분하고 보호·회수하는 resource manager 역할을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "OS와 kernel service의 경계를 확인한다."
    displayOrder: 1
---
# 운영체제와 자원 관리

여러 program이 동시에 실행되면 CPU, physical memory, storage와 network device 같은 제한된 hardware를 함께 사용해야 한다. 각 application이 이런 자원을 직접 제어하도록 두면 한 program의 오류가 다른 program의 실행과 memory까지 침범할 수 있다.

운영체제는 application과 hardware 사이에서 자원을 관리한다. Application은 physical CPU나 disk controller를 직접 소유하는 대신 process, virtual address space, file, socket 같은 OS abstraction을 사용한다.

```text
Application
    ↓
process / virtual memory / file / socket
    ↓
Operating System
    ↓
CPU / RAM / storage / device
```

### 운영체제는 자원을 배분하고 보호한다

CPU에서는 scheduler가 runnable task에 실행 시간을 배분한다. Memory에서는 process별 address space와 page mapping을 관리하고, file과 device에는 접근 권한과 lifetime을 둔다.

즉 운영체제의 역할은 hardware API를 감싸는 데 그치지 않는다.

- **배분**: 누가 언제 얼마나 자원을 사용할지 정한다.
- **보호**: 한 process가 다른 process나 kernel 자원을 임의로 침범하지 못하게 한다.
- **회수**: process가 종료되거나 resource가 더 이상 필요하지 않을 때 다시 사용할 수 있게 한다.

### 제한된 자원에는 대기와 실패가 생긴다

CPU가 모두 사용 중이면 task는 ready queue에서 기다릴 수 있다. Memory가 부족하면 reclaim이나 allocation failure가 발생할 수 있고, descriptor 같은 kernel resource도 limit에 도달할 수 있다.

그래서 application이 resource를 요청했다는 사실과 즉시 사용할 수 있다는 사실은 다르다. 운영체제는 제한된 hardware를 여러 실행 주체 사이에서 안전하게 공유하도록 **resource lifecycle과 경쟁을 관리하는 계층**이다.

다음 Concept에서는 이런 보호를 가능하게 하는 CPU privilege 경계인 user mode와 kernel mode를 본다.

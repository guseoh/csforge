---
kind: concept
contentKey: operating-systems.core.kernel-boundary.system-call
topicContentKey: operating-systems.core.kernel-boundary
slug: system-call
title: "System Call"
summary: "user application이 kernel이 소유한 service를 요청하는 명시적인 OS interface를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "OS와 kernel service의 경계를 확인한다."
    displayOrder: 1
---
# System Call

User mode application은 file system, socket, process creation, virtual-memory mapping처럼 kernel이 관리하는 자원을 직접 조작할 수 없다. 이런 기능이 필요할 때 application은 운영체제가 제공하는 **system call interface**를 통해 kernel service를 요청한다.

```text
Application
   ↓ request
System-call interface
   ↓
Kernel service
   ↓
file / socket / process / memory ...
```

### Library API와 system call은 같은 호출 단위가 아니다

Application은 보통 system-call instruction을 직접 작성하지 않고 language runtime이나 library API를 사용한다. Library function은 user space에서만 끝날 수도 있고, 내부 buffering으로 여러 호출을 하나의 system call로 묶을 수도 있다.

반대로 하나의 고수준 API가 여러 system call을 사용할 수도 있다.

```text
library/runtime API ≠ system call 1:1 mapping
```

System call은 **kernel service boundary의 단위**이고 library API는 application이 사용하는 abstraction의 단위다.

### System-call ABI가 요청을 전달한다

Kernel은 어떤 service를 요청했는지와 argument가 무엇인지 알아야 한다. 그래서 OS와 architecture는 syscall number, argument 전달 위치, controlled entry mechanism 같은 ABI 규칙을 정한다.

구체적인 instruction과 register 배치는 architecture마다 다르므로 system call을 특정한 하나의 assembly instruction으로 일반화하지 않는다.

### Return도 하나의 성공 상태만 있는 것은 아니다

Kernel service는 정상 결과뿐 아니라 error나 partial result를 반환할 수 있다. I/O 요청은 요청한 byte보다 적게 처리될 수도 있고, resource가 준비될 때까지 current task가 block될 수도 있다.

System call을 이해할 때 핵심은 assembly 이름을 외우는 것이 아니라 **user application이 kernel resource를 요청하는 명시적 보호 경계이며, argument와 result가 OS contract를 따라 전달된다**는 점이다.

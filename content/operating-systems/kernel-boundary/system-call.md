---
kind: concept
contentKey: operating-systems.core.kernel-boundary.system-call
topicContentKey: operating-systems.core.kernel-boundary
slug: system-call
title: "System Call"
summary: "user application이 kernel이 소유한 service를 요청하는 ABI 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux에서 system call이 application과 kernel 사이의 기본 interface라는 점과 syscall 목록을 확인한다."
    displayOrder: 1
---
# System Call

Application은 user mode에서 실행되기 때문에 kernel이 관리하는 자원을 마음대로 조작할 수 없다. 파일을 열고, socket으로 데이터를 보내고, 새로운 process를 만들고, virtual memory mapping을 바꾸려면 kernel에게 작업을 요청해야 한다. **System call은 이때 사용하는 user space와 kernel 사이의 명시적인 service boundary**다.

Linux에서는 `openat`, `read`, `write`, `mmap`, `clone`, `socket`처럼 kernel 기능을 요청하는 system call interface를 제공한다. 하지만 Java나 C application이 항상 syscall instruction을 직접 작성하는 것은 아니다. 보통 language runtime이나 standard library가 더 편한 API를 제공하고 내부에서 필요할 때 system call ABI를 사용한다.

```text
Application API
Files.read(...) / Socket.read(...) / libc read(...)
                │
                ▼
Runtime / library wrapper
argument 준비, buffering 등
                │
                ▼
System-call ABI
syscall number + arguments
                │
                ▼
Kernel service
fd lookup / permission / filesystem / network stack ...
```

### Library call과 system call은 같은 말이 아니다

Library function을 호출했다고 해서 항상 kernel mode로 들어가는 것은 아니다. `strlen()`처럼 user space에서 끝나는 함수가 있고, buffered I/O처럼 여러 application-level 호출을 모아 실제 `write` system call 횟수를 줄이는 library도 있다.

반대로 하나의 고수준 API가 여러 system call을 발생시킬 수도 있다. 그래서 “Java method를 한 번 호출했다 = system call 한 번”이라고 대응시키면 안 된다. System call은 **kernel interface의 단위**, library API는 **runtime/library abstraction의 단위**다.

### System-call ABI는 architecture와 OS에 의존한다

System call을 실행하려면 kernel이 어떤 service를 요청했는지와 argument를 전달하는 규칙이 필요하다. Linux는 architecture별 syscall ABI를 정의하며 syscall number와 argument register 배치, entry instruction 같은 세부사항은 CPU architecture마다 다를 수 있다.

예를 들어 RISC-V 환경에서는 `ECALL`이 execution environment에 service request를 일으키는 instruction으로 사용될 수 있고, x86-64 Linux에서는 다른 architecture-specific entry mechanism을 사용한다. 따라서 일반 OS 설명에서 모든 system call을 특정한 하나의 “trap instruction”으로 정의하지 않는다.

### 요청은 즉시 성공하지 않을 수 있다

Kernel service는 여러 결과를 낼 수 있다. 요청한 byte보다 적게 읽는 **partial result**, resource가 아직 준비되지 않아 기다리는 **blocking**, permission이나 argument 문제를 나타내는 **error**가 가능하다.

예를 들어 `read(fd, buffer, 4096)`이 4096 byte를 요청했다고 해서 항상 4096 byte를 반환하는 것은 아니다. File/socket의 상태와 API contract에 따라 더 적은 수가 반환될 수 있고, EOF나 error도 구분해야 한다. Application은 이런 return contract를 이해해야 한다.

### Backend에서 보는 system call의 의미

Java Backend가 DB나 network I/O를 수행할 때 Java thread가 CPU에서 application code만 계속 실행하는 것은 아니다. Runtime을 거쳐 kernel에 I/O를 요청한 뒤 현재 thread가 block될 수도 있고, non-blocking descriptor에서는 readiness를 별도로 기다릴 수도 있다.

따라서 system call을 이해하는 목적은 low-level assembly를 외우는 데 있지 않다. **고수준 API 아래에서 언제 kernel resource를 사용하고, 어떤 상태 변화와 error/partial result가 생길 수 있는지** 이해하는 것이 핵심이다. 이 경계를 알아야 application latency, thread blocking, file descriptor 고갈 같은 문제를 올바른 층에서 분석할 수 있다.

---
kind: concept
contentKey: operating-systems.core.kernel-boundary.user-kernel-mode
topicContentKey: operating-systems.core.kernel-boundary
slug: user-kernel-mode
title: "User and Kernel Mode"
summary: "CPU privilege level과 OS kernel 경계가 application의 직접 hardware 접근을 제한하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "OS와 kernel service의 경계를 확인한다."
    displayOrder: 1
---
# User and Kernel Mode

Application process가 다른 process의 memory를 읽거나 interrupt 설정을 바꾸고 device controller를 직접 조작할 수 있다면 process isolation은 성립하기 어렵다. 그래서 현대 CPU는 모든 instruction을 같은 권한으로 실행하지 않고 **privilege level**을 구분한다. 일반 application은 낮은 권한의 user mode에서 실행되고, OS kernel은 더 높은 권한에서 privileged operation을 수행한다.

여기서 중요한 점은 user/kernel mode가 단순한 소프트웨어 convention이 아니라 **CPU가 강제하는 실행 권한 경계**라는 것이다. Kernel이 정책을 잘 작성하는 것만으로는 충분하지 않고, application이 임의로 privilege level을 올리거나 privileged instruction을 실행하지 못하도록 processor가 제한해야 한다.

### User mode에서 제한되는 이유

User process는 자신의 virtual address space 안에서 일반 계산을 하고 instruction을 실행할 수 있지만, 모든 physical memory와 device register에 직접 접근할 권한은 없다. Page table을 바꾸거나 특정 privileged control register를 수정하는 작업처럼 시스템 전체에 영향을 주는 동작은 높은 privilege가 필요하다.

이 구분 덕분에 application bug의 영향 범위를 줄일 수 있다.

```text
User Process
  일반 계산 / 자신의 virtual memory 사용
            │
            │ privileged service 필요
            ▼
     controlled entry
            │
            ▼
Kernel
  permission 검사 / resource 관리 / driver
```

User mode가 “아무것도 못 하는 모드”라는 뜻은 아니다. 대부분의 application code는 user mode에서 실행된다. Kernel 권한이 필요한 특정 동작만 정해진 경계를 통과한다.

### Kernel mode로 들어가는 여러 경로

Kernel mode 진입 원인은 하나가 아니다. Application이 의도적으로 OS service를 요청하는 **system call**, 현재 instruction 실행 중 발생한 **exception**, 외부 device나 timer 같은 비동기 사건에서 발생하는 **interrupt**가 대표적인 entry 원인이다.

이 세 사건은 원인과 timing이 다르지만 공통점이 있다. Processor가 미리 정의된 handler entry로 control을 넘기고, kernel이 필요한 state를 저장한 뒤 적절한 handler를 실행한다. 즉 application이 원하는 kernel 주소로 jump해서 권한을 얻는 구조가 아니다.

### Mode switch와 context switch는 같은 말이 아니다

System call로 user mode에서 kernel mode로 들어갔다가 같은 thread로 돌아오는 경우, privilege mode는 바뀌었지만 다른 process/thread로 CPU가 넘어간 것은 아닐 수 있다. 반대로 scheduler가 다른 task를 선택하면 register와 execution context를 바꾸는 context switch가 발생한다.

따라서 다음을 구분해야 한다.

- **mode switch**: privilege level / execution domain이 user ↔ kernel로 바뀐다.
- **context switch**: 실행 중인 task의 CPU context가 다른 task로 바뀐다.

System call 하나가 항상 process context switch를 의미하는 것은 아니다.

### Java Backend 요청도 이 경계를 통과한다

Java code가 `FileInputStream`, socket, database connection 같은 기능을 사용하면 Java method가 hardware를 직접 조작하는 것이 아니다. JVM과 native library를 거쳐 OS interface를 호출하고, 필요한 경우 system call을 통해 kernel service를 사용한다.

```text
Java code
   ↓
JVM / libc / native runtime
   ↓
System call boundary
   ↓
Linux kernel
   ↓
filesystem / network stack / driver
```

그래서 backend latency를 해석할 때 Java method 실행 시간과 kernel I/O wait를 구분할 필요가 있다. 또한 permission denied, descriptor limit, network error 같은 실패는 application business rule과 다른 OS/runtime layer의 실패다.

User/kernel mode의 핵심은 “kernel이 더 강력하다”는 정의가 아니다. **CPU privilege mechanism을 이용해 application이 시스템 전체 자원을 직접 제어하지 못하도록 만들고, 필요한 작업만 검증된 kernel entry를 통해 수행하게 하는 보호 구조**다.

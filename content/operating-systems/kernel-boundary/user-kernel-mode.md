---
kind: concept
contentKey: operating-systems.core.kernel-boundary.user-kernel-mode
topicContentKey: operating-systems.core.kernel-boundary
slug: user-kernel-mode
title: "User Mode와 Kernel Mode"
summary: "CPU privilege level을 나누어 application의 직접 hardware 접근을 제한하고 kernel service를 보호하는 이유를 설명한다."
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
# User Mode와 Kernel Mode

운영체제가 process를 서로 격리하려면 `application은 다른 process의 memory를 읽지 말아야 한다`는 규칙만으로는 부족하다. 버그나 악성 code가 규칙을 무시해도 hardware가 금지된 동작을 막을 수 있어야 한다.

그래서 CPU는 실행 권한 수준을 나누고 일반 application은 낮은 privilege의 user mode에서, kernel은 더 높은 privilege의 kernel mode에서 실행되도록 한다.

```text
User mode
  application code
      │
      │ controlled entry
      ▼
Kernel mode
  resource management / driver / protection
```

### User mode는 제한된 권한으로 실행된다

User process는 일반 계산과 자신의 virtual address space 접근을 수행할 수 있지만 page table, privileged control state, device register처럼 시스템 전체에 영향을 줄 수 있는 자원을 임의로 변경할 수는 없다.

필요한 kernel service가 있다면 system call처럼 architecture와 OS가 정한 entry를 사용해야 한다. Application이 원하는 kernel address로 단순 jump한다고 privilege를 얻는 구조가 아니다.

### Kernel mode 진입 원인은 하나가 아니다

System call은 application이 의도적으로 kernel service를 요청하는 경로다. 현재 instruction 실행 중 exception이 발생하거나 device/timer interrupt가 도착했을 때도 handler 처리를 위해 높은 privilege로 control이 넘어갈 수 있다.

이 원인들은 서로 다르지만 공통적으로 processor가 정의된 entry mechanism과 handler state를 사용한다.

### Mode switch와 context switch를 구분한다

같은 thread가 system call을 처리하기 위해 user mode에서 kernel mode로 들어갔다가 바로 돌아오면 privilege level은 바뀌었지만 다른 task로 실행 주체가 교체된 것은 아닐 수 있다.

반면 context switch는 scheduler가 다른 task를 선택해 register와 execution context를 바꾸는 사건이다.

```text
mode switch    → privilege boundary 변화
context switch → 실행 task 변화
```

System call이 block되면 그 결과로 context switch가 뒤따를 수 있지만 두 사건 자체는 같은 개념이 아니다.

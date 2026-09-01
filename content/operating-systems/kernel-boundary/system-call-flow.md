---
kind: concept
contentKey: operating-systems.core.kernel-boundary.system-call-flow
topicContentKey: operating-systems.core.kernel-boundary
slug: system-call-flow
title: "System Call Flow"
summary: "user request가 architecture-specific entry를 지나 kernel service를 실행하고 user space로 돌아오는 상태 변화를 추적한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/syscall.2.html"
    title: "Linux syscall(2)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux system-call ABI가 architecture별로 다른 instruction과 register convention을 사용하는 점을 확인한다."
    displayOrder: 1
---
# System Call Flow

System call을 “user mode에서 kernel mode로 바뀐다” 한 문장으로만 이해하면 실제로 어떤 state가 전달되고 어디에서 thread가 기다릴 수 있는지 알기 어렵다. 일반적인 흐름은 **user-space 준비 → architecture-specific kernel entry → syscall dispatch와 검증 → kernel service 실행 → return state 구성 → user space 복귀**로 볼 수 있다.

구체적인 register 이름과 entry instruction은 architecture마다 다르지만 역할은 비슷하다. Caller는 어떤 service를 원하는지 식별하는 syscall number와 arguments를 ABI가 정한 위치에 준비하고, CPU가 지원하는 controlled entry mechanism을 실행한다.

### 1. User space에서 요청을 준비한다

고수준 API나 library wrapper는 argument를 준비한다. 예를 들어 file read라면 file descriptor, destination buffer, 요청 byte 수 같은 정보가 필요하다.

```text
read(fd, userBuffer, length)
        │
        ├─ fd
        ├─ user-space address
        └─ length
```

이 시점까지는 wrapper 자체가 user space에서 동작할 수 있다. 실제 kernel service가 필요해지면 syscall ABI 경계를 통과한다.

### 2. CPU가 정해진 kernel entry로 control을 넘긴다

Application은 임의의 kernel function 주소로 jump해 privilege를 얻지 않는다. Architecture가 제공하는 system-call/trap mechanism이 현재 execution state를 바탕으로 정해진 entry로 control을 넘긴다. Kernel entry code는 user execution을 다시 이어가기 위해 필요한 state를 보존하고 syscall number와 argument를 읽을 수 있는 상태를 만든다.

이 과정은 **mode switch를 포함할 수 있지만 context switch와 동일하지 않다.** 같은 task가 kernel에서 syscall을 처리하고 곧바로 user mode로 돌아오면 다른 task로 CPU가 넘어가지 않았을 수 있다.

### 3. Kernel은 service를 찾고 argument를 검증한다

Kernel은 syscall number를 기준으로 적절한 handler/service로 dispatch한다. 그 뒤 file descriptor가 유효한지, caller가 해당 object에 접근할 권한이 있는지, user pointer와 length를 안전하게 사용할 수 있는지 등을 검사한다.

User pointer는 kernel pointer가 아니다. Kernel이 user memory와 데이터를 주고받을 때는 해당 address가 현재 process에서 접근 가능한지 고려해야 하며, user가 전달한 length나 flag도 신뢰할 수 없는 입력이다.

### 4. Service 실행 중 현재 task가 block될 수 있다

모든 system call이 오래 기다리는 것은 아니다. 단순 metadata 조회처럼 빠르게 끝날 수도 있다. 반면 필요한 I/O가 아직 완료되지 않았거나 resource를 기다려야 하는 blocking operation에서는 현재 task가 runnable 상태를 벗어나 sleep/wait 상태가 될 수 있다.

```text
syscall service 실행
       │
       ├─ 즉시 처리 가능 → return 준비
       │
       └─ 기다려야 함
             ↓
         task sleep/wait
             ↓
       다른 runnable task 실행 가능
             ↓
       event/completion 후 다시 runnable
```

이 경우 syscall 진입 자체가 곧 context switch를 뜻하는 것은 아니지만, **block된 결과 scheduler가 다른 task를 실행하면서 context switch가 뒤따를 수 있다.**

### 5. Return value와 execution state를 복원한다

Service가 끝나면 kernel은 성공 결과나 error를 ABI가 약속한 형태로 전달하고 user execution으로 돌아가기 위한 state를 복원한다. Library wrapper는 이 low-level return convention을 language/runtime에 맞는 return value나 exception/error API로 다시 변환할 수 있다.

중요한 것은 실패와 partial result를 호출자가 올바르게 해석하는 것이다. 예를 들어 I/O가 일부만 진행된 경우 “system call이 실패했다”와 “요청보다 적은 양을 정상 처리했다”는 다른 상태일 수 있다.

### Backend latency에서 이 흐름을 어떻게 읽는가

Backend thread가 socket read에서 오래 머문다고 해서 CPU가 그 thread의 Java code를 계속 실행하고 있다는 뜻은 아니다. Kernel에 요청한 뒤 wait 상태가 되어 CPU를 다른 task가 사용하고 있을 수 있다. 반대로 CPU-bound syscall이나 매우 잦은 짧은 syscall은 kernel/user boundary 자체의 비용과 kernel work를 증가시킬 수 있다.

따라서 request latency를 볼 때는 다음을 구분한다.

- user-space application/JVM code가 CPU를 사용한 시간
- kernel service가 CPU를 사용한 시간
- I/O나 resource를 기다리며 task가 실행되지 않은 시간
- scheduler가 다시 실행 기회를 줄 때까지의 지연

System Call Flow를 배우는 이유는 모든 kernel 구현 detail을 외우기 위해서가 아니다. **고수준 API 호출이 OS resource request로 바뀌고, 그 과정에서 validation·blocking·scheduling·return이 어떻게 연결되는지 인과관계로 이해하기 위해서**다.

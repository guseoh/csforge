---
kind: concept
contentKey: operating-systems.core.kernel-boundary.system-call-flow
topicContentKey: operating-systems.core.kernel-boundary
slug: system-call-flow
title: "System Call Flow"
summary: "user 요청이 controlled kernel entry를 지나 argument validation·service 실행·return으로 이어지는 상태 변화를 설명한다."
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

System call은 단순히 `user mode에서 kernel mode로 바뀐다`는 한 단계가 아니다. User space에서 요청을 준비하고, controlled entry를 지나 kernel이 argument를 검증하고 service를 실행한 뒤 결과를 다시 user space에 반환하는 흐름으로 볼 수 있다.

```text
user-space wrapper
      ↓
syscall number + arguments 준비
      ↓
controlled kernel entry
      ↓
validate / dispatch
      ↓
kernel service
      ↓
return value / error
      ↓
user space 복귀
```

### 1. User space에서 요청 정보를 준비한다

예를 들어 `read` 계열 요청이라면 file descriptor, user buffer address, 요청 길이 같은 argument가 필요하다. Runtime이나 library wrapper가 이 값을 system-call ABI에 맞게 준비한다.

### 2. CPU가 정해진 entry로 control을 넘긴다

Application은 임의의 kernel function으로 jump해 privilege를 얻지 않는다. Architecture가 제공하는 controlled entry mechanism을 통해 kernel handler로 들어가며, user execution을 다시 이어갈 수 있도록 필요한 state가 보존된다.

이 과정은 mode switch를 포함할 수 있지만 그 자체가 context switch를 뜻하지는 않는다.

### 3. Kernel이 argument를 검증하고 service를 실행한다

Kernel은 syscall number를 기준으로 요청을 dispatch하고 descriptor, permission, user pointer와 length 같은 입력을 확인한다.

Service가 즉시 끝날 수도 있지만 I/O나 resource를 기다려야 한다면 current task를 waiting 상태로 두고 scheduler가 다른 runnable task를 실행할 수 있다.

```text
service
  ├─ immediately ready → return
  └─ must wait → task sleeps → event → runnable → resume
```

### 4. 결과를 반환하고 user execution을 재개한다

Service가 끝나면 kernel은 success result, partial result 또는 error를 ABI에 맞게 전달하고 user mode로 돌아간다. Library/runtime은 이를 자신이 제공하는 API 형태로 다시 해석할 수 있다.

System call flow를 이해하는 핵심은 **kernel entry 자체보다 검증·blocking·scheduling·return이 하나의 resource 요청 lifecycle로 이어진다는 것**이다.

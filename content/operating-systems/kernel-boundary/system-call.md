---
kind: concept
contentKey: operating-systems.core.kernel-boundary.system-call
topicContentKey: operating-systems.core.kernel-boundary
slug: system-call
title: "System Call"
summary: "application이 kernel service를 요청하는 명시적 경계를 설명한다."
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

system call은 user application이 kernel이 소유한 service를 요청하는 ABI 경계다. file open, process creation, memory mapping, socket I/O는 library wrapper를 거쳐 syscall 번호와 인자로 kernel에 전달된다.

호출 결과는 return value와 error convention으로 돌아오며, blocking 여부와 partial result도 계약에 포함된다. library 함수가 편리한 예외나 buffer를 제공하더라도 underlying syscall의 상태 변화를 숨겨서 판단하면 안 된다.

### Backend 연결

Spring의 blocking I/O와 NIO 선택은 syscall과 thread 상태에 영향을 준다. 높은 수준 API를 사용할 때도 file descriptor, timeout, retry가 어느 경계에서 적용되는지 확인한다.


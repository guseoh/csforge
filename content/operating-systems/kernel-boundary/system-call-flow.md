---
kind: concept
contentKey: operating-systems.core.kernel-boundary.system-call-flow
topicContentKey: operating-systems.core.kernel-boundary
slug: system-call-flow
title: "System Call Flow"
summary: "trap entry부터 인자 검증·service·return까지의 상태 변화를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "OS와 kernel service의 경계를 확인한다."
    displayOrder: 1
---
# System Call Flow

일반적인 syscall은 user code가 trap instruction을 실행하면서 시작한다. CPU는 kernel entry와 privilege 상태로 전환하고, kernel은 syscall 번호·register·user pointer를 검증한 뒤 해당 service를 실행한다.

service가 blocking되면 process는 waiting 상태가 되고, 완료나 interrupt 뒤 다시 실행될 때 return path가 이어진다. 성공·partial result·error를 호출자에게 전달하고 user register를 복원해야 하므로 context 보존이 핵심이다.

### Backend 연결

DB나 socket 호출이 오래 걸릴 때 application thread가 어떤 상태인지 추적하면 pool 고갈 원인을 찾기 쉽다. retry는 syscall이 이미 일부 effect를 수행했을 가능성을 고려해 idempotency와 함께 설계한다.


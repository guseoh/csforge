---
kind: concept
contentKey: operating-systems.core.process.pcb
topicContentKey: operating-systems.core.process
slug: pcb
title: "Process Control Block"
summary: "scheduler가 process를 재개하는 데 필요한 PCB metadata를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process 생성과 주소 공간을 확인한다."
    displayOrder: 1
---
# Process Control Block

PCB는 process ID, state, saved registers, scheduling 정보, address-space reference, accounting 정보처럼 process를 중단했다 재개하는 데 필요한 kernel metadata다. 실제 구조와 필드 이름은 OS마다 다르지만 “실행 context의 소유 기록”이라는 역할은 같다.

context switch 때 CPU register 일부가 PCB나 관련 kernel stack에 저장되고 다음 process의 값이 복원된다. PCB를 갱신하는 순서가 틀리면 잘못된 주소 공간이나 priority로 process를 재개할 수 있다.

### Backend 연결

thread dump와 process metrics는 application 상태를 관찰하는 서로 다른 관점이다. CPU 사용률, runnable 수, blocked I/O를 함께 봐야 “코드가 느리다”와 “스케줄되지 못한다”를 구분할 수 있다.


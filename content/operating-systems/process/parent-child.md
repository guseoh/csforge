---
kind: concept
contentKey: operating-systems.core.process.parent-child
topicContentKey: operating-systems.core.process
slug: parent-child
title: "Parent and Child Process"
summary: "parent-child 관계와 descriptor·signal 상속의 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process 생성과 주소 공간을 확인한다."
    displayOrder: 1
---
# Parent and Child Process

parent는 process creation을 요청한 쪽이고 child는 그 결과로 만들어진 process다. fork 후 memory는 논리적으로 분리되지만 descriptor와 signal 관련 상태는 OS 규칙에 따라 일부 상속되므로 관계를 명시적으로 관리해야 한다.

부모가 child 종료를 wait하거나 signal로 제어할 수 있지만, child가 부모의 모든 application 상태를 공유하는 것은 아니다. 부모 종료·child 종료·재부모화는 서로 다른 lifecycle 사건이다.

### Backend 연결

서버가 subprocess를 실행할 때 parent shutdown이 child까지 정리되는지 확인한다. descriptor를 닫지 않으면 pipe EOF가 오지 않아 backend가 영원히 기다리는 문제가 생길 수 있다.


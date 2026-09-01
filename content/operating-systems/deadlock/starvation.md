---
kind: concept
contentKey: operating-systems.core.deadlock.starvation
topicContentKey: operating-systems.core.deadlock
slug: starvation
title: "Starvation"
summary: "system은 progress하지만 특정 execution만 자원·CPU 기회를 계속 얻지 못하는 starvation을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf"
    title: "Operating Systems: Three Easy Pieces — Common Concurrency Problems"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "deadlock의 dependency cycle, Coffman conditions와 prevention 전략을 확인한다."
    displayOrder: 1
---
# Starvation

### 전체가 멈추지 않아도 한 execution은 영원히 못 나갈 수 있다

starvation은 system의 다른 task들은 계속 progress하지만 특정 process/thread/request가 CPU, lock, queue service 같은 필요한 기회를 계속 얻지 못하는 liveness 문제다. deadlock처럼 참여자들이 서로 circular wait에 빠질 필요가 없다.

예를 들어 writer보다 reader를 항상 우선하는 read-write lock에서 reader가 계속 들어오면 writer가 ready 상태로 오래 기다릴 수 있다. scheduler priority에서도 high-priority task가 계속 도착하면 low-priority task가 CPU를 거의 못 받을 수 있다.

### 평균 throughput은 starvation을 숨길 수 있다

system 전체 throughput이 높아도 특정 task의 wait time이 무한히 커질 수 있다. 그래서 fairness를 보려면 평균 latency뿐 아니라 oldest task age, max/p99 wait, per-class service share를 봐야 한다.

### 해결책은 공정성을 어디에 넣을지 선택한다

aging, FIFO/fair lock, weighted queue, quota, minimum service guarantee 등으로 특정 class가 영원히 밀리지 않게 할 수 있다. 하지만 fairness를 강화하면 high-priority request의 response time이나 전체 throughput이 악화될 수 있다.

starvation 해결책은 priority inversion 해결책과도 구분한다. priority inheritance는 low-priority lock owner 때문에 high-priority waiter가 막히는 inversion을 다루는 protocol이지 일반적인 scheduling starvation의 만능 해법이 아니다.

Backend에서는 interactive request와 batch 작업을 같은 executor/queue에 둘 때 한쪽이 다른 쪽을 완전히 밀어내지 않는지 service share와 maximum wait를 관측해야 한다.

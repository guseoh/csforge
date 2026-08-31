---
kind: concept
contentKey: operating-systems.core.synchronization.read-write-lock
topicContentKey: operating-systems.core.synchronization
slug: read-write-lock
title: "Read-Write Lock"
summary: "동시 reader와 배타 writer의 허용 조건과 writer starvation을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Read-Write Lock

read-write lock은 동시에 여러 reader가 들어갈 수 있지만 writer는 모든 reader가 나간 뒤 배타적으로 진입하게 한다. read-heavy workload에서는 parallel read를 늘릴 수 있으나 writer가 계속 밀리거나 reader가 서로 조정하는 비용이 생긴다.

reader-preference와 writer-preference는 starvation 결과가 다르다. write 빈도, critical section 길이, 공정성 요구를 측정한 뒤 일반 mutex보다 실제로 유리한지 판단한다.

### Backend 연결

in-memory configuration snapshot처럼 read가 많고 write가 드문 state에 적용할 수 있다. DB transaction isolation과 JVM read-write lock의 역할은 다르므로 경계를 섞지 않는다.

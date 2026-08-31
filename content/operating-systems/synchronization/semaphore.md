---
kind: concept
contentKey: operating-systems.core.synchronization.semaphore
topicContentKey: operating-systems.core.synchronization
slug: semaphore
title: "Semaphore"
summary: "counter와 permit으로 resource 수를 제한하는 동작을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Semaphore

semaphore는 permit count를 가지며 acquire는 count가 있을 때 하나를 소비하고 release는 하나를 돌려준다. mutex와 달리 반드시 같은 thread가 release해야 하는 ownership abstraction은 아니어서 resource 수나 producer-consumer slot을 표현하는 데 맞다.

count의 초기값과 release 누락·중복을 invariant로 관리한다. binary semaphore를 mutex처럼 사용할 수 있어도 ownership, priority inheritance, error detection 같은 의미는 다를 수 있다.

### Backend 연결

DB connection과 외부 API 동시 호출 수를 semaphore로 제한할 수 있다. permit을 잡은 채 무한 retry하거나 timeout 뒤 반환하지 않으면 모든 worker가 대기한다.

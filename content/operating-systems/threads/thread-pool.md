---
kind: concept
contentKey: operating-systems.core.threads.thread-pool
topicContentKey: operating-systems.core.threads
slug: thread-pool
title: "Thread Pool"
summary: "worker 재사용·queue·backpressure로 thread pool의 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Thread Pool

thread pool은 worker thread를 미리 만들거나 필요에 따라 유지하고 task를 queue에서 가져오게 한다. 생성 비용을 amortize하고 동시 실행 수를 제한하는 대신 queue가 무한히 커지면 latency와 memory가 함께 악화된다.

bounded queue, rejection, cancellation, graceful shutdown을 명시해야 pool이 backpressure를 전달한다. worker가 task 안에서 같은 pool의 새 task를 기다리면 작은 pool에서 deadlock-like starvation이 생길 수 있다.

### Backend 연결

request executor와 background import executor를 분리하고 각각 queue·max size·shutdown을 관찰한다. queue에 쌓인 작업을 무한 재시도하지 말고 재시도 예산과 terminal failure를 기록한다.

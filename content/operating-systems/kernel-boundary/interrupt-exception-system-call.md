---
kind: concept
contentKey: operating-systems.core.kernel-boundary.interrupt-exception-system-call
topicContentKey: operating-systems.core.kernel-boundary
slug: interrupt-exception-system-call
title: "Interrupt, Exception and System Call"
summary: "세 진입 원인의 동기성·발생 주체·복귀 경계를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "OS와 kernel service의 경계를 확인한다."
    displayOrder: 1
---
# Interrupt, Exception and System Call

interrupt는 보통 device나 timer가 CPU 외부에서 비동기적으로 알리고, exception은 현재 instruction 실행 결과로 동기적으로 발생한다. system call은 application이 의도적으로 요청한 동기적 kernel 진입이라는 점에서 구별된다.

세 경우 모두 kernel handler가 저장된 return context를 바탕으로 복귀하지만, 재실행할 instruction과 오류 처리 정책이 다르다. 이 차이를 무시하면 interrupt를 일반 함수 호출처럼 다루거나 fault를 정상 결과로 오인한다.

### Backend 연결

timeout, signal, I/O readiness는 서로 다른 원인의 비동기 사건이다. 서버의 retry와 cancellation을 구현할 때 완료·취소·오류를 하나의 boolean으로 합치지 않는다.


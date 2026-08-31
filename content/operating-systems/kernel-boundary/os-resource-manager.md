---
kind: concept
contentKey: operating-systems.core.kernel-boundary.os-resource-manager
topicContentKey: operating-systems.core.kernel-boundary
slug: os-resource-manager
title: "OS as Resource Manager"
summary: "OS가 CPU·memory·device 자원을 process에 배분하는 역할을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "OS와 kernel service의 경계를 확인한다."
    displayOrder: 1
---
# OS as Resource Manager

운영체제는 process가 CPU, memory, device를 안전하게 사용하도록 자원을 추상화하고 배분한다. 각 process가 자원을 독점하는 것처럼 보이게 하면서 실제로는 scheduler, virtual memory, driver와 permission 정책을 조정한다.

자원 배분은 성능뿐 아니라 isolation과 회수 가능성의 문제다. 한 process가 무한히 CPU를 점유하거나 다른 process의 주소를 읽지 못하도록 kernel이 공유 규칙과 보호 경계를 제공한다.

### Backend 연결

Spring application의 thread, heap, file descriptor, connection pool도 OS 자원 위에 놓인다. timeout과 pool 상한을 정하지 않으면 application 정책이 kernel 자원 고갈로 이어질 수 있다.


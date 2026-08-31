---
kind: concept
contentKey: operating-systems.core.race-critical-section.shared-mutable-state
topicContentKey: operating-systems.core.race-critical-section
slug: shared-mutable-state
title: "Shared Mutable State"
summary: "여러 실행 흐름이 같은 변경 가능한 상태를 읽고 쓰는 위험을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Shared Mutable State

여러 thread가 같은 mutable state를 읽고 쓰면 각 연산의 순서와 visibility가 결과를 바꿀 수 있다. 공유 자체가 오류는 아니지만 invariant를 깨뜨리는 interleaving과 동기화 경계를 명확히 해야 한다.

불변 값, 소유권 이전, message passing으로 공유를 줄일 수 있고, 공유가 필요하면 atomic operation이나 lock을 선택한다. 보호 대상과 보호하는 lock을 문서화하지 않으면 부분적으로만 보호된 상태가 된다.

### Backend 연결

in-memory cache와 통계 counter를 여러 request가 변경할 때 DB transaction만으로 JVM heap race를 해결할 수 없다. 접근 경계를 코드와 테스트에서 함께 고정한다.

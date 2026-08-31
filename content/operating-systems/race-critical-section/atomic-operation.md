---
kind: concept
contentKey: operating-systems.core.race-critical-section.atomic-operation
topicContentKey: operating-systems.core.race-critical-section
slug: atomic-operation
title: "Atomic Operation"
summary: "관찰 중간 상태가 노출되지 않는 indivisible operation의 경계를 설명한다."
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
# Atomic Operation

atomic operation은 다른 thread가 중간 상태를 관찰하거나 일부만 수행된 상태에서 경쟁하지 않도록 하나의 indivisible transition으로 보이는 연산이다. 원자성은 visibility와 ordering을 자동으로 모두 보장한다는 뜻은 아니므로 memory model 계약을 함께 확인한다.

counter 증가처럼 한 변수의 단순 연산은 atomic primitive로 충분할 수 있지만 여러 필드의 invariant는 lock이나 transaction이 필요하다. “한 machine instruction”과 “application 의미상 원자적”인 경계를 혼동하지 않는다.

### Backend 연결

attempt count 증가와 duplicate 방지는 서로 다른 invariant다. atomic counter만으로 요청 전체의 exactly-once effect를 보장할 수 없으므로 저장소 constraint와 idempotency를 결합한다.

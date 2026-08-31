---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-avoidance
topicContentKey: operating-systems.core.deadlock
slug: deadlock-avoidance
title: "Deadlock Avoidance"
summary: "안전 상태를 유지하도록 자원 요청을 허용하는 판단을 설명한다."
level: 3
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
# Deadlock Avoidance

avoidance는 현재 요청을 허용한 뒤에도 모든 process가 필요한 resource를 얻어 끝날 수 있는 safe state인지 판단한다. Banker's algorithm처럼 최대 요구량을 알아야 하는 방식은 정보와 계산 비용을 요구한다.

safe state는 지금 당장 deadlock이 없다는 뜻보다 미래 요청까지 고려해 완료 순서를 만들 수 있다는 뜻이다. 실제 backend에서는 정확한 최대 요구량을 알기 어렵기 때문에 bounded lease와 timeout으로 단순화할 수 있다.

### Backend 연결

동시 작업 예산을 reserve할 때 남은 DB·memory·worker capacity로 승인 가능한지 계산한다. 승인 후 실제 사용량이 예측을 넘으면 제한·취소·보상 경로가 필요하다.


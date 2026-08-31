---
kind: concept
contentKey: operating-systems.core.race-critical-section.interleaving
topicContentKey: operating-systems.core.race-critical-section
slug: interleaving
title: "Interleaving"
summary: "두 thread의 read-modify-write가 교차하는 timeline을 추적한다."
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
# Interleaving

한 thread의 read-modify-write는 여러 machine instruction으로 나뉠 수 있다. 다른 thread가 중간에 실행되면 두 thread가 같은 이전 값을 읽고 마지막 write가 앞선 갱신을 덮어쓰는 lost update가 생긴다.

가능한 실행 순서를 시간선으로 적으면 원자성 요구와 race를 구체적으로 볼 수 있다. 단일 실행에서 문제가 재현되지 않았다는 사실은 scheduler가 다른 interleaving을 선택하지 않는다는 증거가 아니다.

### Backend 연결

동시 import에서 같은 content key를 검사하고 삽입하는 두 요청을 interleave로 테스트한다. unique constraint와 transaction은 애플리케이션의 check-then-act만 믿는 것보다 강한 경계를 제공한다.

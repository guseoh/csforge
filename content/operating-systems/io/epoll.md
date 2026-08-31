---
kind: concept
contentKey: operating-systems.core.io.epoll
topicContentKey: operating-systems.core.io
slug: epoll
title: "epoll"
summary: "관심 descriptor를 등록하고 readiness event를 받는 Linux 모델을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "I/O readiness와 completion 경계를 확인한다."
    displayOrder: 1
---
# epoll

epoll은 관심 있는 descriptor를 kernel instance에 등록하고, 준비된 event 집합을 반환받는 Linux readiness interface다. 기존 전체 목록을 매번 훑는 비용을 줄일 수 있지만, event를 받은 뒤 실제 read/write와 buffer 상태를 application이 관리한다.

level-triggered는 아직 처리할 상태가 있으면 다시 알리고, edge-triggered는 상태 변화 때만 알릴 수 있어 non-blocking drain loop가 필요하다. descriptor lifecycle과 close 후 event를 무시하는 규칙을 명확히 한다.

### Backend 연결

event-loop server에서 한 channel의 partial write가 다음 event까지 이어질 수 있다. 응답 buffer를 channel별로 보존하고 loop 안에서 DB나 파일 blocking을 실행하지 않는다.


---
kind: concept
contentKey: operating-systems.core.io.readiness-vs-completion
topicContentKey: operating-systems.core.io
slug: readiness-vs-completion
title: "Readiness versus Completion"
summary: "읽을 수 있음과 I/O 자체가 완료됨을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "I/O readiness와 completion 경계를 확인한다."
    displayOrder: 1
---
# Readiness versus Completion

readiness model은 descriptor에 read/write를 시도해도 block하지 않을 가능성을 알려주고, 실제 bytes 복사와 buffer 완료는 application이 수행한다. completion model은 kernel이나 runtime이 I/O 작업을 마친 뒤 결과를 전달한다.

두 모델을 섞으면 event를 받은 뒤 한 번만 read하고 남은 bytes를 잃거나, completion callback에서 다시 같은 작업을 시작하는 오류가 생긴다. level-triggered와 edge-triggered 이벤트의 drain 규칙도 구분한다.

### Backend 연결

selector/epoll loop는 ready event를 작업 완료로 기록하지 않는다. request body를 모두 읽었는지와 response write가 모두 끝났는지를 별도 state로 유지한다.


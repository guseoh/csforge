---
kind: concept
contentKey: operating-systems.core.process.process-state
topicContentKey: operating-systems.core.process
slug: process-state
title: "Process State"
summary: "new·ready·running·waiting·terminated 전이 원인을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process 생성과 주소 공간을 확인한다."
    displayOrder: 1
---
# Process State

new process는 생성된 뒤 ready queue에서 CPU를 기다리고, scheduler가 선택하면 running이 된다. I/O나 condition을 기다리면 waiting으로 이동하고, event가 발생하면 다시 ready가 되며 exit 이후 terminated가 된다.

상태는 단순한 라벨이 아니라 어떤 전이 원인이 다음 실행을 허용하는지 나타낸다. running process가 timer interrupt로 선점되어 ready가 되는 것과 I/O 완료로 waiting에서 ready가 되는 것은 원인이 다르다.

### Backend 연결

request worker의 queued, running, blocked, completed 상태를 process model처럼 명확히 분리하면 timeout과 retry를 안전하게 만든다. 이미 완료된 작업을 다시 실행하지 않도록 terminal state를 보호한다.


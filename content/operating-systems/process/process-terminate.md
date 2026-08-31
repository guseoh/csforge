---
kind: concept
contentKey: operating-systems.core.process.process-terminate
topicContentKey: operating-systems.core.process
slug: process-terminate
title: "Process Termination"
summary: "exit와 resource 회수, 종료 상태 전달의 순서를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process 생성과 주소 공간을 확인한다."
    displayOrder: 1
---
# Process Termination

process는 정상 exit나 signal·fault로 종료될 수 있다. kernel은 실행을 막고 address space와 대부분의 resource를 회수하지만, 부모가 종료 status를 읽기 전까지 최소 metadata가 남을 수 있다.

child가 끝났는데 부모가 회수하지 않으면 zombie가 되고, 부모가 먼저 사라지면 orphan 처리 규칙이 적용된다. 종료 status, signal 원인, cleanup 완료를 하나의 성공 flag로 합치지 않는다.

### Backend 연결

batch worker의 종료는 “작업이 실패했다”와 “process가 비정상 종료했다”를 구분해야 한다. 재시작 시 중복 effect를 막기 위해 작업 key와 checkpoint를 process lifecycle 밖에 보존한다.


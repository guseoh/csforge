---
kind: concept
contentKey: operating-systems.core.process.wait-reap
topicContentKey: operating-systems.core.process
slug: wait-reap
title: "Wait and Reap"
summary: "parent의 wait가 종료 child 상태를 회수하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process 생성과 주소 공간을 확인한다."
    displayOrder: 1
---
# Wait and Reap

child가 종료하면 parent가 `wait` 계열 호출로 종료 status와 resource metadata를 읽고 reap해야 kernel이 남겨둔 zombie 정보를 제거할 수 있다. wait는 아직 child가 실행 중이면 parent를 block할 수도 있다.

non-blocking wait나 signal handler를 사용할 때는 “child 없음”, “아직 실행 중”, “방금 종료됨”을 구분한다. 여러 child의 종료 순서가 임의라는 전제를 두고 특정 PID만 영원히 기다리지 않는다.

### Backend 연결

subprocess executor는 process 종료를 감지한 뒤 stdout/stderr drain, status 수집, resource close 순서를 정의한다. timeout 후 kill만 하고 reap하지 않으면 장기 실행 서비스에서 zombie가 누적된다.


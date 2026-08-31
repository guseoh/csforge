---
kind: concept
contentKey: operating-systems.core.process.process-create
topicContentKey: operating-systems.core.process
slug: process-create
title: "Process Creation"
summary: "spawn/fork와 address/resource 초기화의 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process 생성과 주소 공간을 확인한다."
    displayOrder: 1
---
# Process Creation

process 생성은 새 PID와 실행 context를 만들고, address space와 open resource를 어떤 방식으로 초기화할지 결정한다. `fork`는 부모 상태를 복제한 뒤 child가 다른 image를 실행할 수 있고, spawn 계열은 새 program을 직접 시작하는 모델이다.

복제된 descriptor가 같은 open-file state를 가리킬 수 있고 copy-on-write로 page를 지연 복사할 수 있으므로 “모든 메모리와 자원이 완전히 독립 복사된다”고 단정하지 않는다. 생성 실패와 resource limit도 결과 계약에 포함한다.

### Backend 연결

외부 process를 실행하는 backend는 command, environment, timeout, stdout/stderr, child cleanup을 함께 관리해야 한다. 사용자 입력을 command로 직접 이어 붙이지 않고 실행 경계를 고정한다.


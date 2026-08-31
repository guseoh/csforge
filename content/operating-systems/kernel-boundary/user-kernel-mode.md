---
kind: concept
contentKey: operating-systems.core.kernel-boundary.user-kernel-mode
topicContentKey: operating-systems.core.kernel-boundary
slug: user-kernel-mode
title: "User and Kernel Mode"
summary: "권한 수준과 mode 전환이 보호를 만드는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "OS와 kernel service의 경계를 확인한다."
    displayOrder: 1
---
# User and Kernel Mode

user mode의 code는 제한된 instruction과 주소에만 접근하고, kernel mode는 process 관리와 device 제어 같은 특권 작업을 수행한다. CPU가 현재 privilege level을 추적하므로 일반 application이 임의로 mode를 올릴 수 없다.

system call, interrupt, exception은 정해진 entry를 통해 kernel mode로 진입하게 한다. kernel은 return 전에 caller 상태와 인자를 확인하고 user mode로 복귀해야 하며, 검증 없는 pointer 사용은 보호 경계를 무너뜨린다.

### Backend 연결

JVM이나 native library가 파일·socket을 사용할 때 결국 system call 경계를 지난다. application 오류와 kernel 오류를 같은 예외로 뭉개지 말고 권한·resource limit 실패를 구분해 관측한다.


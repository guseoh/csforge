---
kind: concept
contentKey: operating-systems.core.kernel-boundary.privilege-protection
topicContentKey: operating-systems.core.kernel-boundary
slug: privilege-protection
title: "Privilege and Protection"
summary: "특권 instruction과 보호된 주소 접근의 실패 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "OS와 kernel service의 경계를 확인한다."
    displayOrder: 1
---
# Privilege and Protection

특권 instruction은 page table, interrupt controller, device register처럼 시스템 전체에 영향을 주는 상태를 바꾼다. user mode에서 이를 실행하면 CPU가 fault를 일으켜 kernel이 호출자를 격리하거나 종료할 수 있다.

주소 보호는 mode bit만으로 끝나지 않고 page permission, process address space, system call argument validation과 결합된다. “읽을 수 있다”와 “쓸 수 있다”, “실행할 수 있다”를 별도 권한으로 다루는 것이 중요하다.

### Backend 연결

서비스가 파일이나 socket에 접근할 때 OS 사용자·group·capability와 application 권한은 다른 층이다. 하나가 허용되어도 다른 층에서 거부될 수 있으므로 운영 장애에서 두 경계를 분리해 진단한다.


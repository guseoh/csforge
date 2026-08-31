---
kind: concept
contentKey: operating-systems.core.isolation.host-kernel-sharing
topicContentKey: operating-systems.core.isolation
slug: host-kernel-sharing
title: "Host Kernel Sharing"
summary: "container가 host kernel을 공유할 때 남는 경계와 위험을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process isolation과 namespace 경계를 확인한다."
    displayOrder: 1
---
# Host Kernel Sharing

container는 namespace로 많은 이름을 분리해도 host kernel, kernel vulnerability surface, 일부 device와 scheduler를 공유한다. VM처럼 완전히 별도 kernel인 강한 격리와는 threat model이 다르다.

privileged flag와 host network·PID·filesystem mount를 열면 편리하지만 격리 경계가 약해진다. 필요한 capability와 read-only mount만 허용하고 kernel·runtime patch를 운영 책임에 포함한다.

### Backend 연결

로컬 Docker Compose도 host bind mount와 privileged 설정이 backend 데이터에 직접 영향을 줄 수 있다. 개발 편의 설정을 production security boundary로 복사하지 않는다.


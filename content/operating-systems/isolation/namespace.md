---
kind: concept
contentKey: operating-systems.core.isolation.namespace
topicContentKey: operating-systems.core.isolation
slug: namespace
title: "Namespace"
summary: "process가 보게 되는 PID·network·mount 등의 이름 공간을 분리하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process isolation과 namespace 경계를 확인한다."
    displayOrder: 1
---
# Namespace

namespace는 process가 PID, mount, network, IPC, user 같은 kernel resource를 바라보는 관점을 분리한다. 같은 host kernel 위에서도 container 안 process가 다른 PID 목록이나 network interface를 보게 만들 수 있다.

namespace는 resource visibility와 naming을 바꾸지만 CPU·memory 사용량을 자동으로 제한하지는 않는다. privilege와 cgroup, filesystem permission을 함께 설정해야 실제 isolation 목표가 달성된다.

### Backend 연결

Docker에서 localhost, filesystem path, hostname은 host와 container에서 다른 의미를 가질 수 있다. 개발·운영 설정의 endpoint와 mounted path를 namespace 관점에서 검증한다.


---
kind: concept
contentKey: operating-systems.core.isolation.namespace
topicContentKey: operating-systems.core.isolation
slug: namespace
title: "네임스페이스(Namespace)"
summary: "프로세스가 보는 PID·마운트·네트워크 같은 자원 관점을 분리하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process가 resource view를 분리하는 Linux namespace와 일반 process 경계를 구분한다."
    displayOrder: 1
---
# 네임스페이스(Namespace)

Linux 네임스페이스는 프로세스가 특정 커널 자원을 **어떤 이름과 목록으로 보게 될지** 분리하는 메커니즘이다. 같은 호스트 커널을 사용하면서도 PID, 마운트, 네트워크, IPC, 호스트 이름, 사용자 ID 같은 자원 관점을 서로 다르게 만들 수 있다.

![같은 호스트 커널 위에서 네임스페이스별로 다른 자원 관점을 보는 구조](/learning/operating-systems/linux-namespace-view.svg)

### 자원 자체를 모두 복제하기보다 보이는 관점을 분리한다

PID 네임스페이스에서는 내부 프로세스가 별도의 PID 트리를 보고, 마운트 네임스페이스에서는 다른 마운트 테이블과 루트 관점을 볼 수 있다. 네트워크 네임스페이스는 네트워크 인터페이스, 라우팅 테이블, 소켓 이름 공간 등을 분리한다.

네임스페이스 종류마다 대상 자원과 생성·상속 계약이 다르므로 **네임스페이스 하나만 만들면 컨테이너 전체가 완성된다**고 설명하면 안 된다.

### 네임스페이스는 자원 사용량을 제한하지 않는다

프로세스가 별도 PID나 네트워크 관점을 본다고 CPU와 메모리 사용량에 자동으로 상한이 생기는 것은 아니다. 사용할 수 있는 자원의 양을 측정하고 제한하는 책임은 cgroup이나 다른 자원 제어 메커니즘에 있다.

또한 네임스페이스 안에서 어떤 객체가 보인다고 그 객체에 모든 연산을 수행할 수 있는 것도 아니다. 실제 접근 가능 여부는 파일 권한, capability, 마운트 설정 같은 별도 정책의 영향을 받는다.

네임스페이스의 핵심은 **같은 커널을 공유하면서 프로세스마다 특정 자원의 이름 공간과 관찰 가능한 관점을 분리한다는 것**이다.

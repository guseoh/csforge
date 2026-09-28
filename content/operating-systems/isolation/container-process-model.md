---
kind: concept
contentKey: operating-systems.core.isolation.container-process-model
topicContentKey: operating-systems.core.isolation
slug: container-process-model
title: "컨테이너 프로세스 모델(Container Process Model)"
summary: "컨테이너를 호스트 커널 위에서 실행되는 격리된 프로세스 환경으로 이해하는 모델을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process가 resource view를 분리하는 Linux namespace와 일반 process 경계를 구분한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/3661677"
    title: "Docker 기반 분산 트랜스코더 개발"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "Docker를 실제 process workload 배포 경계로 사용하면서 host OS 의존성과 resource 배치를 고려한 사례를 확인한다."
    displayOrder: 2
---
# 컨테이너 프로세스 모델(Container Process Model)

일반적인 Linux 컨테이너는 별도의 게스트 커널을 부팅한 가상 머신이 아니다. 호스트 커널 위에서 실행되는 프로세스와 프로세스 트리에 네임스페이스, cgroup, 권한, 파일 시스템 관점 같은 운영체제 메커니즘을 조합해 **독립된 실행 환경처럼 보이게 만든 것**이다.

![호스트 커널 위 프로세스 트리와 namespace/cgroup으로 구성되는 컨테이너](/learning/operating-systems/container-process-model.svg)

### 컨테이너의 중심에는 프로세스가 있다

컨테이너를 시작하면 진입점(entrypoint) 프로세스가 실행되고 그 아래 자식 프로세스가 만들어질 수 있다. 컨테이너 런타임은 이 프로세스 트리의 생명주기와 네임스페이스·cgroup 구성을 관리한다. 이미지는 실행 중인 프로세스 자체가 아니라 **파일 시스템과 실행 환경을 준비하기 위한 입력**이다.

### 격리는 여러 운영체제 기능의 조합이다

네임스페이스는 PID·마운트·네트워크 같은 자원 관점을 분리하고, cgroup은 CPU·메모리 같은 자원 사용을 관리한다. 권한과 capability는 어떤 특권 연산을 수행할 수 있는지 제한한다. 컨테이너라는 하나의 이름 뒤에서 서로 다른 운영체제 메커니즘이 각각 다른 책임을 가진다.

### 컨테이너 종료는 프로세스 생명주기와 연결된다

컨테이너의 주 프로세스가 종료되면 컨테이너 생명주기도 끝나는 것이 일반적이다. 또한 PID 네임스페이스의 init 역할을 맡은 프로세스에는 고아 프로세스 회수 같은 책임이 생길 수 있다. 하지만 **시그널 전달을 애플리케이션 자식에게 어떻게 중계할지는 별도의 supervisor·entrypoint 동작**이므로, PID 1이라는 이유만으로 자동 시그널 전달까지 보장된다고 보면 안 된다.

따라서 컨테이너를 "항상 살아 있는 작은 머신"보다 **호스트 커널 위에서 격리된 프로세스 환경과 그 생명주기**로 이해하는 것이 정확하다.

컨테이너 프로세스 모델의 핵심은 별도 커널을 가진 VM이 아니라 **호스트 커널 위의 프로세스들을 여러 격리·자원 제어 기능으로 묶은 실행 단위**라는 것이다.

---
kind: concept
contentKey: operating-systems.core.isolation.container-process-model
topicContentKey: operating-systems.core.isolation
slug: container-process-model
title: "컨테이너 프로세스 모델(컨테이너 프로세스 Model)"
summary: "컨테이너가 isolated 프로세스 environment라는 모델을 설명한다."
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
# 컨테이너 프로세스 모델(컨테이너 프로세스 Model)

일반적인 Linux 컨테이너는 별도의 guest 커널을 부팅한 virtual machine이 아니다. 호스트 커널 위에서 실행되는 프로세스와 프로세스 tree에 네임스페이스, cgroup, 권한, 파일 시스템 view 같은 OS 메커니즘을 조합해 **독립된 실행 환경처럼 보이게 만든 것**이다.

![호스트 커널 위 프로세스 tree와 네임스페이스/cgroup으로 구성되는 컨테이너](/learning/operating-systems/컨테이너-프로세스-model.svg)

### 컨테이너의 중심에는 프로세스가 있다

컨테이너를 시작하면 entrypoint 프로세스가 실행되고 그 아래 자식 프로세스가 만들어질 수 있다. 컨테이너 런타임은 이 프로세스 tree의 생명주기과 네임스페이스/cgroup 구성을 관리한다. Image는 실행 중인 프로세스가 아니라 파일 시스템과 실행 환경을 구성하기 위한 입력이다.

### 격리는 여러 OS primitive의 조합이다

네임스페이스는 PID·mount·네트워크 같은 view를 분리하고, cgroup은 CPU·메모리 같은 자원 사용을 관리한다. 권한과 capability는 어떤 privileged 연산을 할 수 있는지 제한한다. 컨테이너라는 하나의 이름 뒤에서 서로 다른 OS 메커니즘이 각각 다른 책임을 가진다.

### 컨테이너 종료는 프로세스 생명주기과 연결된다

컨테이너의 main 프로세스가 종료되면 컨테이너 생명주기도 종료되는 것이 일반적이다. 따라서 컨테이너를 "항상 살아 있는 작은 machine"보다 **격리된 프로세스 environment와 그 생명주기**로 이해하는 것이 정확하다.

컨테이너 프로세스 model의 핵심은 별도 커널을 가진 VM이 아니라 **호스트 커널 위의 프로세스들을 여러 격리/자원-control primitive로 묶은 실행 단위**라는 것이다.

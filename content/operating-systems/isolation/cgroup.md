---
kind: concept
contentKey: operating-systems.core.isolation.cgroup
topicContentKey: operating-systems.core.isolation
slug: cgroup
title: "cgroup"
summary: "프로세스 집합의 CPU·메모리 등 자원 사용량을 측정하고 제한하는 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/cgroups.7.html"
    title: "cgroups(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "프로세스 자원 제한과 컨테이너 경계를 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/7248350"
    title: "리눅스의 Control Groups 기능이 Kubernetes에 어떻게 적용되는지 살펴보기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "Kubernetes 자원 설정이 실제 Linux cgroup 메모리 설정으로 연결되는 과정을 운영 사례로 확인한다."
    displayOrder: 2
---
# cgroup

Linux cgroup은 프로세스들을 그룹으로 묶어 CPU, 메모리, I/O 같은 자원 사용량을 **측정하고 제한하거나 비중을 조정하는 메커니즘**이다. 네임스페이스가 프로세스가 보는 자원 관점을 분리한다면 cgroup은 프로세스 집합이 자원을 얼마나 사용할 수 있는지를 다룬다.

### 그룹 단위로 자원 정책을 적용한다

프로세스가 어느 cgroup에 속하는지에 따라 controller가 사용량을 집계하고 quota, weight, maximum 같은 정책을 적용할 수 있다. CPU controller는 실행 시간을 제한하거나 상대적인 비중을 조정할 수 있고, 메모리 controller는 그룹의 메모리 사용량과 pressure를 추적하며 상한을 적용할 수 있다.

구체적인 동작은 controller와 커널 설정에 따라 다르므로 모든 자원이 동일한 방식으로 제한된다고 가정하면 안 된다.

### 상한에 도달했을 때의 결과도 자원마다 다르다

CPU quota는 실행 가능한 작업이 있어도 일정 기간 throttling을 만들 수 있다. 메모리 압박에서는 reclaim이 발생하고, `memory.max` 같은 상한을 더 이상 만족할 수 없으면 해당 메모리 cgroup 안에서 OOM 처리가 일어날 수 있다. 하지만 **cgroup에 속한 모든 프로세스를 하나의 단위로 함께 종료하는 것은 기본 보장이 아니다.** 그런 동작은 `memory.oom.group` 같은 별도 정책과 구분해야 한다.

따라서 `cgroup 상한 초과 = 항상 즉시 프로세스 종료` 또는 `항상 그룹 전체 종료`처럼 단순화하면 안 된다.

### 네임스페이스와 역할이 다르다

네임스페이스는 PID, mount, 네트워크처럼 프로세스가 보는 자원의 이름 공간을 분리하고, cgroup은 CPU·메모리·I/O 사용량을 측정하고 제한한다. 컨테이너 환경에서는 두 메커니즘이 함께 사용될 수 있지만 **보이는 범위의 격리와 자원 제어는 서로 다른 책임**이다.

### 흐름으로 보기

```text
Process A ─┐
Process B ─┴──→ cgroup
                  ├─ CPU controller: quota / weight
                  ├─ memory controller: accounting / limit
                  └─ I/O controller: resource policy
```

네임스페이스는 프로세스가 보는 이름과 자원 관점을 나누고, cgroup은 묶인 프로세스들의 자원 사용을 측정·제어한다.

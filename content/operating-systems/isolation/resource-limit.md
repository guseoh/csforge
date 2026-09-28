---
kind: concept
contentKey: operating-systems.core.isolation.resource-limit
topicContentKey: operating-systems.core.isolation
slug: resource-limit
title: "자원 제한(Resource Limit)"
summary: "상한과 할당량이 과도한 자원 사용을 명시적인 실패로 바꾸는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/getrlimit.2.html"
    title: "getrlimit(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "soft/hard limit의 차이와 Linux RLIMIT_NPROC가 호출자의 real UID에 속한 프로세스 수(스레드 포함)를 세는 범위, 그리고 privileged process에 적용되지 않는 예외를 확인한다."
    displayOrder: 1
---
# 자원 제한(Resource Limit)

자원 제한(resource limit)은 프로세스에 적용되는 파일 디스크립터 수, 주소 공간 크기, 스택 크기 같은 자원의 상한을 두는 메커니즘이다. Linux `rlimit` 모델에서는 **soft limit**이 현재 적용되는 상한이고, **hard limit**은 일반 프로세스가 soft limit을 올릴 수 있는 최대 경계다.

### 상한은 무제한 사용을 명시적인 실패로 바꾼다

열린 파일 디스크립터 수가 상한에 도달하면 새 `open()`이나 소켓 생성이 실패할 수 있다. Linux `RLIMIT_NPROC`는 `fork()` 등으로 프로세스를 만들 때 호출자의 real UID에 속한 프로세스 수와 soft limit을 비교하며, Linux에서는 스레드도 이 수에 포함한다. 따라서 이 제한은 프로세스 하나가 만든 자식 수만 세는 per-process 상한이 아니다.

다만 Linux에서는 `RLIMIT_NPROC`를 모든 호출자에게 동일하게 강제하지 않는다. **real UID가 0이거나 `CAP_SYS_ADMIN` 또는 `CAP_SYS_RESOURCE` capability를 가진 프로세스에는 이 제한이 적용되지 않는다.** 따라서 운영 장애에서 `RLIMIT_NPROC`를 의심할 때는 숫자만 보는 것이 아니라 실제 UID와 capability 경계도 함께 확인해야 한다.

스택과 주소 공간 관련 제한도 각 연산의 실패 조건으로 작동할 수 있다. 중요한 점은 제한이 자원 누수(resource leak)나 과부하를 고치는 것이 아니라 **더 이상 사용할 수 없는 지점을 정의한다는 것**이다. 상한을 높이면 실패 시점이 늦어질 뿐 이미 존재하는 누수가 사라지지는 않는다.

### rlimit과 cgroup은 적용 범위가 다르다

`rlimit`은 주로 프로세스의 특정 자원 상한을 다룬다. cgroup은 여러 프로세스를 하나의 그룹으로 묶어 CPU·메모리·I/O 등의 사용량을 측정하고 제한한다. 둘 다 자원 제어에 쓰이지만 적용 범위와 실패 방식이 다르다.

파일 시스템 할당량이나 CPU 할당량처럼 다른 하위 시스템의 quota도 각각 별도 계약을 갖는다. 따라서 실제 장애를 해석할 때는 어떤 메커니즘의 어떤 상한에 도달했는지 확인해야 한다.

자원 제한의 핵심은 **자원 사용을 무한히 허용하지 않고, 프로세스가 감당할 수 있는 최대 범위를 운영체제 수준에서 명시적인 경계로 만드는 것**이다.

### 흐름으로 보기

```text
soft limit (현재 적용 상한) ≤ hard limit (일반 프로세스가 올릴 수 있는 soft 상한)
             │
             ▼
자원을 요청하는 연산
   ├─ 상한 미만: 연산이 계속 진행될 수 있음
   └─ 상한 도달: 자원별 오류나 실패 조건이 적용됨
```

Linux `RLIMIT_NPROC`는 프로세스 하나의 자식 수가 아니라 호출자의 real UID에 속한 프로세스 수를 기준으로 하며, Linux에서는 스레드도 그 수에 포함한다. 단, real UID 0 또는 `CAP_SYS_ADMIN`/`CAP_SYS_RESOURCE` 권한을 가진 프로세스에는 이 제한이 적용되지 않는다.

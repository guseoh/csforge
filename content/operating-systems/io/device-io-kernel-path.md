---
kind: concept
contentKey: operating-systems.core.io.device-io-kernel-path
topicContentKey: operating-systems.core.io
slug: device-io-kernel-path
title: "Device I/O Kernel Path"
summary: "application I/O 요청이 kernel object·driver·device를 거쳐 completion으로 돌아오는 책임 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.kernel.org/driver-api/index.html"
    title: "Linux Device Drivers API"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "kernel driver 계층이 다양한 device protocol을 공통 OS I/O 경계 뒤에 숨기는 역할을 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/47667"
    title: "TCP/IP 네트워크 스택 이해하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "Linux network I/O에서 NIC interrupt, NAPI polling, softirq와 driver가 연결되는 실제 사례를 확인한다."
    displayOrder: 2
---
# Device I/O Kernel Path

Application은 보통 storage controller나 NIC register를 직접 조작하지 않는다. File descriptor와 system call 같은 OS interface를 통해 요청을 kernel에 전달하고, kernel object·filesystem/network layer와 device driver가 hardware-specific 동작을 처리한다.

![application I/O 요청이 kernel과 driver/device를 거쳐 완료되는 경로](/learning/operating-systems/device-io-kernel-path.svg)

단순화하면 다음 흐름으로 볼 수 있다.

```text
application
   ↓ system call
kernel I/O object
   ↓
driver
   ↓
device
   ↓ completion/event
kernel
   ↓
application 진행 가능
```

### 요청 제출과 hardware completion은 같은 순간이 아니다

Kernel이나 driver가 요청을 device queue에 넣은 뒤 실제 transfer는 나중에 진행될 수 있다. Device completion은 interrupt, polling, completion queue 등 다양한 방식으로 kernel에 전달될 수 있다.

DMA와 interrupt의 hardware 역할은 Computer Architecture에서 다룬다. OS 관점에서 중요한 것은 **application request와 device completion 사이에 kernel/driver가 request state와 waiting task를 관리한다는 점**이다.

### 호출자가 기다리는 방식은 I/O model에 따라 달라진다

Blocking I/O는 조건이 충족될 때까지 task가 기다릴 수 있고, non-blocking I/O는 지금 progress할 수 없으면 즉시 반환할 수 있다. Readiness API는 다시 I/O를 시도할 조건을 알려주며, completion API는 이미 제출한 operation의 결과를 나중에 전달한다.

Device I/O Kernel Path의 핵심은 **application의 I/O 요청과 실제 device operation 사이를 kernel과 driver가 중개하며, 요청 제출·device completion·application-visible 완료가 서로 다른 단계라는 점**이다.
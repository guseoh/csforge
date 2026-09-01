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
---
# Device I/O Kernel Path

application은 일반적으로 network card, disk controller 같은 device register를 직접 조작하지 않는다. file descriptor와 `read`/`write`/`ioctl` 같은 system-call interface를 통해 kernel object에 요청을 전달하고, kernel과 device driver가 hardware-specific protocol을 처리한다. 이 경계 덕분에 application은 device마다 다른 command register나 DMA descriptor 형식을 직접 알지 않아도 된다.

### 한 번의 I/O 요청에는 여러 단계가 있다

간단한 device read를 mental model로 보면 다음과 같이 나눌 수 있다.

`application → syscall entry → kernel object/filesystem/socket layer → driver → device/DMA → interrupt 또는 completion state → kernel → application`

모든 device가 정확히 이 순서나 같은 메커니즘을 쓰는 것은 아니지만, **요청 제출과 실제 hardware completion이 같은 순간이 아니라는 점**이 중요하다. driver는 request를 queue에 넣고 device가 DMA로 memory를 갱신하도록 설정할 수 있으며, 이후 interrupt나 polling/completion queue를 통해 완료를 인식할 수 있다.

### 기다리는 방식은 API와 object에 따라 달라진다

blocking read라면 현재 task를 sleep state로 보내고 completion/readiness 뒤 깨울 수 있다. non-blocking descriptor라면 지금 progress할 수 없을 때 `EAGAIN`처럼 즉시 반환할 수 있다. readiness API는 `이 descriptor에서 지금 I/O를 시도할 가치가 있다`는 상태를 알려주고, completion API는 이미 제출한 operation의 결과를 나중에 전달한다.

따라서 `device가 완료했다`, `descriptor가 readable하다`, `application이 원하는 전체 message를 읽었다`는 서로 다른 상태다.

### Interrupt와 DMA의 역할도 구분한다

DMA는 device가 CPU가 byte마다 복사하지 않고 memory와 data를 전송하는 메커니즘이고, interrupt는 CPU/kernel에 사건을 알리는 메커니즘이다. `DMA가 끝났으니 interrupt가 반드시 한 번 발생한다`처럼 1:1 관계로 일반화하지 않는다. batching, polling, interrupt moderation처럼 구현마다 completion notification 전략이 다를 수 있다.

### Backend에서 어디까지 볼 것인가

HTTP request가 느릴 때 application method 시간만 보면 실제 wait 위치를 놓칠 수 있다. socket receive 대기, file read, storage queue, downstream network처럼 kernel/device wait가 포함될 수 있다. thread state, syscall latency, queue depth와 device/network metrics를 함께 보되, hardware 세부 tuning을 application correctness의 기본 전제로 만들지는 않는다.

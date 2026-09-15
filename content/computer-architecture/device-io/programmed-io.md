---
kind: concept
contentKey: computer-architecture.core.device-io.programmed-io
topicContentKey: computer-architecture.core.device-io
slug: programmed-io
title: "Programmed I/O와 Polling"
summary: "CPU가 device status와 data register를 직접 확인하며 전송을 진행하는 programmed I/O의 흐름과 polling 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.kernel.org/6.7/driver-api/device-io.html"
    title: "Linux Kernel: Bus-Independent Device Accesses"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "device register I/O accessors와 MMIO 접근 경계를 확인한다."
    displayOrder: 1
---
# Programmed I/O와 Polling

Programmed I/O에서는 CPU가 device의 control/status/data register를 직접 읽고 쓰며 I/O 진행을 제어한다. 가장 단순한 형태는 polling이다. CPU가 device의 ready 상태를 반복해서 확인하고, 준비되면 data register를 읽거나 쓴다.

```text
CPU ── read status ──> device
CPU ── read status ──> device
CPU ── read status ──> device
             │ ready
             ▼
       read/write data
```

### Polling은 단순하지만 CPU가 기다림에 참여한다

Device가 빠르게 준비되고 polling 시간이 매우 짧다면 control flow가 단순하다는 장점이 있다. 하지만 device가 CPU보다 훨씬 느리면 CPU는 ready가 될 때까지 status register를 반복해서 확인하는 데 cycle을 소비한다.

Polling 주기를 짧게 하면 completion을 빠르게 발견할 수 있지만 CPU와 interconnect 사용량이 늘어난다. 반대로 polling 빈도를 낮추면 CPU 사용량은 줄어도 완료를 알아차리는 시간이 늦어질 수 있다.

### Device register access는 일반 memory load와 같다고 가정하지 않는다

Status나 data register는 normal cacheable RAM이 아닐 수 있다. Read 자체가 device side effect를 만들거나, bus access 비용과 ordering 규칙이 일반 memory와 다를 수 있다.

그래서 programmed I/O를 이해할 때는 단순히 `while` loop가 돈다는 사실보다 **CPU가 device register를 직접 확인하고 data movement에 계속 관여한다**는 점이 중요하다.

### Interrupt와 DMA는 다른 부담을 줄이는 방법이다

Interrupt-driven I/O는 CPU가 device를 계속 polling하지 않고 completion event를 알림받게 한다. DMA는 더 나아가 bulk data transfer 자체를 CPU가 byte마다 수행하지 않게 한다.

둘은 programmed I/O와 비교할 수 있는 다른 mechanism이지만 세부 동작은 뒤 Concept에서 각각 다룬다.

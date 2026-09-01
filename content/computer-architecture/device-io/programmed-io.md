---
kind: concept
contentKey: computer-architecture.core.device-io.programmed-io
topicContentKey: computer-architecture.core.device-io
slug: programmed-io
title: "Programmed I/O"
summary: "CPU가 device status와 data register를 직접 polling하며 전송하는 흐름과 interrupt/DMA trade-off를 설명한다."
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
# Programmed I/O

### CPU가 device의 진행 상태를 직접 확인한다

Programmed I/O에서는 CPU가 device control/status register를 읽고 쓰면서 I/O 진행을 직접 제어한다. 가장 단순한 형태는 polling이다. CPU가 status register의 ready bit를 반복해서 확인하고, device가 준비되면 data register를 읽거나 쓴다.

```text
CPU
 │ read status
 │ read status
 │ read status
 │ ...
 │ ready
 ▼
read/write data register
```

이 방식은 control flow가 단순하고 아주 짧은 device operation에서는 interrupt setup보다 유리할 수도 있다. 하지만 device가 CPU보다 훨씬 느리다면 ready를 기다리는 동안 CPU cycle을 계속 소비한다.

### Polling의 비용은 '반복문이 있다'보다 더 넓다

Busy polling은 instruction execution뿐 아니라 interconnect와 MMIO access를 반복할 수 있다. Status register가 normal cacheable memory가 아니라 device register라면 일반 load처럼 cheap하다고 가정할 수 없다. Poll interval을 줄이면 completion을 빨리 감지할 수 있지만 CPU와 bus traffic을 더 많이 사용한다.

반대로 polling interval을 너무 길게 잡으면 CPU 사용량은 낮아져도 completion latency가 증가한다. 그래서 polling은 CPU cost와 response latency 사이에서 trade-off를 가진다.

### Interrupt-driven I/O는 기다리는 CPU를 다른 일에 쓸 수 있게 한다

Interrupt-driven I/O에서는 CPU가 device를 시작시킨 뒤 다른 work를 수행하고, device가 completion 또는 status change를 interrupt로 알린다. 느리거나 드문 event에서는 busy polling보다 CPU 효율이 좋을 수 있다.

하지만 interrupt도 공짜가 아니다. Trap entry, context save/restore, driver handler와 scheduling 비용이 생긴다. 매우 높은 event rate에서는 interrupt overhead가 커져 polling 또는 interrupt moderation/batching이 더 나은 경우도 있다.

### DMA는 '누가 bytes를 옮기느냐'까지 바꾼다

Interrupt는 CPU에게 event를 알리는 mechanism이고, DMA는 bulk data transfer를 CPU의 byte-by-byte copy에서 분리하는 mechanism이다. 둘은 대체 관계가 아니라 함께 사용할 수 있다. CPU가 descriptor를 준비하고 DMA를 시작한 뒤, device가 transfer를 마치면 interrupt나 completion queue로 알리는 식이다.

```text
CPU setup → device/DMA transfer → completion notification → CPU consumes result
```

Programmed I/O, interrupt-driven I/O, DMA를 비교할 때는 event frequency, transfer size, CPU budget, latency requirement와 device capability를 함께 본다. Backend에서 busy loop가 CPU를 많이 쓴다고 곧바로 DMA가 정답인 것은 아니며, 실제 kernel/driver path가 어떤 mechanism을 사용하는지 측정해야 한다.

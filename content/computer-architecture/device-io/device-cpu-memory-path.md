---
kind: concept
contentKey: computer-architecture.core.device-io.device-cpu-memory-path
topicContentKey: computer-architecture.core.device-io
slug: device-cpu-memory-path
title: "Device, CPU and Memory Path"
summary: "descriptor 준비부터 DMA·completion·interrupt·software consumption까지 device I/O의 end-to-end data path를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.kernel.org/core-api/dma-api-howto.html"
    title: "Dynamic DMA Mapping Guide"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DMA buffer ownership, mapping과 CPU/device synchronization 경계를 확인한다."
    displayOrder: 1
---
# Device, CPU and Memory Path

### I/O는 device와 application 사이의 한 번짜리 복사가 아니다

네트워크 packet이나 storage block이 application에 도착하기까지 여러 hardware/software state를 거친다. 단순화한 receive path에서는 CPU/driver가 descriptor와 buffer를 준비하고 device가 data를 수신한 뒤 DMA로 memory에 기록한다. Device가 completion state를 남기면 interrupt 또는 polling이 software에 진행 가능함을 알리고, kernel/driver가 해당 buffer를 protocol stack이나 application 쪽으로 넘긴다.

```text
CPU/driver: descriptor + buffer 준비
               │
               ▼
            device
               │
               │ DMA
               ▼
             memory
               │
        completion status
               │
      interrupt / polling
               ▼
        kernel/driver 처리
               │
               ▼
       application-visible data
```

그래서 `device가 data를 받음`, `DMA가 끝남`, `interrupt 발생`, `read()가 반환`, `application 처리가 끝남`은 서로 같은 시점이 아니다.

### Descriptor와 buffer에는 ownership 상태가 있다

CPU가 device에 descriptor를 제출했다면 그 buffer를 device가 사용하는 동안 software가 마음대로 재사용하면 안 된다. DMA completion 이전에 buffer를 덮어쓰거나 free하면 device가 잘못된 memory를 읽거나 쓰게 된다.

반대로 DMA가 완료된 뒤에도 CPU가 buffer를 사용하기 전에 platform/API가 요구하는 sync나 memory ordering을 지켜야 할 수 있다. DMA Concept에서 다룬 것처럼 device가 사용하는 DMA address와 CPU virtual address도 같은 숫자라고 가정할 수 없다.

### Completion notification과 실제 work completion을 구분한다

Interrupt는 일반적으로 '확인할 일이 생겼다'는 notification이다. Handler가 들어왔다고 application I/O가 끝난 것은 아니다. Driver가 completion queue를 읽고 descriptor 상태와 byte count/error를 확인해야 하고, 이후 protocol parsing, copy 또는 page mapping, scheduler wakeup 같은 software 단계가 더 남을 수 있다.

같은 이유로 queue에 request를 넣었다는 사실과 device가 transfer를 끝냈다는 사실도 다르다. Queue depth를 키우면 device utilization과 throughput이 좋아질 수 있지만 queuing latency와 in-flight memory 사용량도 증가한다.

### Error와 cancellation도 각 단계마다 다르게 나타난다

Device error, DMA mapping failure, partial transfer, timeout, interrupt loss/overload, software queue overflow는 서로 다른 failure다. End-to-end I/O를 단순히 성공/실패 한 bit로 보면 어느 층에서 복구해야 하는지 알기 어렵다.

Backend 성능 분석에서는 application latency만 보지 않고 NIC/storage queue depth, DMA/completion latency, interrupt/softirq CPU time, kernel socket/file buffer와 user-space copy 경계를 함께 본다. `send()` 또는 `write()`가 반환한 시점이 physical device 전송 또는 durable storage 완료 시점과 같다는 가정도 API contract 없이 하지 않는다.

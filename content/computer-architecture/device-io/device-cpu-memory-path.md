---
kind: concept
contentKey: computer-architecture.core.device-io.device-cpu-memory-path
topicContentKey: computer-architecture.core.device-io
slug: device-cpu-memory-path
title: "Device·CPU·Memory I/O 경로"
summary: "descriptor 준비부터 DMA·completion·interrupt 또는 polling·software consumption까지 device I/O의 end-to-end data path를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.kernel.org/core-api/dma-api-howto.html"
    title: "Dynamic DMA mapping Guide"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "coherent·streaming mapping, DMA ownership과 sync 시점을 확인한다."
    displayOrder: 1
---
# Device·CPU·Memory I/O 경로

지금까지 본 programmed I/O, MMIO, DMA와 interrupt는 실제 I/O 경로에서 서로 연결되어 사용될 수 있다. Device에서 application-visible data까지 도달하는 과정을 하나의 흐름으로 보면 각 mechanism의 역할을 구분하기 쉽다.

Receive 또는 read path를 단순화하면 CPU/driver가 먼저 descriptor와 buffer를 준비하고 device가 data를 받은 뒤 DMA로 memory에 기록할 수 있다. Transfer가 끝나면 completion state를 남기고 interrupt 또는 polling으로 software가 이를 확인한다.

```text
CPU/driver
  descriptor + buffer 준비
            ↓
          device
            ↓ DMA
          memory
            ↓
     completion state
            ↓
 interrupt / polling
            ↓
   software가 data 소비
```

### 각 단계의 완료 시점은 서로 다르다

다음 사건은 같은 시점이 아니다.

- device가 외부 data를 받았다.
- DMA가 memory write를 끝냈다.
- completion entry가 준비됐다.
- interrupt가 CPU에 전달됐다.
- handler 또는 polling code가 completion을 확인했다.
- 상위 software가 data를 사용하기 시작했다.

이 구분이 중요한 이유는 어느 단계에서 기다리고 있는지에 따라 지연 시간의 원인과 다음 동작이 달라지기 때문이다.

### Buffer ownership도 단계에 따라 이동한다

CPU가 descriptor를 제출해 device에 buffer를 넘긴 동안에는 software가 그 buffer를 임의로 재사용하면 안 된다. DMA completion 이후 필요한 synchronization을 마친 뒤 다시 CPU가 buffer를 소유하고 처리할 수 있다.

```text
CPU prepares
   ↓ hand-off
Device transfers
   ↓ completion
CPU reclaims
```

### Notification과 data movement를 분리한다

DMA는 data transfer를 담당하고, interrupt나 polling은 completion을 알아차리는 방법이다. Interrupt handler에 들어왔다는 사실만으로 application-level I/O가 모두 끝난 것도 아니다. Software는 completion 상태와 byte count/error를 확인하고 다음 처리 단계로 넘겨야 한다.

이 Topic의 핵심은 I/O를 `CPU가 device에서 값을 한 번 읽는다`는 단일 동작으로 보지 않는 것이다. **제어 register 접근, data transfer, completion notification과 software consumption이 서로 다른 단계로 이어진다.**

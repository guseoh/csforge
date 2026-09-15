---
kind: concept
contentKey: computer-architecture.core.device-io.dma
topicContentKey: computer-architecture.core.device-io
slug: dma
title: "DMA"
summary: "CPU가 buffer와 descriptor를 준비한 뒤 device가 memory 사이의 bulk data transfer를 수행하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.kernel.org/core-api/dma-api-howto.html"
    title: "Dynamic DMA mapping Guide"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "coherent·streaming mapping, DMA ownership과 sync 시점을 확인한다."
    displayOrder: 1
---
# DMA

DMA(Direct Memory Access)는 CPU가 data의 각 byte를 직접 load/store하지 않고, device 또는 DMA engine이 memory와 device 사이의 bulk transfer를 수행하도록 하는 mechanism이다.

CPU는 먼저 transfer에 필요한 buffer 주소, 길이, 방향과 descriptor를 준비한다. 이후 device가 transfer를 진행하고 completion 또는 error 상태를 남긴다.

```text
CPU
 ├─ buffer/descriptor 준비
 └─ DMA 시작
        ↓
device ⇄ memory
        ↓
completion / error
```

### CPU 개입을 줄이지만 CPU가 완전히 사라지는 것은 아니다

DMA를 사용해도 CPU는 buffer를 준비하고 device를 설정하며 완료 결과를 처리해야 한다. 줄어드는 것은 **실제 data block을 byte마다 CPU instruction으로 복사하는 부담**이다.

이 덕분에 CPU는 transfer가 진행되는 동안 다른 작업을 수행할 수 있고, 큰 data를 옮길 때 CPU 사용량을 줄일 수 있다.

### Buffer에는 ownership 경계가 있다

CPU가 device에 DMA buffer를 넘긴 뒤 transfer가 끝나기 전에 그 buffer를 재사용하거나 덮어쓰면 device가 잘못된 data를 읽거나 쓸 수 있다. 반대로 device가 memory에 쓴 뒤 CPU가 data를 사용하기 전에 platform이 요구하는 synchronization을 거쳐야 할 수 있다.

```text
CPU owns buffer
      ↓ hand off
Device/DMA owns buffer
      ↓ completion
CPU reclaims buffer
```

DMA address 역시 CPU의 application virtual address와 같은 숫자라고 가정할 수 없다. IOMMU나 bus mapping을 통해 device가 사용하는 address가 따로 정해질 수 있다.

### DMA와 interrupt는 다른 역할이다

DMA는 **누가 data를 옮기는가**를 바꾸고, interrupt는 **완료나 event를 CPU에 어떻게 알리는가**와 관련된다. DMA transfer가 끝난 뒤 interrupt로 completion을 알릴 수도 있고, software가 completion queue를 polling할 수도 있다.

따라서 DMA와 interrupt는 서로 대체하는 하나의 선택지가 아니라 함께 조합될 수 있는 mechanism이다.

---
kind: concept
contentKey: computer-architecture.core.device-io.dma
topicContentKey: computer-architecture.core.device-io
slug: dma
title: "직접 메모리 접근(DMA)"
summary: "CPU가 버퍼와 디스크립터를 준비한 뒤 장치가 메모리와 장치 사이의 대량 데이터 전송을 수행하는 흐름을 설명한다."
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
# 직접 메모리 접근(DMA)

DMA(Direct Memory Access)는 CPU가 데이터의 각 바이트를 직접 load/store하지 않고, 장치 또는 DMA 엔진이 메모리와 장치 사이의 대량 전송을 수행하도록 하는 메커니즘이다.

CPU는 먼저 전송에 필요한 버퍼 주소, 길이, 방향과 디스크립터를 준비한다. 이후 장치가 전송을 진행하고 완료 또는 오류 상태를 남긴다.

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

DMA를 사용해도 CPU는 버퍼를 준비하고 장치를 설정하며 완료 결과를 처리해야 한다. 줄어드는 것은 **실제 데이터 블록을 바이트마다 CPU 명령어로 복사하는 부담**이다.

이 덕분에 CPU는 전송이 진행되는 동안 다른 작업을 수행할 수 있고, 큰 데이터를 옮길 때 CPU 사용량을 줄일 수 있다.

### 버퍼에는 소유권 경계가 있다

CPU가 장치에 DMA 버퍼를 넘긴 뒤 전송이 끝나기 전에 그 버퍼를 재사용하거나 덮어쓰면 장치가 잘못된 데이터를 읽거나 쓸 수 있다. 반대로 장치가 메모리에 쓴 뒤 CPU가 데이터를 사용하기 전에 플랫폼이 요구하는 동기화를 거쳐야 할 수 있다.

```text
CPU owns buffer
      ↓ hand off
Device/DMA owns buffer
      ↓ completion
CPU reclaims buffer
```

DMA 주소 역시 CPU의 애플리케이션 가상 주소와 같은 숫자라고 가정할 수 없다. IOMMU나 버스 매핑을 통해 장치가 사용하는 주소가 따로 정해질 수 있다.

### DMA와 인터럽트는 다른 역할이다

DMA는 **누가 데이터를 옮기는가**를 바꾸고, 인터럽트는 **완료나 이벤트를 CPU에 어떻게 알리는가**와 관련된다. DMA 전송이 끝난 뒤 인터럽트로 완료를 알릴 수도 있고, 소프트웨어가 완료 큐를 폴링할 수도 있다.

따라서 DMA와 인터럽트는 서로 대체하는 하나의 선택지가 아니라 함께 조합될 수 있는 메커니즘이다.

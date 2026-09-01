---
kind: concept
contentKey: computer-architecture.core.device-io.dma
topicContentKey: computer-architecture.core.device-io
slug: dma
title: "DMA"
summary: "DMA controller가 CPU 대신 memory 전송을 수행하는 흐름을 설명한다."
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

CPU가 buffer 주소·길이·방향을 controller에 설정하면 DMA가 device와 memory 사이에서 block을 옮기고 완료나 오류 interrupt를 보낸다. CPU는 byte마다 개입하지 않아 bulk transfer를 다른 계산과 겹칠 수 있지만, cache coherence·IOMMU·buffer ownership을 맞춰야 한다. device가 사용하는 DMA 주소는 IOMMU나 bus mapping 때문에 CPU가 보는 virtual/physical address와 같다고 가정할 수 없다.

CPU가 buffer를 바꾼 직후 DMA가 읽거나 DMA가 쓴 buffer를 CPU cache가 읽으면 stale copy가 될 수 있다. coherent mapping을 쓸지 streaming mapping에서 map/unmap·sync를 수행할지는 platform과 API 계약으로 결정한다. CPU가 device에 buffer ownership을 넘긴 동안에는 buffer를 수정·재사용하지 않고, 완료 후 필요한 memory barrier와 sync를 거쳐 ownership을 되찾는다.

네트워크·storage throughput을 평가할 때 CPU 사용률이 낮다고 전송이 free인 것은 아니다. buffer lifetime, completion queue, backpressure와 error recovery를 함께 설계한다.

---
kind: concept
contentKey: computer-architecture.core.device-io.memory-mapped-io
topicContentKey: computer-architecture.core.device-io
slug: memory-mapped-io
title: "Memory-Mapped I/O"
summary: "device register를 address space에 매핑할 때 일반 memory와 달라지는 side effect·cacheability·ordering을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.kernel.org/6.7/driver-api/device-io.html"
    title: "Linux Kernel: Bus-Independent Device Accesses"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "device register I/O accessors와 MMIO 접근 경계를 확인한다."
    displayOrder: 1
---
# Memory-Mapped I/O

### 주소는 memory처럼 보여도 대상은 device register일 수 있다

Memory-Mapped I/O(MMIO)는 device의 control/status/data register를 CPU address space의 특정 range에 배치하고 load/store 형태의 access로 조작하는 방식이다. Processor 입장에서는 address를 만들어 read/write한다는 점이 RAM 접근과 닮았지만, 그 address 뒤에 있는 대상과 semantics는 완전히 다를 수 있다.

RAM read는 보통 저장된 data를 읽는 동작이지만 MMIO read는 device status를 조회하거나 FIFO에서 값을 소비하는 side effect를 만들 수 있다. MMIO write는 단순히 byte를 저장하는 것이 아니라 device operation 시작, interrupt clear, queue doorbell 같은 command가 될 수 있다.

### 일반 pointer dereference처럼 다루면 안 되는 이유

Device register는 접근 폭, byte order와 sequence를 device specification이 요구할 수 있다. 32-bit register를 두 번의 16-bit access로 나눠도 동일하다고 보장할 수 없고, 특정 status register는 read-to-clear semantics를 가질 수도 있다.

Linux에서는 portable driver가 MMIO mapping에 `__iomem` token과 `readl()/writel()` 같은 accessor를 사용하는 이유도 이 차이 때문이다. Architecture에 따라 실제 mapping이나 I/O instruction이 다를 수 있으므로 normal pointer access의 동작을 그대로 가정하지 않는다.

### Cacheability와 ordering도 normal memory와 다를 수 있다

Device status register를 일반 RAM처럼 CPU cache에 오래 보관하면 hardware가 바꾼 최신 state를 보지 못할 수 있다. 그래서 MMIO mapping에는 적절한 memory attribute가 필요하고, driver API가 제공하는 accessor와 barrier/ordering rule을 따라야 한다.

또한 MMIO write가 CPU instruction retirement와 동시에 device까지 도착한다고 단정할 수 없다. 일부 bus에서는 posted write가 발생할 수 있고, 특정 순서를 반드시 지켜야 한다면 documented read-back이나 ordering primitive가 필요하다.

```text
CPU writel(command)
      │
      ▼
interconnect / posted buffer
      │
      ▼
device register
```

이 중간 경로 때문에 source code에서 write 순서가 보인다는 사실만으로 device가 같은 순간 같은 순서로 관찰한다고 가정하면 안 된다.

### Mapping permission과 user-space 접근은 별도 문제다

Physical device register가 존재한다고 user process가 그 address를 직접 읽을 수 있는 것도 아니다. Kernel이 mapping과 privilege를 관리하고 driver API를 통해 접근을 제한한다. User-space `mmap`으로 device memory를 노출하는 경우에도 lifetime, permission, cache attribute를 명확히 정해야 한다.

Mapped file, anonymous memory와 MMIO를 모두 '주소로 접근한다'는 이유로 같은 것으로 취급하지 않는다. Storage-backed page에는 page cache와 persistence semantics가 있고, MMIO에는 device-specific side effect와 ordering contract가 있다.

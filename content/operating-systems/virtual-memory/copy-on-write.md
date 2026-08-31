---
kind: concept
contentKey: operating-systems.core.virtual-memory.copy-on-write
topicContentKey: operating-systems.core.virtual-memory
slug: copy-on-write
title: "Copy-on-Write"
summary: "공유 page를 write 시 복사해 fork 비용을 줄이는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Copy-on-Write

copy-on-write는 fork 직후 parent와 child가 같은 physical page를 read-only로 공유하고, 어느 한쪽이 write할 때만 새 frame을 만들어 분리한다. 쓰지 않는 page를 복제하지 않아 process creation 비용과 memory 사용을 줄인다.

write fault에서 copy가 발생하므로 shared page가 많아도 write workload가 크면 비용이 뒤로 이동한다. parent와 child가 독립적으로 바뀐 뒤에는 더 이상 같은 page를 공유하지 않는다.

### Backend 연결

snapshot이나 immutable buffer를 공유할 때 COW와 유사한 최적화를 사용할 수 있지만, 실제 JVM 객체 변경은 OS COW와 다르다. 복사 시점과 thread safety를 application 수준에서 명시한다.

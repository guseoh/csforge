---
kind: concept
contentKey: operating-systems.core.virtual-memory.copy-on-write
topicContentKey: operating-systems.core.virtual-memory
slug: copy-on-write
title: "쓰기 시 복사(쓰기 시 복사(COW))"
summary: "공유 physical page를 읽기에는 공유하고 첫 write에서 분리해 복제 비용을 지연하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux fork가 분리된 address space를 copy-on-write page로 구현하는 경계를 확인한다."
    displayOrder: 1
---
# 쓰기 시 복사(쓰기 시 복사(COW))

쓰기 시 복사(COW)(COW)는 **처음부터 data를 복제하지 않고 여러 매핑이 같은 physical page를 읽기 전용으로 공유하다가, 실제 write가 발생하는 순간 필요한 쪽만 복사하는 방식**이다.

`fork()`를 예로 들면 부모와 자식는 논리적으로 서로 분리된 address space를 가져야 한다. 하지만 fork 순간 모든 physical page를 즉시 복사할 필요는 없다.

```text
fork 직후
Parent P ─┐
          ├─> Frame F (shared COW)
Child P ──┘

Child write
→ protection fault
→ 새 Frame F2 할당·복사
→ Child P → F2 writable
→ Parent P → 기존 F
```

### 첫 write가 실제 복제 비용을 발생시킨다

둘 다 read만 하는 동안에는 같은 프레임을 공유해도 논리적 내용이 달라지지 않는다. 한쪽이 write하려 하면 OS가 새 프레임을 확보하고 기존 내용을 복사한 뒤 그 프로세스의 매핑만 새 프레임으로 바꾼다. 이후 두 프로세스는 같은 virtual address에서 서로 다른 값을 가질 수 있다.

### COW는 복제를 없애는 것이 아니라 지연한다

부모와 자식가 결국 대부분의 공유 page를 수정한다면 page 복사 비용도 결국 대부분 발생한다. 반대로 자식가 곧 `exec()`로 다른 프로그램 image를 실행한다면 수정하지 않을 page를 미리 복제하지 않아 큰 이점을 얻을 수 있다.

복사-on-Write의 핵심은 **논리적 주소 공간 분리를 유지하면서 실제 physical page 복제를 write가 필요한 시점까지 미루는 것**이다. 애플리케이션-level 불변 data structure에서 쓰는 복사-on-write라는 표현과 원리는 비슷할 수 있지만, OS COW는 page 매핑과 fault를 이용하는 virtual-메모리 메커니즘이다.
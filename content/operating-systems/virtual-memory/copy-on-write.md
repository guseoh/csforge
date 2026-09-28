---
kind: concept
contentKey: operating-systems.core.virtual-memory.copy-on-write
topicContentKey: operating-systems.core.virtual-memory
slug: copy-on-write
title: "쓰기 시 복사(Copy-on-Write)"
summary: "공유 물리 페이지를 읽기에는 함께 사용하고 첫 쓰기에서 분리해 복제 비용을 늦추는 흐름을 설명한다."
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
# 쓰기 시 복사(Copy-on-Write)

쓰기 시 복사(Copy-on-Write, COW)는 **처음부터 데이터를 복제하지 않고 여러 매핑이 같은 물리 페이지를 읽기 전용으로 공유하다가, 실제 쓰기가 발생하는 순간 필요한 쪽만 복사하는 방식**이다.

`fork()`를 예로 들면 부모와 자식 프로세스는 논리적으로 서로 분리된 주소 공간을 가져야 한다. 하지만 `fork()` 순간 모든 물리 페이지를 즉시 복사할 필요는 없다.

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

### 첫 쓰기가 실제 복제 비용을 발생시킨다

부모와 자식이 읽기만 하는 동안에는 같은 프레임을 공유해도 논리적 내용이 달라지지 않는다. 한쪽이 쓰기를 시도하면 운영체제가 새 프레임을 확보하고 기존 내용을 복사한 뒤 그 프로세스의 매핑만 새 프레임으로 바꾼다. 이후 두 프로세스는 같은 가상 주소에서 서로 다른 값을 가질 수 있다.

### COW는 복제를 없애는 것이 아니라 지연한다

부모와 자식이 결국 공유하던 페이지 대부분을 수정한다면 페이지 복사 비용도 결국 대부분 발생한다. 반대로 자식이 곧 `exec()`로 다른 프로그램 이미지를 실행한다면 수정하지 않을 페이지를 미리 복제하지 않아 큰 이점을 얻을 수 있다.

쓰기 시 복사의 핵심은 **논리적으로 분리된 주소 공간을 유지하면서 실제 물리 페이지 복제를 쓰기가 필요한 시점까지 미루는 것**이다. 애플리케이션 수준의 불변 자료구조에서 쓰는 copy-on-write와 아이디어는 비슷할 수 있지만, 운영체제 COW는 페이지 매핑과 페이지 폴트를 이용하는 가상 메모리 기법이다.
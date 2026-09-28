---
kind: concept
contentKey: operating-systems.core.io.mmap
topicContentKey: operating-systems.core.io
slug: mmap
title: "mmap"
summary: "파일과 address space를 매핑해 page fault로 데이터를 가져오는 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux mmap의 lazy population과 MAP_POPULATE 같은 explicit prefault 선택지를 구분한다."
    displayOrder: 1
---
# mmap

`mmap()`은 파일이나 anonymous 객체를 프로세스의 가상 주소 range에 연결해, 이후 그 영역을 **일반 메모리 load/store로 접근할 수 있게 하는 interface**다. `read()`처럼 매번 애플리케이션 버퍼를 명시적으로 넘기는 대신 파일 기반 상태와 virtual-메모리 매핑을 연결한다.

![파일 매핑과 first-touch 페이지 폴트 흐름](/learning/operating-systems/mmap-파일-접근.svg)

### 매핑과 residency는 같은 사건이 아니다

큰 파일을 매핑했다고 모든 page가 즉시 physical 메모리에 올라오는 것은 아니다. 매핑은 먼저 가상 주소 range와 backing 객체의 관계를 만든다. 실제 page는 첫 접근에서 page fault를 통해 준비될 수 있다.

```text
mmap()
  ↓
virtual mapping 생성
  ↓
first touch
  ↓
page fault 가능
  ↓
page cache/backing에서 page 준비
```

따라서 mmap의 비용은 매핑 syscall 하나만이 아니라 접근 지역성, first-touch fault와 상주 working set까지 함께 봐야 한다.

### MAP_PRIVATE와 MAP_SHARED

Private 매핑의 변경은 보통 쓰기 시 복사(COW) 방식으로 프로세스 전용 page를 만들 수 있으므로 write가 underlying 파일에 그대로 반영된다고 기대하면 안 된다. 공유 파일 매핑에서는 변경이 공유 backing과 연결될 수 있지만, 여러 프로세스가 동시에 같은 위치를 수정할 때 atomicity와 동기화이 자동으로 제공되는 것은 아니다.

매핑의 sharing 의미와 동기화 의미는 별개의 계약이다.

### mmap은 영속성를 보장하지 않는다

공유 매핑에 값을 썼다고 그 순간 stable 저장소까지 기록된 것은 아니다. Dirty mapped page의 write-back과 persistence에는 별도 sync contract가 필요하다. 즉 메모리에서 변경이 보이는 것과 crash 이후에도 파일 변경이 남는 것은 다른 문제다.

### mmap은 항상 더 빠른 I/O가 아니다

Explicit `read()`의 사용자-버퍼 복사를 줄일 수 있는 경우가 있지만 페이지 폴트, 페이지 테이블/TLB pressure와 random 접근 비용도 있다. Buffered read 역시 page cache를 활용한다. 따라서 mmap은 "syscall이 적으니 항상 빠르다"는 선택이 아니라 **파일을 프로세스 address space로 다뤄야 하는 접근 pattern과 생명주기에 맞는지 판단하는 data-접근 방식**이다.

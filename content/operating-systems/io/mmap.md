---
kind: concept
contentKey: operating-systems.core.io.mmap
topicContentKey: operating-systems.core.io
slug: mmap
title: "mmap"
summary: "파일을 프로세스 주소 공간에 매핑하고 페이지 폴트로 필요한 데이터를 가져오는 경계를 설명한다."
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

`mmap()`은 파일이나 익명 객체를 프로세스의 가상 주소 범위에 연결해, 이후 그 영역을 **일반적인 메모리 읽기·쓰기로 접근할 수 있게 하는 인터페이스**다. `read()`처럼 매번 애플리케이션 버퍼를 넘기는 대신 파일의 backing 상태와 가상 메모리 매핑을 연결한다.

![파일 매핑과 첫 접근 페이지 폴트 흐름](/learning/operating-systems/mmap-file-access.svg)

### 매핑과 실제 메모리 상주는 같은 사건이 아니다

큰 파일을 매핑했다고 모든 페이지가 즉시 물리 메모리에 올라오는 것은 아니다. 매핑 단계에서는 먼저 가상 주소 범위와 backing 객체의 관계를 만든다. 실제 페이지는 첫 접근에서 페이지 폴트를 거쳐 준비될 수 있다.

```text
mmap()
  ↓
가상 주소 매핑 생성
  ↓
첫 접근(first touch)
  ↓
페이지 폴트 가능
  ↓
페이지 캐시 또는 backing에서 페이지 준비
```

따라서 `mmap()`의 비용은 시스템 콜 한 번으로 끝난다고 보면 안 된다. **접근 지역성, 첫 접근 페이지 폴트, 실제 상주 작업 집합(working set)**까지 함께 봐야 한다.

### `MAP_PRIVATE`와 `MAP_SHARED`

`MAP_PRIVATE` 매핑에서 변경이 발생하면 보통 쓰기 시 복사(copy-on-write) 방식으로 프로세스 전용 페이지가 만들어질 수 있으므로, 그 쓰기가 원본 파일에 그대로 반영된다고 기대하면 안 된다. `MAP_SHARED` 파일 매핑에서는 변경이 공유 backing과 연결될 수 있지만, 여러 프로세스가 같은 위치를 동시에 수정할 때 원자성이나 동기화가 자동으로 제공되는 것은 아니다.

즉 **매핑을 공유한다는 계약과 동시 접근을 안전하게 조정한다는 계약은 별개**다.

### `mmap()`은 영속성을 보장하지 않는다

공유 매핑에 값을 썼다고 그 순간 영속 저장 장치까지 기록된 것은 아니다. 변경된 매핑 페이지의 쓰기 반영(write-back)과 장애 후 보존에는 별도의 동기화 계약이 필요하다. 메모리에서 변경이 보이는 것과 장애 뒤에도 파일 변경이 남는 것은 다른 상태다.

### `mmap()`이 항상 더 빠른 I/O는 아니다

명시적 `read()`에서 사용자 버퍼로 복사하는 비용을 줄일 수 있는 경우는 있지만, 페이지 폴트와 페이지 테이블·TLB 부담, 무작위 접근 비용도 존재한다. 일반적인 버퍼링 읽기 역시 페이지 캐시를 활용한다.

따라서 `mmap()`은 "시스템 콜 수가 적으니 항상 빠르다"는 선택이 아니다. **파일을 프로세스 주소 공간처럼 다뤄야 하는 접근 방식과 생명주기에 잘 맞는지**를 기준으로 판단해야 한다.

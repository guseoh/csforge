---
kind: concept
contentKey: operating-systems.core.filesystem.buffering
topicContentKey: operating-systems.core.filesystem
slug: buffering
title: "버퍼링(Buffering)"
summary: "사용자 공간·커널·장치 계층이 서로 다른 이유로 I/O를 모으고 지연하며 flush의 의미가 계층마다 달라지는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "File System Implementation"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block과 allocation 구조가 파일 시스템 접근 경로를 만드는 방식을 확인한다."
    relationNote: "이 Concept에서는 파일 시스템 계층의 배경을 확인하는 보조 자료로 사용하고, 사용자 공간 stream buffering과 커널 page cache는 별도 1차 자료로 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man3/setbuf.3.html"
    title: "setbuf(3) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "C 표준 I/O의 unbuffered·line-buffered·block-buffered 모드와 fflush가 사용자 공간 stream buffer를 비우는 의미를 확인한다."
    displayOrder: 2
  - url: "https://docs.kernel.org/admin-guide/mm/concepts.html"
    title: "Concepts overview — Linux kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "파일 읽기·쓰기가 page cache를 거치고 dirty page가 backing storage로 동기화되는 커널 계층을 확인한다."
    displayOrder: 3
---
# 버퍼링(Buffering)

버퍼링은 생산자와 소비자의 속도나 처리 단위가 다를 때 **데이터를 잠시 모아 두어 I/O 호출과 실제 전송 시점을 분리하는 방식**이다. 하나의 I/O 경로에는 사용자 공간 라이브러리 버퍼, 커널 페이지 캐시, 장치 큐처럼 여러 버퍼가 존재할 수 있다.

```text
애플리케이션
   ↓
사용자 공간 버퍼
   ↓
커널 / 페이지 캐시
   ↓
블록·장치 계층
   ↓
저장장치
```

### 사용자 공간 버퍼는 작은 호출을 모을 수 있다

애플리케이션이 아주 작은 쓰기를 반복하면 시스템 콜 수가 많아질 수 있다. 라이브러리 버퍼는 여러 쓰기를 모아 더 큰 단위로 다음 계층에 전달해 호출 비용을 줄일 수 있다.

이때 라이브러리의 `flush()`는 보통 **그 라이브러리가 보유한 버퍼를 다음 계층으로 밀어내는 것**을 뜻한다. 저장장치의 영속성까지 완료했다는 의미는 아니다.

### 커널도 별도의 버퍼링을 할 수 있다

커널은 쓰기 데이터를 페이지 캐시에 받아 두고 나중에 write-back하거나, 읽기에서 readahead를 사용해 앞으로 필요할 데이터를 미리 가져올 수 있다. 이런 버퍼링은 처리량을 높일 수 있지만 데이터가 어느 단계까지 이동했는지 구분해야 한다.

버퍼가 너무 작으면 호출 횟수가 늘고, 너무 크면 메모리 사용량과 데이터가 머무는 시간이 길어질 수 있다. 적절한 크기는 접근 패턴과 각 계층의 처리 단위에 따라 달라진다.

버퍼링의 핵심은 **I/O 데이터가 여러 계층의 버퍼를 거칠 수 있으며, 한 계층에서 flush되었다는 사실이 다음 계층의 완료나 영속성까지 자동으로 보장하지 않는다는 점**이다.

---
kind: concept
contentKey: operating-systems.core.filesystem.page-cache
topicContentKey: operating-systems.core.filesystem
slug: page-cache
title: "페이지 캐시(Page Cache)"
summary: "파일 데이터를 메모리에 유지해 저장장치 I/O를 줄이는 대신 dirty write-back과 메모리 압박을 만드는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "File System Implementation"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block과 allocation 구조가 파일 시스템 접근 경로를 만드는 방식을 확인한다."
    relationNote: "이 Concept에서는 파일 시스템 경로의 배경을 확인하는 보조 자료로 사용한다. page cache 자체의 동작은 Linux 공식 문서를 함께 본다."
    displayOrder: 1
  - url: "https://docs.kernel.org/admin-guide/mm/concepts.html"
    title: "Concepts overview — Linux kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "파일 읽기와 쓰기가 page cache를 거치는 방식, dirty page와 backing storage 동기화, 메모리 회수의 기본 경계를 확인한다."
    displayOrder: 2
  - url: "https://toss.tech/article/flink-realtime-frequency-capping"
    title: "Apache Flink + RocksDB 튜닝으로 광고 Frequency Capping 실시간 집계를 일주일까지 확장하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "Direct I/O로 OS page cache를 우회했을 때 cache miss와 메모리 제어의 절충이 어떻게 바뀌는지 실제 운영 사례로 확인한다."
    displayOrder: 3
---
# 페이지 캐시(Page Cache)

페이지 캐시는 **파일 데이터를 물리 메모리에 보관해 반복되는 저장장치 I/O를 줄이는 운영체제 캐시**다. 파일을 읽을 때 필요한 페이지가 이미 캐시에 있으면 저장장치에서 다시 가져오지 않고 메모리의 데이터를 사용할 수 있다.

```text
파일 읽기
   ↓
페이지 캐시 조회
   ├─ hit  → 메모리 데이터 사용
   └─ miss → 저장장치 읽기 → 페이지 캐시에 보관 → 사용
```

### 읽기에서는 지역성을 재사용한다

같은 파일 구간을 다시 읽거나 순차 접근을 수행하면 이미 메모리에 있는 페이지와 readahead를 이용해 저장장치 지연을 줄일 수 있다. 그래서 차가운 캐시(cold cache)에서의 첫 읽기와 따뜻한 캐시(warm cache)에서의 반복 읽기는 크게 다른 성능을 보일 수 있다.

### 쓰기에서는 dirty page가 생길 수 있다

버퍼링된 쓰기(buffered write)는 커널 페이지 캐시의 페이지를 수정하고 dirty 상태로 만든 뒤 반환될 수 있다. Dirty page는 이후 write-back을 통해 저장장치에 전달된다.

```text
애플리케이션 write
→ dirty page cache
→ write-back
→ 저장장치
```

페이지 캐시에서 최신 데이터를 읽을 수 있다는 사실과 전원 손실 이후에도 데이터가 남는다는 영속성 보장은 다르다.

### 페이지 캐시도 물리 메모리를 사용한다

파일 기반 캐시 페이지도 다른 프로세스 메모리와 같은 물리 메모리 용량을 사용한다. 메모리 압박이 생기면 깨끗한 캐시 페이지를 회수하거나 dirty page의 write-back이 필요할 수 있다.

페이지 캐시의 핵심은 **저장장치 데이터를 메모리에서 재사용해 I/O를 줄이는 대신 dirty write-back과 물리 메모리 압박이라는 별도 상태를 만든다는 점**이다.

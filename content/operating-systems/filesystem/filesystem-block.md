---
kind: concept
contentKey: operating-systems.core.filesystem.filesystem-block
topicContentKey: operating-systems.core.filesystem
slug: filesystem-block
title: "파일 시스템 블록(파일-시스템 Block)"
summary: "logical 파일 오프셋을 파일 시스템 할당 unit에 배치하고 VM page·장치 sector와 구분하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "파일 시스템 Implementation"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# 파일 시스템 블록(파일-시스템 Block)

애플리케이션은 파일을 연속된 바이트 sequence로 보지만 파일 시스템은 persistent data를 관리하기 위해 일정한 크기의 **block 단위**로 나누어 배치한다. 파일의 logical 오프셋은 어느 logical block과 그 block 내부 위치인지로 나눌 수 있고, 파일 시스템 메타데이터가 logical block을 실제 저장소 위치에 연결한다.

예를 들어 block size가 4KiB라면 오프셋 9000은 세 번째 logical block의 808번째 바이트에 해당한다.

```text
9000 / 4096 = logical block 2
9000 % 4096 = block offset 808
```

Logical block들이 저장소에서 반드시 연속된 물리 위치에 놓이는 것은 아니다.

### VM page와 장치 sector와는 다른 단위다

Virtual-메모리 page는 메모리 매핑과 residency의 단위이고, 파일 시스템 block은 persistent 파일 data와 free-space 할당을 관리하는 단위다. 저장소 장치의 sector나 내부 flash page는 다시 다른 계층의 단위다.

크기가 우연히 같을 수 있어도 책임은 다르기 때문에 `4KiB VM page = 4KiB filesystem block = device atomic-write unit`이라고 추론하면 안 된다.

### Block 크기도 trade-off를 만든다

큰 block은 큰 파일을 적은 메타데이터로 관리하기 쉽고 sequential 접근에 유리할 수 있지만 작은 파일의 마지막 block에서 낭비되는 공간이 커질 수 있다. 작은 block은 세밀한 할당이 가능하지만 더 많은 매핑 메타데이터가 필요할 수 있다.

파일-시스템 Block의 핵심은 **연속된 파일 바이트를 persistent 저장소에 배치하고 추적하기 위한 파일 시스템의 할당 단위이며, 메모리 page나 하드웨어 sector와는 다른 층의 개념이라는 점**이다.
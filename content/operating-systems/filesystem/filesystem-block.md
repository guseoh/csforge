---
kind: concept
contentKey: operating-systems.core.filesystem.filesystem-block
topicContentKey: operating-systems.core.filesystem
slug: filesystem-block
title: "파일 시스템 블록(File-System Block)"
summary: "파일의 논리 오프셋을 파일 시스템 할당 단위에 배치하고 가상 메모리 페이지·장치 섹터와 구분하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "File System Implementation"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# 파일 시스템 블록(File-System Block)

애플리케이션은 파일을 연속된 바이트 열로 보지만 파일 시스템은 영속 데이터를 관리하기 위해 일정한 크기의 **블록(block)** 단위로 나누어 배치한다. 파일의 논리 오프셋은 어느 논리 블록과 그 블록 내부 위치인지로 나눌 수 있고, 파일 시스템 메타데이터가 논리 블록을 실제 저장 위치에 연결한다.

예를 들어 블록 크기가 4KiB라면 오프셋 9000은 세 번째 논리 블록의 808번째 바이트에 해당한다.

```text
9000 / 4096 = logical block 2
9000 % 4096 = block offset 808
```

논리 블록들이 저장 장치에서 반드시 연속된 물리 위치에 놓이는 것은 아니다.

### 가상 메모리 페이지와 장치 섹터는 다른 단위다

가상 메모리 페이지는 메모리 매핑과 상주 상태의 단위이고, 파일 시스템 블록은 영속 파일 데이터와 빈 공간 할당을 관리하는 단위다. 저장 장치의 섹터나 플래시 내부 페이지는 다시 다른 계층의 단위다.

크기가 우연히 같을 수 있어도 책임은 다르므로 `4KiB VM page = 4KiB filesystem block = device atomic-write unit`이라고 추론하면 안 된다.

### 블록 크기도 절충을 만든다

큰 블록은 큰 파일을 적은 메타데이터로 관리하기 쉽고 순차 접근에 유리할 수 있지만 작은 파일의 마지막 블록에서 낭비되는 공간이 커질 수 있다. 작은 블록은 더 세밀하게 공간을 할당할 수 있지만 더 많은 매핑 메타데이터가 필요할 수 있다.

파일 시스템 블록의 핵심은 **연속된 파일 바이트를 영속 저장 장치에 배치하고 추적하기 위한 파일 시스템의 할당 단위이며, 메모리 페이지나 하드웨어 섹터와는 다른 층의 개념이라는 점**이다.
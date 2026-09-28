---
kind: concept
contentKey: operating-systems.core.filesystem.allocation
topicContentKey: operating-systems.core.filesystem
slug: allocation
title: "블록 할당(Block 할당)"
summary: "파일 성장과 접근 pattern에 맞춰 free block을 배치하고 메타데이터·fragmentation·지역성 trade-off를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "파일 시스템 Implementation"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# 블록 할당(Block 할당)

파일이 커질 때 파일 시스템은 free space에서 block을 골라 파일의 logical block과 연결해야 한다. Block 할당은 **빈 공간을 찾는 것뿐 아니라 파일 성장, random/sequential 접근, fragmentation과 매핑 메타데이터 비용을 함께 결정하는 정책**이다.

![연속·연결·indexed 할당이 만드는 lookup과 fragmentation trade-off](/learning/operating-systems/block-할당-tradeoff.svg)

### 대표 모델은 서로 다른 trade-off를 보여 준다

연속 할당은 block 위치를 계산하기 쉽고 sequential 지역성가 좋지만 파일이 예상보다 커질 때 뒤 공간이 없으면 확장하기 어렵다. Linked 할당은 흩어진 free block을 사용할 수 있지만 먼 logical 오프셋에 접근하려면 중간 pointer를 따라가야 할 수 있다. Indexed 할당은 별도 index로 block 위치를 찾지만 index 메타데이터가 필요하다.

현대 파일 시스템은 extent, indirect block, 할당 group 등 여러 방식을 조합할 수 있다. 따라서 이 세 분류는 실제 파일 시스템을 하나의 이름으로 분류하기보다 **공간 배치와 lookup 비용의 trade-off를 이해하는 모델**이다.

### Free-space 메타데이터도 함께 갱신해야 한다

Block을 파일에 배정하려면 어느 공간이 비어 있는지를 추적하는 bitmap/free-list 같은 상태와 파일의 block 매핑 상태가 함께 바뀐다. Persistent 갱신가 여러 structure에 걸친다는 점은 crash consistency와도 연결된다.

Block 할당의 핵심은 **파일의 logical content를 available 저장소 block에 배치하면서 지역성, fragmentation, growth와 메타데이터 비용 사이에서 균형을 잡는 파일 시스템 정책**이라는 점이다.
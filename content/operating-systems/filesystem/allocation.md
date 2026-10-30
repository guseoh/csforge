---
kind: concept
contentKey: operating-systems.core.filesystem.allocation
topicContentKey: operating-systems.core.filesystem
slug: allocation
title: "블록 할당(Block Allocation)"
summary: "파일 성장과 접근 패턴에 맞춰 빈 블록을 배치하고 메타데이터·단편화·지역성 사이의 절충을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "File System Implementation"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# 블록 할당(Block Allocation)

파일이 커질 때 파일 시스템은 빈 공간에서 블록을 골라 파일의 논리 블록과 연결해야 한다. 블록 할당은 **빈 공간을 찾는 것뿐 아니라 파일 성장, 임의·순차 접근, 단편화와 매핑 메타데이터 비용을 함께 결정하는 정책**이다.

![연속·연결·indexed allocation이 만드는 lookup과 fragmentation trade-off](/learning/operating-systems/block-allocation-tradeoff.svg)

### 대표 모델은 서로 다른 절충을 보여 준다

연속 할당은 블록 위치를 계산하기 쉽고 순차 지역성이 좋지만 파일이 예상보다 커질 때 뒤 공간이 없으면 확장하기 어렵다. 연결 할당은 흩어진 빈 블록을 사용할 수 있지만 먼 논리 오프셋에 접근하려면 중간 포인터를 따라가야 할 수 있다. 인덱스 할당은 별도 인덱스로 블록 위치를 찾지만 인덱스 메타데이터가 필요하다.

현대 파일 시스템은 extent, 간접 블록, allocation group 등 여러 방식을 조합할 수 있다. 따라서 이 세 분류는 실제 파일 시스템을 하나의 이름으로 단정하기보다 **공간 배치와 탐색 비용의 절충을 이해하는 모델**이다.

### 빈 공간 메타데이터도 함께 갱신해야 한다

블록을 파일에 배정하려면 어느 공간이 비어 있는지를 추적하는 bitmap/free-list 같은 상태와 파일의 블록 매핑 상태가 함께 바뀐다. 하나의 논리적 변경이 여러 영속 구조에 걸친다는 점은 장애 시 일관성(crash consistency) 문제와도 연결된다.

블록 할당의 핵심은 **파일의 논리 내용을 사용 가능한 저장 블록에 배치하면서 지역성, 단편화, 성장 가능성과 메타데이터 비용 사이에서 균형을 잡는 파일 시스템 정책**이라는 점이다.
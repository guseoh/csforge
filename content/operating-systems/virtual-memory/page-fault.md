---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-fault
topicContentKey: operating-systems.core.virtual-memory
slug: page-fault
title: "페이지 폴트(Page Fault)"
summary: "가상 주소 접근을 현재 매핑만으로 처리할 수 없을 때 커널이 원인을 판정해 복구하거나 실패시키는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys.pdf"
    title: "Beyond Physical Memory: Mechanisms"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "page fault에서 OS가 translation 상태를 해석하고 page-in 또는 실패를 결정하는 흐름을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man2/getrusage.2.html"
    title: "getrusage(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux가 ru_minflt와 ru_majflt에서 I/O 없이 처리된 fault와 I/O가 필요했던 fault를 구분해 노출하는 방식을 확인한다."
    displayOrder: 2
---
# 페이지 폴트(Page Fault)

페이지 폴트는 프로세스가 가상 주소에 접근했지만 **현재 매핑과 보호 상태만으로 그 접근을 완료할 수 없어 커널의 판단이 필요한 사건**이다. 페이지 폴트가 발생했다고 항상 디스크에서 페이지를 읽는 것은 아니다.

![메모리 접근이 페이지 폴트를 일으킨 뒤 매핑과 접근 권한을 검사하고 복구 또는 실패로 이어지는 흐름](/learning/operating-systems/page-fault-flow.svg)

### 커널은 폴트 원인을 먼저 구분한다

폴트 처리기는 해당 주소가 프로세스에 허용된 매핑인지, 요청한 접근 권한이 맞는지, 필요한 페이지를 준비하면 정상적으로 다시 실행할 수 있는지 판단한다.

하드웨어 PTE의 접근 권한과 운영체제가 해당 가상 영역에 허용한 접근 정책을 구분해야 한다. 예를 들어 쓰기 가능한 private 영역이라도 COW를 위해 PTE가 읽기 전용이면 쓰기 폴트가 발생할 수 있다. 커널은 이 경우 실제 권한 위반으로 처리하는 대신 필요에 따라 복사 또는 권한 복원을 수행한다.

익명 페이지의 첫 접근이라면 0으로 초기화한 프레임을 준비하는 것만으로 복구될 수 있고, 쓰기 시 복사(COW)라면 새 프레임을 만들어 매핑을 분리할 수 있다. 파일이나 스왑에서 내용을 가져오는 경우에도 페이지 캐시나 압축된 RAM 스왑 캐시에서 해결할 수 있다. 실제 저장 장치의 데이터를 읽어야 하는 경우에만 해당 읽기 I/O가 발생한다. 매핑 정책상 허용된 폴트라도 메모리 부족, 잘린 파일 매핑 또는 I/O 오류 등으로 복구가 실패할 수 있다.

### 복구 가능한 폴트는 원래 명령을 다시 실행한다

커널이 애플리케이션의 load/store를 대신 완료하는 것이 핵심이 아니다. 접근이 성공할 조건을 만든 뒤 폴트를 일으킨 명령이 다시 실행될 수 있도록 상태를 정리한다.

따라서 페이지 폴트의 비용은 원인에 따라 크게 달라진다. 메모리 안에서 매핑만 고치면 되는 폴트와 저장 장치 I/O가 필요한 폴트를 같은 비용으로 보면 안 된다.

페이지 폴트의 핵심은 **폴트 자체가 곧 오류라는 뜻이 아니라, 현재 매핑으로 접근을 완료할 수 없어 운영체제가 복구 가능한 상황인지 보호 위반인지 판정하는 제어 경로**라는 점이다.
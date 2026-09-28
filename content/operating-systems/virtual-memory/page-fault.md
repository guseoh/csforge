---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-fault
topicContentKey: operating-systems.core.virtual-memory
slug: page-fault
title: "페이지 폴트(페이지 폴트)"
summary: "주소 접근이 현재 translation으로 처리되지 못했을 때 커널이 원인을 판정하고 복구 또는 실패시키는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys.pdf"
    title: "Beyond Physical 메모리: Mechanisms"
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
# 페이지 폴트(페이지 폴트)

Page fault는 프로세스가 virtual address에 접근했지만 **현재 매핑 상태만으로 그 접근를 완료할 수 없어 커널의 판단이 필요한 사건**이다. Page fault가 발생했다고 항상 disk에서 page를 읽는 것은 아니다.

![메모리 접근가 page fault를 일으킨 뒤 매핑과 권한을 검사하고 복구 또는 실패로 이어지는 흐름](/learning/operating-systems/page-fault-flow.svg)

### 커널은 fault 원인을 먼저 구분한다

Fault 핸들러는 해당 address가 프로세스에 허용된 매핑인지, 요청한 접근 권한이 맞는지, 필요한 page를 준비하면 정상적으로 재개할 수 있는지 판단한다.

```text
memory access
    ↓
page fault
    ↓
valid mapping인가?
  ├─ no  → process에 오류 전달
  └─ yes
       ↓
permission이 맞는가?
  ├─ no  → protection failure
  └─ yes → page/frame 준비 → mapping 갱신 → instruction 재시도
```

Anonymous page의 첫 접근이라면 zero-filled 프레임을 준비하는 것만으로 복구될 수 있고, 복사-on-write라면 새 프레임을 만들어 매핑을 분리할 수 있다. 파일이나 swap에서 실제 내용을 읽어와야 하는 경우에는 저장소 I/O가 필요할 수 있다.

### 복구 가능한 fault는 원래 명령어을 다시 실행한다

커널이 애플리케이션의 load/store를 대신 끝내는 것이 핵심이 아니다. 접근가 성공할 조건을 만든 뒤 fault를 일으킨 명령어이 다시 실행될 수 있도록 상태를 정리한다.

따라서 page fault의 비용은 원인에 따라 크게 달라진다. 메모리 안에서 매핑만 고치면 되는 fault와 저장소 I/O가 필요한 fault를 같은 비용으로 볼 수 없다.

Page Fault의 핵심은 **fault 자체가 오류를 뜻하는 것이 아니라, 현재 매핑으로는 접근를 완료할 수 없어 OS가 복구 가능한 상황인지 보호 위반인지 판정하는 control 경로**라는 점이다.
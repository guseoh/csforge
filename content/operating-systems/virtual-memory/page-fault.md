---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-fault
topicContentKey: operating-systems.core.virtual-memory
slug: page-fault
title: "Page Fault"
summary: "주소 접근이 현재 translation으로 처리되지 못했을 때 kernel이 원인을 판정하고 복구 또는 실패시키는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys.pdf"
    title: "Beyond Physical Memory: Mechanisms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "page fault에서 OS가 translation 상태를 해석하고 page-in 또는 실패를 결정하는 흐름을 확인한다."
    displayOrder: 1
---
# Page Fault

page fault는 CPU가 virtual address에 접근했지만 현재 translation과 permission만으로 그 접근을 완료할 수 없어 kernel의 fault handler로 제어가 넘어가는 사건이다. 중요한 점은 **page fault가 곧 disk I/O라는 뜻은 아니라는 것**이다. 아직 physical frame이 배정되지 않은 anonymous page라면 zero-filled frame을 연결하는 것만으로 복구될 수 있고, copy-on-write page라면 새 frame을 복사해 writable mapping으로 바꾸면 된다. file-backed page가 page cache에 없거나 swap-backed page를 다시 가져와야 하는 경우에야 storage I/O가 포함될 수 있다.

### Fault가 발생한 뒤 OS가 판단하는 것

fault handler는 먼저 해당 virtual address가 process에 허용된 mapping 안에 있는지, 요청한 read/write/execute 권한이 유효한지 판단한다. mapping 자체가 잘못되었거나 permission 위반이라면 정상적인 demand paging으로 복구할 문제가 아니므로 process에 오류를 전달한다. 반대로 유효한 mapping인데 현재 사용할 수 있는 resident page가 없다면 frame을 확보하고 backing source에서 내용을 준비한 뒤 page-table state를 갱신할 수 있다.

복구 가능한 fault의 전형적인 흐름은 다음처럼 볼 수 있다.

`memory access → fault entry → mapping/permission 확인 → frame/content 준비 → mapping 갱신 → faulting instruction 재시도`

instruction을 재시도한다는 점도 중요하다. fault handler가 application의 원래 load/store를 대신 완료하는 것이 아니라, 접근이 성공할 조건을 마련한 뒤 CPU가 해당 instruction을 다시 실행하게 만드는 모델이 일반적이다.

### 비용은 fault 종류에 따라 크게 달라진다

minor fault처럼 storage I/O 없이 mapping만 준비하는 경우와 실제 page-in이 필요한 major fault는 비용 차이가 크다. 따라서 `page fault 수가 1,000회`라는 숫자만으로 latency를 판단하면 안 된다. 어떤 backing store였는지, 이미 page cache에 있었는지, dirty victim을 write-back해야 했는지까지 봐야 한다.

### 운영에서 보는 경계

대형 file mapping이나 큰 working set의 첫 접근은 warm 상태와 완전히 다른 latency를 만들 수 있다. benchmark에서는 cold start와 steady state를 분리하고, resident memory·major/minor fault·storage I/O를 함께 관찰한다. JVM의 `OutOfMemoryError`와 OS page fault도 같은 사건이 아니므로 application heap 문제와 virtual-memory pressure를 구분해 진단한다.

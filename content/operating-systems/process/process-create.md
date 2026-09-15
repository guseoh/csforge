---
kind: concept
contentKey: operating-systems.core.process.process-create
topicContentKey: operating-systems.core.process
slug: process-create
title: "Process Creation"
summary: "새 process를 만들 때 execution identity·address space·resource relation이 어떻게 초기화되는지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux fork가 분리된 address space를 copy-on-write page로 구현하는 경계를 확인한다."
    displayOrder: 1
---
# Process Creation

새 process를 만든다는 것은 code file을 한 번 더 복사하는 일이 아니다. 운영체제는 새로운 process identity와 scheduling 대상, address-space relation, resource reference를 만들고 parent와 child 사이에 무엇을 복제하거나 연결할지 정한다.

Unix-like model에서는 `fork`와 `exec`를 구분하면 creation 흐름을 이해하기 쉽다.

```text
Parent
   │ fork
   ├──────────────┐
   ▼              ▼
Parent           Child
                   │ exec
                   ▼
             new program image
```

`fork`는 child process를 생성하고, `execve`는 성공하면 현재 process의 program image를 다른 program으로 교체한다.

### Address space는 논리적으로 분리된다

Fork 직후 parent와 child의 memory 내용은 비슷하게 시작할 수 있지만 각각 별도의 process address space를 가진다. 한쪽의 일반 private memory 변경이 다른 쪽에 그대로 반영되는 구조는 아니다.

실제 구현은 모든 physical page를 즉시 복사하지 않고 copy-on-write를 사용할 수 있다. 처음에는 page를 공유하다가 write가 발생하면 필요한 page를 분리하는 방식이다.

즉 **논리적인 address-space 독립성과 physical page의 일시적 공유를 구분**해야 한다.

### Resource마다 상속 방식이 다르다

Fork 뒤 file descriptor entry가 child에도 만들어질 수 있지만 같은 underlying open-file state를 참조할 수 있다. 그래서 `모든 resource가 완전 복사된다`고 일반화하면 안 된다.

새 process 생성은 결국 **execution context, memory와 kernel resource가 resource별 규칙에 따라 복제·공유·초기화되는 lifecycle event**다.

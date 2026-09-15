---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-detection-recovery
topicContentKey: operating-systems.core.deadlock
slug: deadlock-detection-recovery
title: "Detection·Recovery"
summary: "deadlock을 허용한 뒤 dependency를 탐지하고 victim abort·rollback·resource 회수로 progress를 복구하는 전략을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/7_Deadlocks.html"
    title: "Operating Systems: Deadlocks — UIC Course Notes"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "resource-allocation graph, safe state, Banker avoidance와 deadlock detection/recovery를 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/10963"
    title: "스레드 덤프 분석하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "JVM thread dump에서 lock owner와 waiter를 연결해 deadlock cycle을 해석하는 실제 사례를 확인한다."
    displayOrder: 2
---
# Detection·Recovery

Detection 전략은 resource allocation을 미리 강하게 제한하지 않고, **실제로 deadlock dependency가 생겼는지 관찰한 뒤 cycle을 끊어 progress를 복구하는 방식**이다.

Single-instance resource에서는 wait-for graph의 cycle을 찾는 방법이 대표적이다. 여러 instance가 있는 resource에서는 현재 `Available`, `Allocation`, `Request`를 이용해 어떤 execution들이 더 이상 완료될 수 없는지 판단해야 한다.

```text
owner / waiter relation 수집
          ↓
deadlock dependency 탐지
          ↓
       victim 선택
          ↓
abort / rollback / resource 회수
          ↓
남은 execution이 다시 progress
```

### 탐지 시점에도 trade-off가 있다

Resource 요청마다 검사하면 deadlock을 빠르게 발견할 수 있지만 detection 비용이 커진다. 반대로 늦게 검사하면 deadlocked execution이 resource를 오래 보유하고 그 뒤에 waiter가 더 쌓일 수 있다.

따라서 탐지 빈도는 deadlock 발생 가능성과 resource hold 비용, 검사 비용을 함께 고려해야 한다.

### Recovery는 일관된 상태로 돌아갈 방법이 필요하다

Deadlock cycle을 찾았다고 owner의 mutex를 임의로 빼앗으면 protected state가 중간 상태로 남을 수 있다. Recovery는 victim execution을 중단하거나 되돌리고, 그 execution이 보유한 resource를 안전하게 회수할 수 있어야 한다.

어떤 victim을 선택할지도 비용 문제다. 이미 수행한 작업량, 보유 resource 수, priority, 다시 실행할 비용 등을 고려할 수 있다. 같은 execution만 반복해서 victim으로 고르면 recovery 자체가 starvation을 만들 수도 있다.

또한 긴 wait나 timeout만으로 deadlock을 확정할 수는 없다. 단순 contention도 오래 기다릴 수 있으므로 **실제 owner-waiter dependency가 cycle을 이루는지** 확인해야 한다.

Detection·Recovery의 핵심은 **deadlock 가능성을 허용하는 대신 실제 dependency를 탐지하고, 일관성을 깨지 않는 victim recovery로 cycle 하나를 제거하는 것**이다.
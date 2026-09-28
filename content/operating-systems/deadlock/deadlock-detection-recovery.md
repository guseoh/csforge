---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-detection-recovery
topicContentKey: operating-systems.core.deadlock
slug: deadlock-detection-recovery
title: "교착 탐지와 복구(Deadlock Detection and Recovery)"
summary: "교착 가능성을 허용한 뒤 실제 의존 관계를 탐지하고 중단·되돌리기·자원 회수로 진행을 복구하는 전략을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/7_Deadlocks.html"
    title: "Operating Systems: Deadlocks — UIC Course Notes"
    referenceType: COURSE
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
# 교착 탐지와 복구(Deadlock Detection and Recovery)

교착 탐지 전략은 자원 할당을 미리 강하게 제한하지 않고, **실제로 교착 의존 관계가 생겼는지 관찰한 뒤 순환을 끊어 진행 가능성을 복구하는 방식**이다.

단일 인스턴스 자원에서는 대기 그래프의 순환을 찾는 방법이 대표적이다. 같은 종류의 자원이 여러 개라면 현재 `Available`, `Allocation`, `Request`를 함께 사용해 어떤 실행 주체들이 더 이상 완료될 수 없는지 판단해야 한다.

```text
소유자 / 대기자 관계 수집
          ↓
교착 의존 관계 탐지
          ↓
       희생자 선택
          ↓
중단 / 되돌리기 / 자원 회수
          ↓
남은 실행 흐름이 다시 진행
```

### 탐지 시점에도 절충이 있다

자원 요청마다 검사하면 교착 상태를 빠르게 발견할 수 있지만 탐지 비용이 커진다. 반대로 늦게 검사하면 교착된 실행 흐름이 자원을 오래 보유하고 그 뒤에 대기자가 더 쌓일 수 있다.

따라서 탐지 빈도는 교착 발생 가능성, 자원 보유 비용, 검사 비용을 함께 고려해야 한다.

### 복구는 일관된 상태로 돌아갈 방법이 필요하다

교착 순환을 찾았다고 락 소유자의 뮤텍스를 임의로 빼앗으면 보호하던 상태가 중간 단계로 남을 수 있다. 복구는 희생 실행을 중단하거나 안전한 지점으로 되돌리고, 그 실행이 보유한 자원을 일관성을 깨지 않으면서 회수할 수 있어야 한다.

어떤 희생자를 선택할지도 비용 문제다. 이미 수행한 작업량, 보유 자원 수, 우선순위, 다시 실행할 비용 등을 고려할 수 있다. 같은 실행만 반복해서 희생자로 선택하면 복구 정책 자체가 기아를 만들 수도 있다.

또한 긴 대기나 시간 초과만으로 교착 상태를 확정할 수는 없다. 심한 경합도 오래 기다릴 수 있으므로 **실제 소유자-대기자 의존 관계가 순환을 이루는지** 확인해야 한다.

교착 탐지와 복구의 핵심은 **교착 가능성을 허용하는 대신 실제 의존 관계를 탐지하고, 일관성을 보존하는 복구로 순환 하나를 끊어 남은 실행을 다시 진행시키는 것**이다.

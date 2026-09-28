---
kind: concept
contentKey: operating-systems.core.race-critical-section.critical-section
topicContentKey: operating-systems.core.race-critical-section
slug: critical-section
title: "임계 구역(Critical Section)"
summary: "공유 불변 조건을 보호하는 임계 구역과 상호 배제·진행·한정 대기 요구를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
  - url: "https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/5_Synchronization.html"
    title: "Operating Systems: Process Synchronization — UIC Course Notes"
    referenceType: COURSE
    language: en
    depth: section
    recommendation: "critical-section problem과 mutual exclusion·progress·bounded waiting 요구, mutex·semaphore 같은 synchronization 개념을 확인한다."
    relationNote: "이 Concept에서는 5.2절의 critical-section problem과 세 가지 요구 조건을 직접 확인한다."
    displayOrder: 2
---
# 임계 구역(Critical Section)

임계 구역은 공유 상태의 불변 조건을 지키기 위해 **서로 경쟁하는 실행 흐름이 동시에 들어가면 안 되는 코드 구간**이다. 특정 락 API 안쪽을 기계적으로 임계 구역이라고 부르는 것이 아니라, 먼저 어떤 읽기·검사·갱신이 하나의 일관된 상태 전이를 이루어야 하는지 찾아야 한다.

```text
진입 절차
   ↓
┌────────────────────┐
│      임계 구역      │
│ 공유 상태 확인·변경 │
└────────────────────┘
   ↓
종료 절차
```

예를 들어 큐의 `tail 확인 → 원소 저장 → tail 갱신`이 하나의 enqueue 불변 조건을 이룬다면 그중 일부만 보호해서는 중간 상태가 다른 스레드에 노출될 수 있다.

### 상호 배제만이 전부는 아니다

고전적인 임계 구역 문제에서는 다음 요구를 구분한다.

- **상호 배제(mutual exclusion)**: 한 실행 흐름이 임계 구역에 있으면 경쟁하는 다른 흐름은 동시에 들어오지 못한다.
- **진행(progress)**: 임계 구역이 비어 있고 진입하려는 실행 흐름이 있다면 다음 진입자 결정이 무기한 멈추지 않는다.
- **한정 대기(bounded waiting)**: 진입을 요청한 뒤 다른 경쟁자가 무한히 먼저 들어가 특정 실행 흐름이 영원히 밀리지 않도록 진입 횟수에 한계를 둔다.

한정 대기는 실제 벽시계 시간(wall-clock time)의 고정 상한을 뜻하지 않는다. 스케줄러와 동기화 도구의 구현에 따라 현실적인 대기 시간은 달라질 수 있다.

### 범위는 정확성을 먼저 만족해야 한다

임계 구역이 너무 넓으면 다른 스레드가 기다리는 시간이 늘어나 경합(contention)이 커질 수 있다. 그러나 성능 때문에 검사와 갱신을 분리해 불변 조건을 다시 깨뜨려서는 안 된다.

따라서 임계 구역은 **보호해야 할 불변 조건을 완전히 포함하되, 그 불변 조건과 무관한 작업은 가능한 한 밖으로 두는 구간**으로 설계한다. 어떤 락이나 동기화 도구를 사용할지는 그 다음 선택이다.

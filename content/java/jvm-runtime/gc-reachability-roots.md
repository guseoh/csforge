---
kind: concept
contentKey: java.core.jvm-runtime.gc-reachability-roots
topicContentKey: java.core.jvm-runtime
slug: gc-reachability-roots
title: "GC 도달 가능성과 루트(Root)"
summary: "객체를 가리키던 변수가 소스 코드의 범위를 벗어나는 것과 GC 회수 가능 상태를 구분하고 살아 있는 GC 루트에서 객체까지의 도달 가능성으로 수명을 판단한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html#jvms-2.5.3"
    title: "Java SE 25 JVMS: Heap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: heap과 automatic storage reclamation 범위 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/package-summary.html"
    title: "Java SE 25 API: java.lang.ref"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: reachability와 reference processing 개념 확인
  - url: "https://d2.naver.com/helloworld/329631"
    title: "네이버 D2: Java Reference와 GC"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: Java 객체와 GC reachability를 함께 복습
---
# GC 도달 가능성과 루트(Root)

Java 객체의 수명은 "지역 변수가 범위를 벗어났는가"만으로 결정되지 않습니다. GC 관점에서 더 중요한 질문은 **살아 있는 런타임 root에서 그 객체까지 참조 경로가 남아 있는가**입니다.

![GC 루트에서 도달 가능한 객체와 끊긴 객체](/learning/java/gc-reachability.svg)

### 소스 코드의 범위와 실행 시점의 도달 가능성은 다른 개념이다

```java
User createUser() {
    User user = new User("kim");
    return user;
}
```

메서드가 끝나면 해당 프레임에서 지역 변수 `user`를 더는 사용할 수 없습니다. 하지만 호출자가 반환된 참조를 보유하면 `User` 객체에 계속 접근할 수 있습니다.

```text
createUser 프레임 종료
        │
호출자의 참조 ─────▶ User 객체
```

반대로 소스 코드에서 지역 변수의 어휘적 범위가 끝나지 않았다고 해서 JVM이 해당 참조를 메서드 끝까지 살아 있게 유지한다고 단정할 수도 없습니다. JIT는 관찰 가능한 동작을 보존하는 범위에서 값의 실제 생존성(liveness)을 최적화할 수 있습니다.

따라서 **소스 코드 변수의 범위와 객체 그래프의 실행 시점 도달 가능성을 일대일로 대응시키지 않습니다.**

### GC는 살아 있는 출발점에서 객체 그래프를 본다

실제 수집기는 JVM이 유지하는 루트 집합에서 객체 참조를 따라 객체 그래프를 탐색합니다.

```text
실행 시점의 루트
   │
   ├─▶ A ─▶ B
   │
   └─▶ C

       D ─▶ E
```

A, B, C는 살아 있는 루트 경로에 연결되어 있지만 D와 E로 이어지는 경로가 없다면 D와 E는 회수 가능한 상태가 될 수 있습니다.

구체적인 루트 종류와 내부 표현은 JVM 구현에 따라 다릅니다. 학습의 핵심은 **객체가 다른 객체를 몇 개 참조하는지가 아니라 살아 있는 루트에서 도달 가능한지**입니다.

### 순환 참조만으로 객체가 영원히 살아남지는 않는다

```text
GC 루트 ──▶ A

C ──▶ D
▲     │
└─────┘
```

C와 D가 서로를 참조하더라도 루트에서 두 객체로 이어지는 경로가 없다면 함께 회수 대상이 될 수 있습니다. Java GC를 단순 참조 횟수 계산(reference counting)으로 이해하면 이 부분을 잘못 파악하기 쉽습니다.

### 도달 불가(unreachable) 상태가 되어도 즉시 회수(reclaim)되는 것은 아니다

마지막으로 필요한 강한 참조 경로(strong path)가 사라져도 객체 메모리가 바로 재사용되는 것은 아닙니다.

```text
마지막 살아 있는 참조 경로 제거
       │
       ▼
도달 불가(unreachable) / 회수 가능
       │
       ▼
수집기의 다음 판단·회수 주기
       │
       ▼
메모리 회수 가능
```

`System.gc()`를 특정 객체를 즉시 제거하라는 명령으로 이해하면 안 됩니다. JVM에 GC 수행을 요청하는 API일 뿐, 애플리케이션이 정확한 메모리 회수 시점을 지정할 수는 없습니다.

### 메모리 누수는 "업무상 불필요함"과 "도달 가능함"이 어긋나는 문제다

```text
정적 캐시
    │
    └─ Session
         └─ 큰 데이터(payload)
```

업무상 세션이 이미 만료됐더라도 정적 캐시에서 항목을 제거하지 않으면 객체 그래프는 계속 도달 가능한 상태입니다. GC가 잘못 동작하는 것이 아니라 애플리케이션이 살아 있는 참조 경로를 유지하고 있는 것입니다.

이 차이를 구분해야 합니다.

```text
업무적으로 필요 없음
    ≠
GC 관점에서 unreachable
```

그래서 메모리 누수를 진단할 때는 "큰 객체가 왜 남아 있나"보다 **어떤 소유자(owner)와 유지 참조 경로(retained path)가 객체를 아직 GC 루트에 연결하는가**를 찾아야 합니다.

### 참조 강도(reference strength)는 도달 가능성을 더 세분화한다

일반적인 강한 참조(strong reference) 외에도 `SoftReference`, `WeakReference`, `PhantomReference`는 객체의 도달 가능성을 다른 방식으로 표현합니다. 하지만 이 API들도 "몇 초 뒤 지워 달라"는 수명 타이머는 아닙니다.

먼저 강한 참조로 인한 도달 가능성과 루트 그래프를 이해한 뒤, 캐시나 정리 작업처럼 참조가 객체 수명을 연장하지 않아야 하는 특별한 경우에 참조 강도를 검토하는 것이 좋습니다.

### 정리

Java GC에서 객체의 수명은 소스 코드 변수의 유효 범위보다 실행 시점의 도달 가능성을 기준으로 이해해야 합니다. 살아 있는 GC 루트에서 강한 참조 경로가 남아 있으면 객체에 도달할 수 있고, 그 경로가 끊기면 회수 가능한 상태가 될 수 있습니다. 도달할 수 없게 됐다고 즉시 메모리가 재사용되는 것은 아닙니다. GC가 있어도 정적 캐시나 리스너처럼 오래 살아 있는 객체가 불필요한 객체를 계속 참조하면 메모리 누수가 생길 수 있습니다.

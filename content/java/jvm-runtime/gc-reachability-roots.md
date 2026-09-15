---
kind: concept
contentKey: java.core.jvm-runtime.gc-reachability-roots
topicContentKey: java.core.jvm-runtime
slug: gc-reachability-roots
title: "GC Reachability와 Root"
summary: "객체가 source scope를 벗어나는 것과 GC 회수 가능 상태를 구분하고 살아 있는 root에서 객체까지의 reachability로 수명을 판단한다"
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
# GC Reachability와 Root

Java 객체의 수명은 "지역 변수가 scope를 벗어났는가"만으로 결정되지 않습니다. GC 관점에서 더 중요한 질문은 **살아 있는 runtime root에서 그 객체까지 참조 경로가 남아 있는가**입니다.

![GC root에서 reachable한 객체와 끊긴 객체](/learning/java/gc-reachability.svg)

### source scope와 runtime reachability는 다른 개념이다

```java
User createUser() {
    User user = new User("kim");
    return user;
}
```

메서드가 끝나면 local variable `user`를 그 frame에서 더 이상 사용할 수 없지만, 반환된 reference를 caller가 가지고 있다면 `User` 객체는 계속 접근 가능합니다.

```text
createUser frame 종료
        │
caller reference ─────▶ User object
```

반대로 source상 local variable이 아직 lexical scope 안에 있다고 해서 JVM이 반드시 그 reference를 메서드 끝까지 live하게 유지해야 한다고 단정할 수도 없습니다. JIT는 observable behavior를 지키는 범위에서 값의 실제 liveness를 최적화할 수 있습니다.

따라서 **source 변수의 scope와 객체 graph의 runtime reachability를 일대일로 대응시키지 않습니다.**

### GC는 살아 있는 출발점에서 object graph를 본다

실제 collector는 JVM runtime이 유지하는 root 집합에서 reference를 따라 객체 graph를 탐색합니다.

```text
runtime roots
   │
   ├─▶ A ─▶ B
   │
   └─▶ C

       D ─▶ E
```

A, B, C는 살아 있는 root 경로로 연결되어 있지만 D와 E로 가는 경로가 없다면 D와 E는 회수 가능한 상태가 될 수 있습니다.

구체적인 root 종류와 내부 표현은 JVM 구현의 영역입니다. 학습의 핵심은 **객체가 다른 객체를 몇 개 참조하느냐가 아니라 살아 있는 root에서 도달 가능한가**입니다.

### cycle만으로 객체가 영원히 사는 것은 아니다

```text
Root ──▶ A

C ──▶ D
▲     │
└─────┘
```

C와 D가 서로를 참조하고 있어도 root에서 C나 D로 갈 수 있는 경로가 없다면 둘은 함께 회수 대상이 될 수 있습니다. Java GC를 단순 reference counting으로 생각하면 이 부분을 잘못 이해하기 쉽습니다.

### unreachable과 즉시 reclaim은 같은 사건이 아니다

마지막으로 필요한 strong path가 사라졌다고 객체 storage가 바로 그 순간 재사용되는 것은 아닙니다.

```text
마지막 live path 제거
       │
       ▼
unreachable / 회수 가능
       │
       ▼
collector의 다음 판단·cycle
       │
       ▼
storage reclaim 가능
```

`System.gc()` 역시 특정 객체를 즉시 제거하라는 명령으로 이해하면 안 됩니다. JVM에 GC 수행을 요청하는 API이지 애플리케이션이 정확한 reclaim 시점을 지정하는 계약은 아닙니다.

### 메모리 누수는 "필요 없음"과 "reachable"의 불일치다

```text
static cache
    │
    └─ Session
         └─ large payload
```

업무적으로 Session이 이미 만료됐더라도 static cache에서 entry를 제거하지 않았다면 객체 graph는 계속 reachable합니다. GC가 잘못 동작하는 것이 아니라 애플리케이션이 살아 있는 reference path를 유지하고 있는 것입니다.

이 차이를 구분해야 합니다.

```text
업무적으로 필요 없음
    ≠
GC 관점에서 unreachable
```

그래서 leak을 진단할 때는 "큰 객체가 왜 안 지워졌나"보다 **어떤 owner와 retained path가 이 객체를 아직 root에 연결하고 있는가**를 찾습니다.

### reference strength는 이 reachability를 더 세분화한다

일반적인 strong reference 외에도 `SoftReference`, `WeakReference`, `PhantomReference`는 객체의 reachability를 다른 방식으로 표현합니다. 하지만 이 API도 "몇 초 뒤 지워 달라"는 수명 타이머가 아닙니다.

먼저 strong reachability와 root graph를 이해한 뒤, cache나 cleanup처럼 객체 수명을 강하게 소유하지 않아야 하는 특별한 관계에서 reference strength를 검토하는 것이 좋습니다.

### 정리

Java GC에서 객체의 수명은 source variable의 scope보다 runtime reachability를 기준으로 이해해야 합니다. 살아 있는 root에서 strong reference 경로가 남아 있으면 객체는 reachable하고, 그 경로가 끊기면 회수 가능한 상태가 될 수 있습니다. Unreachable이 됐다고 즉시 메모리가 재사용되는 것은 아니며, GC가 있어도 static cache나 listener 같은 장수 owner가 불필요한 객체를 계속 붙잡으면 memory leak이 생길 수 있습니다.

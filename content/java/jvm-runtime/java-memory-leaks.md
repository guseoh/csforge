---
kind: concept
contentKey: java.core.jvm-runtime.java-memory-leaks
topicContentKey: java.core.jvm-runtime
slug: java-memory-leaks
title: "Java 메모리 누수의 원인"
summary: "GC가 있어도 더는 필요하지 않은 객체가 캐시·리스너·ThreadLocal의 참조로 계속 도달 가능한 상태라면 메모리 누수가 생길 수 있음을 진단한다"
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/package-summary.html"
    title: "Java SE 25 API: java.lang.ref"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: reference와 reachability model 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html"
    title: "Java SE 25 API: ThreadLocal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: thread-local value lifecycle 확인
---
# Java 메모리 누수의 원인

Java에 GC가 있어도 메모리 누수(memory leak)는 생길 수 있습니다. GC는 "애플리케이션에 더는 필요하지 않은 객체"를 의미적으로 판단하지 않습니다. **살아 있는 루트에서 더는 도달할 수 없는 객체**를 회수할 수 있을 뿐입니다.

따라서 업무상 이미 버려야 하는 객체라도 캐시, 리스너, `ThreadLocal`처럼 수명이 긴 소유자(owner)가 계속 참조하면 GC는 해당 객체를 정상적으로 유지합니다.

![GC root부터 불필요한 객체까지 남아 있는 retained path](/learning/java/java-memory-retained-path.svg)

### 메모리 누수의 핵심은 불필요한 객체가 여전히 도달 가능하다는 것이다

```java
private static final Map<String, byte[]> CACHE = new HashMap<>();

void remember(String id, byte[] payload) {
    CACHE.put(id, payload);
}
```

삭제 정책이 없다면 static map이 모든 payload를 계속 붙잡습니다.

```text
GC 루트
   │
정적 캐시
   │
   ├─ payload A
   ├─ payload B
   └─ payload C ...
```

GC 입장에서는 이 객체들이 여전히 도달 가능하므로 회수하면 안 됩니다. 문제는 수집기가 아니라 **소유자와 생명주기 정책**입니다.

### 큰 객체보다 유지 참조 경로(retained path)를 찾는다

힙 덤프에서 500MB 객체를 발견했다고 바로 근본 원인을 찾은 것은 아닙니다. 중요한 질문은 다음과 같습니다.

> 어떤 살아 있는 소유자가 이 객체를 계속 참조하고 있는가?

```text
GC 루트
  │
레지스트리
  │
리스너
  │
세션
  │
대형 byte[]
```

작은 `Map`이나 리스너 하나가 거대한 객체 그래프 전체의 수명을 연장할 수도 있습니다. 따라서 얕은 크기(shallow size)보다 객체를 계속 보유하는 참조 관계가 더 중요한 경우가 많습니다.

### 흔한 원인은 수명이 긴 소유자와 짧은 객체 수명이 맞지 않는 것이다

대표적인 패턴은 다음과 같습니다.

**캐시**는 최대 크기, TTL, 축출(eviction) 정책이 없으면 작업 부하가 늘수록 계속 커질 수 있습니다.

**리스너·구독자(Subscriber)**를 등록만 하고 해제하지 않으면 발행자(publisher)가 리스너와 관련 객체 그래프를 계속 보유할 수 있습니다.

**`ThreadLocal`**은 수명이 긴 플랫폼 스레드 풀에서 요청이 끝난 뒤 `remove()`하지 않으면 이전 요청의 문맥이 작업 스레드에 오래 남을 수 있습니다.

```java
CTX.set(context);
try {
    handle();
} finally {
    CTX.remove();
}
```

**`ClassLoader`**는 재로드·플러그인 환경에서 이전 로더를 스레드, `ThreadLocal`, 레지스트리가 계속 참조하면 해당 로더가 정의한 클래스와 메타데이터까지 오래 유지할 수 있습니다.

### 대기열 증가와 메모리 누수를 구분한다

```text
생산자 1000/s
소비자  100/s
```

제한 없는 대기열이라면 작업이 초당 900개씩 쌓일 수 있습니다. 힙이 계속 커지는 증상은 메모리 누수와 비슷하지만, 원인은 "참조를 잘못 해제함"이 아니라 **처리 용량보다 유입량이 큰 과부하·대기 작업 누적(overload·backlog)**일 수 있습니다.

따라서 메모리 증가를 볼 때는 객체 그래프뿐 아니라 대기열 길이, 요청 유입률, 처리량도 함께 봅니다.

### GC가 자주 실행된다고 메모리 누수가 확정되는 것은 아니다

힙 증가와 GC 빈도 증가는 다음 원인에서도 나타날 수 있습니다.

- 정상적인 작업 부하 증가
- 순간적인 메모리 할당 급증(allocation burst)
- 캐시 준비(cache warm-up)
- 대기열 작업 누적(backlog)
- 실제 생존 객체 집합(live set) 증가
- 메모리 누수

메모리 누수가 의심되면 여러 시점의 힙 사용량, 클래스 히스토그램, 힙 덤프를 비교해 특정 객체 종류와 유지 참조 경로가 계속 늘어나는지 살펴봅니다. Full GC 뒤에도 생존 객체 집합이 계속 증가하는 것은 중요한 단서지만, 그 자체로 근본 원인이 입증되지는 않습니다.

### `WeakReference` 적용보다 소유 관계 수정이 먼저다

메모리 누수를 발견했다고 모든 참조를 약한 참조로 바꾸면 원래 필요한 객체까지 예측할 수 없는 시점에 사라질 수 있습니다.

먼저 다음을 정합니다.

- 누가 이 객체를 소유하는가?
- 객체의 생명주기는 언제 끝나는가?
- 누가 제거·등록 해제·종료 처리를 하는가?
- 캐시는 어떤 크기와 TTL을 가져야 하는가?
- 대기열은 어떤 용량과 과부하 정책을 가져야 하는가?

참조 타입 변경은 실제 관계가 "이 참조가 객체의 수명을 연장해서는 안 된다"는 의미일 때만 검토합니다.

### 정리

Java 메모리 누수는 GC가 동작하지 않아서가 아니라 업무상 불필요해진 객체가 여전히 루트에서 도달 가능한 상태로 남아 있는 문제인 경우가 많습니다. 정적 캐시, 리스너, `ThreadLocal`, 대기열, `ClassLoader`처럼 수명이 긴 소유자를 확인하고, 힙 덤프에서는 큰 객체 하나보다 GC 루트까지 이어지는 유지 참조 경로를 추적해야 합니다. 해결도 `System.gc()`나 `WeakReference`를 먼저 적용하기보다 소유자와 생명주기 정책을 바로잡는 것이 우선입니다.

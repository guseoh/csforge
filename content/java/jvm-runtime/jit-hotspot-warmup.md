---
kind: concept
contentKey: java.core.jvm-runtime.jit-hotspot-warmup
topicContentKey: java.core.jvm-runtime
slug: jit-hotspot-warmup
title: "JIT·HotSpot과 워밍업(warm-up)"
summary: "HotSpot이 실행 중 profiling과 JIT compilation으로 code를 최적화할 수 있다는 점과 warm-up·deoptimization이 benchmark 해석에 미치는 영향을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html"
    title: "Java SE 25 JVMS Chapter 2: The Structure of the JVM"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JVM execution model과 implementation 선택의 경계 확인
  - url: "https://docs.oracle.com/en/java/javase/25/vm/index.html"
    title: "Java SE 25 Java Virtual Machine Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: HotSpot JIT·tiered compilation implementation 범위 확인
  - url: "https://techblog.woowahan.com/2588/"
    title: "새로운 포인트 적립 시스템 개발기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: JVM warm-up과 실제 서비스 성능 측정 맥락을 보충
---
# JIT·HotSpot과 워밍업(warm-up)

Java 프로그램은 실행 직후와 충분히 반복 실행된 뒤의 성능이 다를 수 있습니다. HotSpot JVM이 실행 중 정보를 수집하고 자주 실행되는 코드를 **JIT(Just-In-Time) 컴파일**해 네이티브 코드로 최적화할 수 있기 때문입니다.

이 동작은 Java 언어가 정한 문법 규칙이 아니라 **HotSpot이라는 JVM 구현의 실행 전략**입니다.

### `javac` 컴파일과 JIT 컴파일은 다른 단계다

```text
빌드 시점
Java 소스 코드
   │ javac
   ▼
클래스 파일 / 바이트코드

실행 시점
클래스 파일의 바이트코드
   │
   ├─ interpreter로 실행 가능
   └─ HotSpot JIT compilation 가능
              │
              ▼
          네이티브 코드
```

`javac`는 소스 코드를 클래스 파일로 변환하고, JIT 컴파일러는 실행 시점의 정보를 이용해 네이티브 코드를 만들 수 있습니다. 둘을 같은 컴파일 단계로 설명하면 소스 코드·클래스 파일·실행 시점의 경계가 흐려집니다.

### Runtime 프로파일은 최적화의 근거가 될 수 있다

실행 전에는 어떤 메서드와 branch가 실제 작업 부하에서 자주 사용되는지 알 수 없습니다.

```java
if (user.isPremium()) {
    premiumPath();
} else {
    normalPath();
}
```

운영 작업 부하에서 `normalPath()`가 대부분이라면 HotSpot은 실행 중 수집한 프로파일을 바탕으로 자주 실행되는 path와 call site를 최적화할 수 있습니다.

```text
실행
  │
  ├─ 호출/branch/type profile 수집
  │
  └─ hot code 발견
          │
          ▼
     JIT 최적화
```

어떤 임계값과 heuristic을 쓰는지는 HotSpot version과 옵션에 따라 달라질 수 있으므로 Java 명세 보장처럼 외우지 않습니다.

### Tiered 컴파일은 구현 전략이다

HotSpot은 빠른 startup과 높은 정상 상태(steady state) 성능을 함께 노리기 위해 여러 컴파일 단계를 조합하는 계층형 컴파일(tiered 컴파일)을 사용할 수 있습니다.

학습할 때 중요한 것은 컴파일러 이름과 임계값 숫자가 아니라 다음 흐름입니다.

```text
초기 실행
   │
프로파일(profile) 축적
   │
자주 실행되는 코드(hot code) 발견
   │
더 최적화된 코드 생성 가능
```

이 때문에 짧게 한 번 실행한 결과와 충분히 워밍업(warm-up)된 결과를 같은 상태라고 가정하면 benchmark를 잘못 해석할 수 있습니다.

### JIT는 런타임 타입을 이용해 가정을 만들 수 있다

Polymorphic 메서드 call도 런타임에서 항상 같은 비용으로 조회되는 것은 아닙니다. 특정 call site에 사실상 한 타입만 반복해서 등장한다면 HotSpot은 그 프로파일을 바탕으로 inline 같은 speculative optimization을 적용할 수 있습니다.

```text
service.execute()
      │
실행 시점에 FastService만 반복 관찰
      │
      ▼
JIT가 이 가정을 이용해 최적화 가능
```

하지만 Java의 동적 의미 자체가 사라지는 것은 아닙니다. 새로운 하위 타입이 등장해 기존 가정이 깨지면 JVM은 optimized 코드를 버리거나 다시 컴파일할 수 있습니다.

### Deoptimization은 speculative optimization의 반대편이다

```text
가정: Type A만 온다
      │
 최적화된 코드
      │
 Type B 등장
      │
      ▼
최적화 해제(deoptimization) / 재최적화 가능
```

Deoptimization은 "JIT가 잘못된 결과를 냈다"는 뜻이 아니라, 런타임 observation에 기반한 가정이 더 이상 유효하지 않을 때 Java 의미론을 유지하도록 실행 전략을 되돌리는 과정입니다.

### Warm-up은 고정 횟수가 아니다

"몇 번 실행하면 워밍업(warm-up)이 완료된다" 같은 보편적인 숫자는 없습니다. 컴파일 시점은 JVM 버전, 코드 형태, 작업 부하, 실행 빈도에 따라 달라지고 GC나 OS 스케줄링도 측정값에 영향을 줍니다.

따라서 다음처럼 직접 만든 작은 측정만으로 결론을 내리기 어렵습니다.

```java
long start = System.nanoTime();
for (int i = 0; i < 1000; i++) {
    work();
}
System.out.println(System.nanoTime() - start);
```

Loop 자체가 최적화될 수 있고 결과를 사용하지 않으면 죽은 코드 제거(dead-code elimination) 같은 영향도 받을 수 있습니다.

### Microbenchmark와 production measurement는 질문이 다르다

JMH는 준비 실행(warm-up), 별도 JVM 실행(fork), 측정 반복(measurement iteration)과 컴파일러 최적화의 영향을 고려한 마이크로벤치마크 작성을 돕습니다. 하지만 JMH가 보여 주는 작은 Java 연산의 상대 비용이 곧 production API latency는 아닙니다.

```text
JMH
  -> 작은 code path의 비용 비교

Load test / production evidence
  -> network, DB, thread, GC, real traffic 포함
```

장시간 실행되는 서버라면 정상 상태(steady state) 성능이 중요할 수 있고, CLI나 짧은 프로세스에서는 startup과 워밍업(warm-up) 비용이 더 중요할 수 있습니다.

### 정리

HotSpot은 실행 중 profiling 정보를 수집하고 hot 코드를 JIT 컴파일해 최적화된 네이티브 코드로 실행할 수 있습니다. Runtime 타입과 branch 경향을 이용한 speculative optimization은 가정이 깨지면 deoptimization으로 되돌아갈 수 있습니다. 그래서 benchmark에서는 초기 실행과 steady 상태를 구분해야 하며, 구체적인 컴파일 임계값이나 계층형 컴파일(tiered 컴파일) 정책은 Java 언어가 아니라 JVM 구현의 영역입니다.

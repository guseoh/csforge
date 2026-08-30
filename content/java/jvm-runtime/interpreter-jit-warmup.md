---
kind: concept
contentKey: java.core.jvm-runtime.interpreter-jit-warmup
topicContentKey: java.core.jvm-runtime
slug: interpreter-jit-warmup
title: 인터프리터, JIT, warm-up
summary: JVM 실행 성능이 시간과 호출 패턴에 따라 달라지는 이유를 이해한다
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html"
    title: "Java Virtual Machine Specification 2장: The Structure of the JVM"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JVM 실행 데이터와 프레임 구조 확인
---
# 인터프리터와 JIT

JVM은 바이트코드를 인터프리터로 실행할 수 있고, 실행 횟수와 프로파일을 바탕으로 hot code를 JIT 컴파일해 네이티브 코드로 최적화할 수 있습니다. 최적화는 인라이닝, 분기 예측에 유리한 코드 생성 등 구현에 따라 달라지며 Java 언어 의미를 바꾸지 않아야 합니다.

그래서 짧은 벤치마크의 첫 실행 시간과 충분히 warm-up한 뒤의 처리량이 다를 수 있습니다. JVM 시작 비용, 클래스 초기화, JIT 컴파일 비용, GC를 구분하지 않고 단일 숫자로 성능을 판단하면 잘못된 결론을 내립니다.

운영 성능을 비교할 때는 실제 workload를 대표하는 측정, 충분한 반복과 warm-up, 메모리·GC·동시성 조건을 함께 기록해야 합니다. 특정 HotSpot 플래그의 동작을 모든 JVM 구현의 언어 보장으로 가르치지 않는 것도 중요합니다.

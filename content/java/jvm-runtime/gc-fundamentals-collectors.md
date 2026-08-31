---
kind: concept
contentKey: java.core.jvm-runtime.gc-fundamentals-collectors
topicContentKey: java.core.jvm-runtime
slug: gc-fundamentals-collectors
title: "GC fundamentals and collectors"
summary: "GC의 reclaim·pause·throughput/latency trade-off를 이해하고 G1/ZGC 같은 collector를 Java language semantics와 구분해 실용적인 수준으로 비교한다"
level: 3
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/en/java/javase/25/gctuning/"
    title: "Java SE 25 HotSpot VM Garbage Collection Tuning Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: HotSpot collector 선택과 throughput·pause trade-off 확인
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html#jvms-2.5.3"
    title: "Java SE 25 JVMS: Heap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: heap과 automatic reclamation의 specification 범위 확인
---
# GC 기초와 collector

## 쉬운 진입

GC는 더 이상 접근할 수 없는 객체가 차지한 storage를 회수하는 runtime 기능이다.
회수 작업은 애플리케이션을 잠시 멈추는 pause와 함께 일어날 수 있고, 처리량
throughput과 지연 시간 latency를 모두 완벽하게 최대화할 수는 없다.

## 정확한 메커니즘

G1, ZGC 등은 HotSpot이 제공하는 collector implementation 선택지다. Java language가
어떤 collector를 쓰는지, 특정 heap layout·pause 시간·이동 방식을 보장하는 것은 아니다.
collector는 reachability를 보존한다는 Java runtime 의미 안에서 서로 다른 방식으로
작업을 배치하고 pause와 concurrent work의 trade-off를 만든다.

collector 선택은 live set 크기, allocation rate, heap 여유, latency 목표, 운영 환경의
관측 결과를 함께 봐야 한다. “최신 collector가 언제나 최고” 또는 “GC가 실행되면
모든 heap이 정리된다”는 문장은 잘못이다. 회수되지 않는 reachable object와 collector
자체의 temporary overhead는 별도로 분석한다.

## 흔한 오해

- GC pause가 모든 Java thread를 항상 같은 방식으로 멈춘다는 세부는 collector 구현에 따라 다르다.
- G1이나 ZGC가 Java language의 object lifetime 의미를 바꾸지 않는다.
- GC를 자주 호출하면 latency와 memory 문제가 자동으로 해결되지 않는다.

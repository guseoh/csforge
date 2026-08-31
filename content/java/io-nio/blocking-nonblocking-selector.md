---
kind: concept
contentKey: java.core.io-nio.blocking-nonblocking-selector
topicContentKey: java.core.io-nio
slug: blocking-nonblocking-selector
title: "Blocking, non-blocking, and Selector"
summary: "Java NIO의 blocking·non-blocking channel과 Selector model을 구분한다"
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/SelectableChannel.html"
    title: "Java SE 25 API: SelectableChannel"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: blocking mode와 selector 등록 제약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/Selector.html"
    title: "Java SE 25 API: Selector"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: selected key와 readiness 관찰 API 확인
---
# Blocking, non-blocking, and Selector

## 쉬운 진입

blocking call은 작업이 진행되거나 결과를 기다리는 동안 현재 thread가 다음 코드로 가지
못하게 한다. non-blocking channel은 즉시 현재 가능한 결과를 돌려줄 수 있고, Selector는
여러 selectable channel을 하나의 관찰 loop에서 다룰 수 있게 한다.

## 정확한 메커니즘

```text
channel A ─┐
channel B ─┼─ register -> Selector.select -> selected keys -> read/write 처리
channel C ─┘
```

`SelectableChannel.configureBlocking(false)`로 non-blocking mode를 설정하고 selector에
등록한다. `select()`가 반환하면 selected key의 ready operation과 attachment를 확인해 실제
read/write를 시도한다. readiness는 “작업 전체가 완료됨”이나 “다음 호출도 반드시 즉시
성공함”과 같은 뜻이 아니다.

## 실전·면접 연결

partial read, back-pressure, key 제거, channel close와 selector lifecycle을 함께 관리한다.
한 thread로 많은 channel을 관찰할 수 있다는 API model과 OS가 readiness를 어떤 syscall·event
mechanism으로 제공하는지는 구분한다. Java API가 특정 OS의 thread 수나 syscall 순서를
보장하는 것은 아니다.

## 흔한 오해

- non-blocking은 “항상 bytes가 읽힌다”가 아니라 block하지 않는 호출 모드다.
- Selector가 application protocol framing을 대신 처리하지 않는다.
- readiness event 하나가 모든 data를 읽었다는 뜻은 아니다.

---
kind: concept
contentKey: java.core.jvm-runtime.runtime-diagnostics-jcmd-jstack-jfr
topicContentKey: java.core.jvm-runtime
slug: runtime-diagnostics-jcmd-jstack-jfr
title: "Runtime diagnostics with jcmd, jstack, and JFR"
summary: "thread dump, jcmd와 JFR이 각각 어떤 runtime evidence를 제공하는지 알고 증상에 맞는 기본 진단 도구를 선택한다"
level: 3
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html"
    title: "The jcmd Command"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JVM process 진단 명령과 command 선택 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jstack.html"
    title: "The jstack Command"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: thread stack trace 수집 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jfr.html"
    title: "The jfr Command"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: Flight Recorder recording 조작과 출력 확인
---
# jcmd·jstack·JFR 진단

## 쉬운 진입

“느리다”라는 증상 하나에는 lock 대기, CPU 과다, GC pause, allocation, I/O 대기 등
여러 원인이 있다. 도구마다 주는 evidence가 다르므로 증상에 맞는 관찰부터 선택한다.

## 정확한 메커니즘

| 도구 | 주로 얻는 evidence |
|---|---|
| jcmd | 대상 JVM에 명령을 보내 heap·VM·recording 등 여러 진단을 수행 |
| jstack | thread stack trace와 상태·lock 대기 관계를 확인 |
| JFR/jfr | 시간축의 low-overhead event recording을 수집·조회 |

thread가 멈춘 것처럼 보이면 jstack 또는 jcmd의 thread 관련 출력으로 BLOCKED/
WAITING 관계를 확인하고, 장시간 성능 변동은 JFR event의 시간축에서 CPU·GC·allocation과
함께 본다. heap 문제는 heap dump나 class histogram 같은 더 맞는 jcmd command를
선택한다. 도구 출력은 시점의 snapshot 또는 recording이며, 그것만으로 애플리케이션
의도를 확정하지 말고 재현 조건과 설정을 함께 기록한다.

## 흔한 오해

- jstack이 heap leak의 retained path를 직접 보여 주는 도구는 아니다.
- JFR recording이 모든 application business event를 자동으로 포함하지 않는다.
- jcmd 명령 하나가 JVM의 모든 문제를 자동 진단해 주지 않는다.

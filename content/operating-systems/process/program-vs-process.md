---
kind: concept
contentKey: operating-systems.core.process.program-vs-process
topicContentKey: operating-systems.core.process
slug: program-vs-process
title: "Program versus Process"
summary: "정적 code와 실행 중 resource bundle인 process를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process 생성과 주소 공간을 확인한다."
    displayOrder: 1
---
# Program versus Process

program은 실행 가능한 명령과 정적 데이터이고 process는 그 program이 실행되며 얻는 address space, registers, open files, scheduling state의 묶음이다. 같은 program도 여러 process로 실행되면 서로 다른 상태와 자원을 가질 수 있다.

process는 실행 중 mutable state를 가지므로 종료·재시작·권한·환경이 program 파일과 분리된다. binary가 같아도 arguments, environment, current directory가 다르면 동작과 결과가 달라질 수 있다.

### Backend 연결

Spring Boot 하나의 process 안에 여러 thread가 있고, 배포 시 process lifecycle과 application lifecycle이 함께 움직인다. graceful shutdown 시 작업 상태와 외부 자원 회수를 process 경계에서 점검한다.


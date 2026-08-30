# Java Curriculum Foundation

이 디렉터리는 Java 콘텐츠를 작성하기 전에 합의한 학습 지도를 보관한다. `java.yaml`은
Slice 4 import 입력이나 애플리케이션 런타임 설정이 아니며, 이 파일을 읽기 위한 backend/frontend
기능이나 runtime YAML parser를 추가하지 않는다.

## Baseline

- Area: `java`
- Language baseline: Java SE 25
- Canonical map: 17 Topics / 126 Concepts
- Future canonical content identity: `java.core.*`
- Concept는 하나의 Topic 아래에만 배치한다. 중첩된 Topic이 Concept의 primary Topic이다.
- `java.yaml`의 `key`는 향후 `contentKey`로 그대로 사용할 수 있도록 안정적으로 유지한다.

Java 언어 규칙, JVM 명세, 특정 JDK/HotSpot 구현, 운영체제 동작을 구분한다. Java SE 25에서
현재 보장되는 내용을 우선하고, 구현·도구·preview API에 의존하는 내용은 범위와 버전을 명시한다.

## `java.yaml` authoring schema

```yaml
area:
  key: java
  baseline: Java SE 25
  contentKeyPrefix: java.core
topics:
  - key: java.core.<topic>
    title: ...
    order: 10
    scope: ...
    boundary: ...
    concepts:
      - key: java.core.<topic>.<concept>
        title: ...
        level: 1|2|3
        objective: ...
        density: CORE|STANDARD
        visualization: true|false
        visualizationNote: ...
boundaries:
  - area: ...
    owns: ...
    javaBoundary: ...
```

각 Concept에는 정확히 하나의 주된 학습 목표만 둔다. `level`은 문법의 어려움이 아니라 다음
기준으로 정한다.

- L1: 일반적인 Java 코드를 읽고 쓰는 데 필요한 기반
- L2: backend 개발에 필요한 설계, API 선택, trade-off, 실행 동작
- L3: JMM/JVM/runtime/performance를 포함한 심화 추론

페이지를 작성할 때는 가능한 경우 다음 순서를 따른다.

1. 쉬운 진입: 용어보다 먼저 구체적인 문제나 코드 상태를 보여 준다.
2. 정확한 메커니즘: Java/JVM 계약, 상태 변화, 짧은 코드, 비교를 설명한다.
3. 실전 연결: backend 코드, debugging/performance, 면접 추론, 오해하기 쉬운 지점을 연결한다.

`CORE`는 중요한 기반 Concept으로 대략 5–8개의 질문을 작성하고, `STANDARD`는 대략 3–5개를
작성한다. 모든 Concept은 최소 하나의 EASY/MEDIUM/HARD 질문과 전체 3개 이상의 질문을 가져야
한다. 질문 난이도는 Concept level과 독립적이다.

- EASY: 학습 직후 핵심 원칙 확인
- MEDIUM: 코드 결과, 비교, 오해 진단처럼 한 단계 더 추론
- HARD: 여러 조건의 코드, debugging, API 설계, 동시성/JVM reasoning, backend 상황

질문은 빠른 학습 흐름에 맞춰 multiple-choice를 우선한다. 오답은 실제 오해를 반영해야 하며,
SHORT_ANSWER/DESCRIPTIVE/SCENARIO는 필요한 곳의 보조 형식으로 사용한다. 서술형·시나리오형의
정답은 self-check용 model answer로 다루고, canonical answer를 AI나 추측으로 만들지 않는다.

## Source policy

사실 확인 우선순위는 다음과 같다.

1. Java SE 25 JLS
2. Java SE 25 JVMS
3. Java SE 25 API와 Oracle Java guide
4. 적용 가능한 OpenJDK JEP/project documentation

Effective Java, Modern Java in Action 등 검증된 서적과 NAVER D2, 우아한형제들, LINE/LY,
Kakao 계열, Hyperconnect 등의 기술 자료는 주제 발견과 실전 맥락에 사용할 수 있다. 단, 오래된
글의 runtime 주장은 현재 Java 25 공식 자료와 대조한다. URL은 실제로 확인한 공식 자료만 기록하고
추측으로 만들지 않는다.

## LearningArea boundaries

- Data Structures & Algorithms가 BFS/DFS, shortest path, binary search, DP 이론을 소유한다.
  Java는 해당 문제를 구현하는 API와 도구만 다룬다.
- Operating Systems가 scheduling, process, virtual memory, system call을 깊게 소유한다.
  Java는 코드에 필요한 Java thread/JVM 경계만 다룬다.
- Spring이 container, Bean lifecycle, MVC, transaction/AOP framework 동작을 소유한다.
  Java는 reflection, proxy, annotation, thread처럼 Spring이 기반으로 삼는 언어/runtime만 다룬다.
- Database가 DB transaction, isolation, locking을 소유한다. Java는 필요한 I/O/JDBC resource
  계약만 다룬다.
- Performance/Observability/Operations가 전체 운영 진단을 소유한다. Java는 JVM/JFR/jcmd,
  heap/thread의 기본 해석만 제공한다.

## Visualization policy

이미지는 모든 Concept에 요구하지 않는다. 상태 전이, 참조 관계, 실행 순서가 글만으로 오해되기
쉬운 경우에만 `visualization: true`와 `visualizationNote`를 사용한다. 대표 후보는 pass-by-value,
object/reference sharing, inheritance/composition, HashMap lookup, collection mutation, Stream
pipeline, NIO Buffer, virtual thread, race interleaving, happens-before/CAS, class loading,
JVM data areas, GC reachability, process memory이다. 나중의 Concept 페이지에서는 text/ASCII
diagram도 충분한 시각화 수단으로 본다.

## Maintenance

Topic/Concept key는 임의로 재사용하지 않는다. split/merge가 학습 경계를 실제로 개선할 때만
변경하고 PR에 이유와 기존 key migration을 기록한다. 이 foundation 파일만 변경하는 작업에서는
Concept Markdown, Question, import parser, backend/frontend 기능을 함께 추가하지 않는다.

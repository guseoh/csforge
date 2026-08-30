# Java Curriculum Foundation

이 디렉터리는 Java Content Pack을 작성하기 전에 합의한 **canonical 학습 지도**를 보관한다.
`java.yaml`은 Slice 4 import 입력이나 애플리케이션 런타임 설정이 아니다. 이 파일을 읽기 위한
backend/frontend 기능이나 runtime YAML parser를 추가하지 않는다.

## Baseline

- Area: `java`
- Language baseline: Java SE 25
- Canonical map: **18 Topics / 145 Concepts**
- Future canonical content identity: `java.core.*`
- 하나의 Concept는 정확히 하나의 primary Topic 아래에 둔다.
- Topic은 선형 강의 코스가 아니다. `order`는 기본 탐색/작성 순서이고 실제 선행 지식은 필요한 Concept에만 `prerequisites`로 기록한다.
- key는 canonical identity 후보이므로 임의로 재사용하거나 의미를 바꾸지 않는다.

Java 언어 규칙, JVM specification, 특정 JDK/HotSpot implementation, OS behavior를 항상 구분한다.
Java SE 25에서 현재 보장되는 내용을 우선하고 version-dependent runtime 설명은 현재 공식 자료와 대조한다.

## Authoring schema

`java.yaml`의 현재 `schemaVersion`은 `2`이다.

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
        order: 10
        level: 1|2|3
        objective: ...
        density: CORE|STANDARD
        visualization: NONE|TEXT|DIAGRAM
        prerequisites:
          - java.core.<topic>.<concept>
        visualizationNote: ...
```

`prerequisites`와 `visualizationNote`는 필요할 때만 둔다.

## Concept authoring contract

각 Concept에는 하나의 주된 학습 목표만 둔다. 여러 독립 학습 목표를 수량을 줄이기 위해 한 Concept에 합치지 않는다.

### 설명 깊이

실제 Concept 페이지는 필요한 경우 다음 세 층으로 작성한다.

1. **쉬운 진입**: 전문 용어보다 먼저 문제 상황, 코드 상태, 실제 결과를 쉬운 한국어로 설명한다.
2. **정확한 메커니즘**: Java/JVM 계약, 상태 변화, 코드, 비교와 trade-off를 정확한 용어와 함께 설명한다.
3. **실전 연결**: backend 코드, debugging/performance, 면접 reasoning, 흔한 오해 또는 필요한 심화 내용으로 연결한다.

쉽게 설명한다는 이유로 기술적 정확성을 희생하지 않는다. `가시성(visibility)`, `원자성(atomicity)`처럼
필요한 용어는 쉬운 설명 뒤에 정확한 이름을 함께 소개한다.

### Level

- **L1**: 일반적인 Java 코드를 읽고 쓰는 데 필요한 기반
- **L2**: backend 개발에 필요한 설계, API 선택, trade-off, 실행 동작
- **L3**: JMM/JVM/runtime/performance를 포함한 심화 추론

Question difficulty는 Concept level과 독립적이다.

## Question policy

모든 Concept은 최소 다음 난이도를 가진다.

- `EASY >= 1`
- `MEDIUM >= 1`
- `HARD >= 1`
- 총 `>= 3`

정확히 세 문제로 고정하지 않는다.

- `STANDARD`: 대략 3–5문제
- `CORE`: 대략 5–8문제

난이도 의미:

- **EASY**: 학습 직후 핵심 원칙 확인
- **MEDIUM**: 코드 결과, 비교, 흔한 오해처럼 한 단계 추가 추론
- **HARD**: 여러 조건의 코드, debugging, API 설계, concurrency/JVM reasoning, backend 상황을 결합

HARD를 obscure trivia로 만들지 않는다.

문제는 빠른 반복 학습에 맞춰 `MULTIPLE_CHOICE`를 우선한다.
객관식 distractor는 실제로 발생하는 오해를 사용한다. 명백히 무관한 선택지로 정답을 노출하지 않는다.
`SHORT_ANSWER`, `DESCRIPTIVE`, `SCENARIO`는 학습 가치가 있을 때 보조적으로 사용한다.

## Source policy

기술 사실의 우선순위:

1. Java SE 25 JLS
2. Java SE 25 JVMS
3. Java SE 25 API / Oracle Java guides
4. 적용 가능한 OpenJDK JEP / project documentation

Curriculum 발견과 실전 맥락에는 다음 자료를 폭넓게 참고할 수 있다.

- *Effective Java*, 3rd edition
- *Modern Java in Action*
- 검증된 Java/JVM 서적·conference material
- NAVER D2
- 우아한형제들 기술블로그
- LINE/LY Engineering
- Kakao/KakaoPay 기술 자료
- Hyperconnect 등 검증된 국내/기업 기술 자료

오래된 기술 글은 중요한 실전 자료가 될 수 있지만 현재 Java 25의 runtime behavior를 덮어쓰지 않는다.
URL은 실제로 확인한 reference만 기록하며 추측해서 만들지 않는다.

## LearningArea boundaries

- **Data Structures & Algorithms**: BFS/DFS, shortest path, binary search, DP 같은 알고리즘과 자료구조 이론을 소유한다.
  Java는 collection, comparator, queue, heap, Map/Set과 coding-test 구현 API를 다룬다.
- **Operating Systems**: scheduling, process, virtual memory, system call을 깊게 다룬다.
  Java는 Java code를 이해하는 데 필요한 Thread/JVM/JMM 경계를 다룬다.
- **Spring**: container, Bean lifecycle, MVC, transaction, AOP framework behavior를 소유한다.
  Java는 construction, reflection, annotation, proxy, threading처럼 Spring의 기반 mechanism을 다룬다.
- **Database**: transaction, isolation, locking, schema/persistence semantics를 소유한다.
  Java는 Java I/O/JDBC resource ownership contract까지만 다룬다.
- **Network & HTTP**: protocol, socket/network architecture를 소유한다.
  Java는 byte/character I/O와 NIO Channel/Buffer/Selector abstraction을 다룬다.
- **Performance / Observability / Operations**: production diagnosis와 운영 대응을 소유한다.
  Java는 JVM/JFR/jcmd, heap/thread 등 runtime evidence를 읽기 위한 기반을 다룬다.

## Visualization policy

`visualization`은 다음 세 값 중 하나다.

- `NONE`: 설명과 코드로 충분
- `TEXT`: text/ASCII diagram이면 충분
- `DIAGRAM`: 실제 diagram/image가 학습 효과를 크게 높임

모든 Concept에 그림을 강제하지 않는다. pass-by-value, HashMap lookup, Buffer 상태,
virtual thread, race interleaving, happens-before/CAS, class loading, JVM data areas,
GC reachability처럼 관계·상태·실행 순서가 글만으로 오해되기 쉬운 곳에 우선 사용한다.

## Maintenance

- Topic/Concept key는 임의로 재사용하지 않는다.
- split/merge가 실제 학습 경계를 개선할 때만 변경하고 PR에 이유와 migration 영향을 기록한다.
- Concept `order`는 기본 탐색/작성 순서이며 Topic 간 강제 선행관계를 뜻하지 않는다.
- `prerequisites`는 실제 선행 지식이 필요할 때만 선택적으로 추가한다.
- Foundation 변경 PR에서는 Concept Markdown, Question, import parser, backend/frontend 기능을 함께 변경하지 않는다.

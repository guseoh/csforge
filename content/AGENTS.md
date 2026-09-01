# CSForge LearningArea Content Authoring Rules

이 파일은 `content/` 아래 LearningArea, Topic, Concept, Question을 작성·수정·검토할 때 적용하는 콘텐츠 전용 규칙이다. 루트 `AGENTS.md`와 `content/README.md`를 함께 따르되, 학습 콘텐츠의 설명 깊이·자료 선정·질문 품질·검토 방식에 대해서는 이 파일을 우선 기준으로 삼는다.

## 1. 목표

CSForge의 학습 콘텐츠는 용어 사전이나 면접 답안 모음이 아니다. 학습자가 개념을 실제 backend 문제와 연결해 설명하고, 코드·상태 변화·실패 경로·trade-off를 근거로 판단할 수 있게 만드는 것이 목표다.

설명은 너무 얕은 정의 나열도, 구현 세부를 끝없이 파고드는 과도한 심화도 피한다. 기본적으로 실제 학습과 면접에 도움이 되는 수준에서 시작하고, 중요한 개념은 runtime·framework·DB·OS·network 같은 하위 계층까지 필요한 만큼 내려간다.

## 2. 설명 깊이의 기준

Concept는 가능하면 다음 흐름이 자연스럽게 이어지도록 작성한다.

`문제 상황 → 왜 문제가 되는가 → 개념/계약 → 내부 동작과 상태 변화 → 실패 경계 → 코드·SQL·HTTP·설정과의 연결 → 실무 판단과 trade-off`

모든 항목을 동일한 제목으로 강제하지 않는다. 영역과 개념에 맞게 구조를 바꾸되, 학습자가 "그래서 실제로 무슨 일이 일어나는가"를 설명할 수 있어야 한다.

다음 정도의 구체성을 목표로 한다.

- "Idempotency는 중복 요청을 막는다"에서 끝내지 않는다. 예를 들어 **타임아웃 한 번이 왜 이중 결제를 만들 수 있는지**, client retry와 server 처리 완료 시점이 어떻게 어긋나는지, idempotency key가 어느 상태를 저장하고 어떤 결과를 재사용해야 하는지까지 연결한다.
- "같은 요청이 두 번 와도 안전하다"에서 끝내지 않는다. **같은 요청이 두 번 와도 결과가 한 번만 반영되게 만들려면 어떤 invariant와 저장 경계가 필요한지**, DB unique constraint·transaction·application check의 차이와 race condition까지 필요하면 설명한다.
- "flush는 데이터를 보낸다"처럼 추상적으로 끝내지 않는다. Java buffer, DB persistence context, OS page cache 등 동명의 용어가 다른 계층에서 무엇을 의미하는지 구분하고 현재 Concept이 어느 계층의 보장을 설명하는지 명확히 한다.

핵심 개념은 깊게 설명하되, 주변 개념까지 동일한 분량으로 확장하지 않는다. 하나의 Concept 안에서 같은 정의·결론·코드·요약을 반복하지 않는다.

## 3. 문체와 구성

연결된 한국어 설명형 문단을 기본으로 한다. 한두 문장짜리 메모를 연속해서 쌓지 않는다. 원인과 결과가 이어지는 내용은 한 문단 안에서도 `왜 시작되는가 → 내부에서 무엇이 일어나는가 → 상태가 어떻게 바뀌는가 → 결과가 무엇인가`가 보이도록 작성한다.

목록·표·짧은 문장은 실제 비교, 조건, 실행 순서, 상태 전이, 선택지 정리가 필요한 경우에 사용한다. 설명을 목록으로 대체하지 않는다.

모든 Concept을 `정의 → 예시 → 장점 → 주의점 → 요약` 같은 동일한 템플릿으로 작성하지 않는다. 공통 품질 기준은 유지하되 Java, Spring, Database, Security, Backend Engineering, OS, Network 등 영역마다 가장 이해하기 좋은 구조를 선택한다.

쉬운 용어로 문제와 직관을 먼저 잡고 정확한 기술 용어를 연결한다. 단, 쉽게 설명한다는 이유로 실제 보장·경계·실패 조건을 생략하거나 틀리게 단순화하지 않는다.

## 4. 코드·SQL·HTTP·도식 사용

코드나 설정은 기능 시연용 장식이 아니라 현재 개념의 동작을 확인하기 위해 사용한다. 예제를 제시했다면 무엇을 하는 코드인지보다 **왜 이 코드가 필요한지, 생략하면 어떤 문제가 생기는지, 어느 계층이 어떤 보장을 제공하는지**를 설명한다.

필요하면 Java 코드, Spring 설정, SQL, transaction timeline, HTTP request/response, thread interleaving, JVM/OS 상태 등을 사용한다. 도식은 참조 관계·상태 전이·실행 순서처럼 시각화가 실제 이해를 높일 때 사용하며, 텍스트로 충분한 개념에 기계적으로 추가하지 않는다.

실행하지 않은 코드나 결과를 실행한 것처럼 쓰지 않는다. implementation-dependent 동작은 language/framework/protocol specification의 보장처럼 일반화하지 않는다.

## 5. Reference 규칙

Reference를 공식 문서만으로 채우지 않는다. 기술적 사실과 버전별 동작을 검증할 때는 가장 구체적인 primary source를 우선하지만, 학습 이해를 높이는 좋은 한국어 자료도 적극적으로 포함한다.

자료 우선순위는 다음을 기본으로 한다.

1. 공식 specification, reference documentation, 공식 프로젝트 문서, RFC, JEP, 공식 source/repository
2. 한국 IT 기업 기술 블로그와 엔지니어링 자료: NAVER D2, 우아한형제들, LINE/LY, Kakao/KakaoPay, Toss, 당근, Hyperconnect 등
3. 검증 가능한 한글 기술 블로그, 교육 자료, 공개 강의 자료, 깊이 있는 개발자 글
4. 필요할 때 신뢰할 수 있는 영문 기술 자료, 논문, 책/컨퍼런스 자료

공식 문서는 정확성 검증의 기준이고, 한국어 기술 자료는 구조·사례·실무 맥락을 보충하는 학습 자료다. 둘 중 하나만 기계적으로 고르지 않는다.

Reference는 현재 Concept과 직접 연결되는 구체적인 페이지를 사용한다. 문서 루트나 검색 페이지보다 해당 계약·동작을 설명하는 정확한 페이지를 우선한다. 실제로 확인하지 않은 URL이나 존재하지 않는 출처를 만들지 않는다.

한국 IT 기업 글을 억지로 채우지 않는다. 직접 관련된 좋은 자료가 없으면 검증된 한글 기술 자료나 primary source를 사용한다. 반대로 좋은 한국어 자료가 있는데도 공식 문서 하나만 반복해서 넣는 방식은 피한다.

## 6. 영역별 정확성 경계

각 LearningArea는 자기 계층의 보장과 인접 계층의 구현을 구분한다.

- Java: Java Language Specification, JVM Specification, JDK/HotSpot 구현, OS 동작을 구분한다.
- Spring: Spring Framework 계약, Spring Boot 자동 구성, JPA/Hibernate, servlet container/JVM 동작을 섞지 않는다.
- Database: SQL 표준, PostgreSQL/MySQL 구현, JPA/Hibernate 동작, application transaction policy를 구분한다.
- Network/HTTP: protocol semantics와 browser/proxy/CDN/application policy를 구분한다.
- OS/Infra: process/kernel/container/VM/cloud boundary와 실제 resource ownership을 구분한다.
- Security: authentication, authorization, session/token, browser security, network/TLS 경계를 섞지 않는다.

JMM, GC, concurrency, transaction, network, distributed consistency처럼 작은 오해가 큰 오류로 이어지는 주제는 primary source나 실제 검증 근거를 더 엄격하게 확인한다.

## 7. Question 작성 규칙

Question은 Concept 제목이나 정의를 그대로 되묻지 않는다. 학습자가 상태 변화, 코드 결과, 실패 원인, 선택 기준을 실제로 이해했는지 검증해야 한다.

난이도는 개념마다 기계적으로 EASY/MEDIUM/HARD를 하나씩 배치하는 quota가 아니다. Topic과 LearningArea 전체 coverage를 보고 필요한 문제 수와 유형을 결정한다.

- EASY: 학습 직후 핵심 계약이나 직접적인 상태 결과를 확인한다.
- MEDIUM: 코드 결과, 두 개념 비교, 흔한 오해, 한 단계의 원인·결과 추론을 요구한다.
- HARD: 여러 상태 변화, transaction/thread/request timeline, 장애 상황, 성능/정합성 trade-off 등 실제 다단계 추론을 요구한다.

HARD 문제를 obscure trivia나 긴 문장으로 어렵게 만들지 않는다. `운영`, `실무`, `대규모` 같은 단어를 붙였다는 이유만으로 HARD가 되지 않는다.

`MULTIPLE_CHOICE`의 오답은 같은 주제에서 실제로 헷갈리는 misconception이어야 한다. `SHORT_ANSWER`는 결정적인 값·API·상태처럼 짧고 안정적으로 채점할 수 있을 때 사용하고, 원인과 결과를 설명해야 하는 문제는 `DESCRIPTIVE` 또는 `SCENARIO`를 사용한다.

## 8. 기존 LearningArea 수정 규칙

기존 LearningArea를 개선할 때 일부 샘플만 보고 전체 품질을 판정하지 않는다. 먼저 해당 영역의 Curriculum, Topic, Concept, Question을 전수 또는 충분히 체계적으로 검토해 실제 보강 대상과 유지 가능한 대상을 구분한다.

이미 품질이 확보된 Concept을 형식 통일을 이유로 다시 쓰지 않는다. 수정은 실제 문제를 해결하는 최소 범위로 한다.

기존 `contentKey`, Topic 순서, Concept 연결, Question-Concept 연결, canonical contract는 명시적인 변경 이유 없이 바꾸지 않는다. 재작성보다 정밀 보강이 적절하면 보강만 한다.

## 9. 새 LearningArea 작성 규칙

새 영역은 먼저 Curriculum에서 Topic 범위, boundary, Concept key, objective, level/density를 확정한 뒤 canonical content를 작성한다. 영역별로 설명 구조를 동일하게 만들 필요는 없지만, 이 파일의 공통 품질 기준은 모두 적용한다.

Concept 수나 Question 수 자체를 성과로 보지 않는다. 누락된 핵심 개념이 없는지, 인접 Concept의 책임이 중복되지 않는지, 현재 backend 학습 목표에 필요한 깊이가 확보됐는지를 우선한다.

새 LearningArea를 완료 판정하기 전에 최소한 다음을 전체 단위로 다시 본다.

- Curriculum과 canonical Concept key parity
- Topic 순서와 Concept boundary
- 설명 깊이와 중복
- reference의 정확성·다양성·직접 관련성
- Question coverage와 난이도
- broken link, duplicate key/order, schema/import validation

## 10. 대규모 LearningArea 작업 실행 규칙

여러 기존 영역의 재검토와 새 영역 생성을 한 번에 요청받더라도 작업은 **순차적으로** 진행한다. 서로 다른 영역을 병렬로 수정하지 않는다. 한 단계의 결과를 검토하고 기준을 고정한 뒤 다음 단계로 이동한다.

기본 순서는 다음과 같다.

1. 현재 branch, HEAD, working tree, canonical contract 확인
2. 이 파일과 루트 `AGENTS.md`, `content/README.md`, 관련 curriculum 확인
3. 기존 LearningArea 전체 품질 재검토 및 수정 대상 판정
4. 필요한 기존 영역 보강
5. static/schema/link/key validation
6. 다음 LearningArea 작성
7. 해당 영역 전체 self-review
8. validation/test/build 가능한 범위 실행
9. 실제 diff 재검토
10. commit/push/PR 및 최종 상태 보고

병렬 agent나 병렬 branch로 여러 LearningArea를 동시에 작성해 품질 기준이 갈라지는 방식을 사용하지 않는다.

## 11. 완료 기준

LearningArea가 완료됐다는 것은 파일이 많이 생성됐다는 뜻이 아니다. 학습자가 핵심 문제를 이해하고, 내부 동작과 상태 변화와 실패 경계를 설명하며, backend 상황에서 선택 근거를 말할 수 있고, Question이 그 이해를 검증하며, Reference가 실제로 확인 가능한 근거를 제공해야 한다.

최종 검토에서는 특히 다음을 확인한다.

- 정의만 나열한 Concept이 남아 있지 않은가
- 같은 결론을 여러 문단에서 반복하지 않는가
- 코드가 동작 설명 없이 장식처럼 들어가 있지 않은가
- 중요한 state change와 failure path가 빠지지 않았는가
- 공식 문서만 반복하고 이해를 돕는 한국어 자료를 놓치지 않았는가
- 반대로 블로그의 implementation detail을 표준 보장처럼 쓰지 않았는가
- 문제 난이도가 실제 reasoning depth와 일치하는가
- 기존 canonical key와 import contract를 깨지 않았는가

# #278 두 번째 Pack — J-object-model

기준: `refactor` `8438fdc9c4f23de39ce747f70e64fe8a6a0b0169`, 2026-10-25 KST.
fetch 후 HEAD와 origin/refactor 일치, 작업 트리 clean을 확인했다.
[첫 Pack 최종 승인](https://github.com/guseoh/csforge/issues/278#issuecomment-6387006866)을 선행 조건으로 확인했다.
이번 범위는 **12 Concept / 68 Question / V1 4개·V2 3개 / 구조 ASCII 12개**다.
구현·검증 완료 기록이며 독립 리뷰 승인을 대신하지 않는다. 다음 Pack은 착수하지 않는다.

## 범위와 설계

- canonical 수정은 `content/java/object-model/`과 Curriculum의 해당 Topic visualization/note뿐이다. 다른 Topic·기존 SVG 27개는 변경하지 않았다.
- 이미 정확한 합쇼체 문단·예시·학습 순서는 유지하고, 실제 설명의 빈틈과 보장 경계만 보강했다. NONE 5개에도 본문·문항 검토를 적용하되 그림을 강제하지 않았다.
- `contentKey`, topic/slug, level, PUBLISHED 상태, 순서와 Question/선택지 key·정답·난이도·연결을 유지했다. Concept 병합·삭제나 DB schema/API/인증 변경은 없다.
- 기존 canvas/노드/화살표/단계 컨트롤/그레이 토큰/오류 경계를 재사용했다. `java-object-model` 하나에 일곱 **고정 예제**만 추가했다. 범용 그래프·사용자 코드 실행·새 조작 엔진·라이브러리는 추가하지 않았다.
- JSON 버전 1과 기존 일곱 타입, 길이/개수 제한, CommonMark 문맥 인식은 유지한다. `example` 외의 코드·좌표·조건·노드 목록은 거부한다. 공유 fixture에 정상 7개·오류 8개를 추가했다.
- 상태 모델은 readonly snapshot이며 Reader의 일시적인 상태다. 개인 진도·평가·복습 데이터로 저장하지 않는다. 참조·L1/L2/M/N·호출 경로는 논리적 관계이며 주소·배치·vtable·할당 수·GC 시점을 주장하지 않는다.

## Concept별 완료 결과

키 접두사는 `java.core.object-model.`이다. DONE은 본문과 목표 도식의 구현·검증 완료,
NO_VISUAL_NEEDED는 본문 검토 완료 및 #277의 NONE 판정 유지를 뜻한다.

| Concept | #277 필요/목표 | 상태 | 변경·검토 근거 | Question |
| --- | --- | --- | --- | ---: |
| `class-object-constructor` | NONE | NO_VISUAL_NEEDED | 변수 선언/객체 생성/정상 생성자 반환 구분. ASCII를 문장으로 정리하고 실패·this 노출 경계, 암시적 기본 생성자와 접근 가능한 super() 조건 보강 | 5 |
| `static-vs-instance-members` | RECOMMENDED / V1 | DONE | Member.totalCount=2와 a/b.name=kim/lee 관계. 같은 클래스 정의의 공유이며 ++ 원자성·다른 defining loader까지 단일 상태라는 보장은 없음 | 5 |
| `initialization-order-constructor-chaining` | REQUIRED / V2 | DONE | 8단계의 기본값→전반부→this/super→소스 순서 필드/블록→후반부. 같은 객체와 별도 parameter 구분, 위임 시 초기화 1회. 전반부 필드 대입 제한 명시, 기존 null→kim 예제 유지 | 6 |
| `encapsulation-invariants` | NONE | NO_VISUAL_NEEDED | Stock 생성 검증과 decrease 전후 5→3·부족 실패 후 3 유지. 상태 규칙을 소유하되 캡슐화가 동시성 원자성까지 제공하지 않음을 명시 | 7 |
| `abstraction-responsibility` | NONE | NO_VISUAL_NEEDED | ASCII를 책임 경계의 문장으로 통합. 호출 계약과 SDK 구현, 결제 거절/통신 시간 초과의 실패 의미와 번역 책임 구분 | 5 |
| `inheritance-is-a` | RECOMMENDED / V1 | DONE | CardPayment→Payment 타입 간선과 Report→FileUtil 기능 사용을 구별. Java 타입 검사와 행동 대체 가능성의 검증 책임 분리 | 5 |
| `composition-collaboration` | RECOMMENDED / V1 | DONE | OrderService 위임과 Fixed/RateDiscountPolicy 구현 간선 구별. 중복 ASCII 2개 통합. 할인 금액 계산의 메서드 의미와 final 협력 참조의 생성 시 조합을 명확화 | 7 |
| `polymorphism-dynamic-dispatch` | RECOMMENDED / V2 | DONE | 같은 한 번의 호출을 Animal의 호출 검사→실제 Dog 구현 선택→dog 출력 3단계로 표현. 필드/static·null 수신·JVM 구현과 구분 | 6 |
| `overload-vs-override` | NONE | NO_VISUAL_NEEDED | C-Object/P-String 비교로 먼저 서명 선택 후 구현 선택을 대조. null의 가장 구체적인 후보/모호성 설명. 반환 타입만으로 구별 불가 유지 | 5 |
| `reference-casting-instanceof` | RECOMMENDED / V1 | DONE | 실제 Dog 성공·실제 Cat 실패와 같은 객체 유지. null cast와 instanceof/메서드 호출 차이를 보강하고 객체 변환/복제로 표현하지 않음 | 5 |
| `interface-vs-abstract-class` | NONE | NO_VISUAL_NEEDED | 역할 계약과 공통 상태/초기화 책임 구분. 추상 타입을 직접 생성하지 못해도 기반 생성자는 참여하며 인스턴스 상태는 객체별임을 보강 | 5 |
| `immutability-defensive-copy` | REQUIRED / V2 | DONE | 목록 공유→구조 복사→원본 추가 분리→M 변경 공유→copy.add 거부 6단계. 구조 ASCII 3개 통합. String/가변 원소·null 거부·뷰/스냅샷·할당 비보장 구분 | 7 |

기존 Markdown 강조·표·코드·API 이름을 보존했다. 불완전한 코드 골격은 실행 결과 검증 대상과 구별하고,
복사 예제의 중복 `members = ...` 골격은 새 완전한 가변 원소 예제로 통합했다.
새 literal 강조 결함은 발견하지 않았으며 실제 Reader 렌더링에서 강조·코드 복사·도식 선언 소거를 검증했다.
이 Pack은 기존 외부 SVG 사용이 없으므로 SVG 삭제·교체는 없다. Java 기존 27개 파일의 해시도 유지된다.

## Question 68개 전수 검토

62개 객관식·3개 서술형·3개 시나리오의 prompt/정답/distractor/해설·모범 답안/난이도/Concept 연결을 모두 대조했다.
정답과 난이도를 바꿀 근거는 없었다. 다음 두 q4만 필요한 정확성 교정을 했다.

1. `initialization-order-constructor-chaining.q4`: 전반부의 단순 대입은 **현재 클래스에 선언되고 초기화 식이 없는 필드**에 한정된다는 조건을 C 근거·해설에 명시. 정답 C 유지.
2. `overload-vs-override.q4`: `int parse(String s)` / `long parse(String s)`에 각각 유효한 반환 본문을 넣었다. 두 메서드는 단독으로는 컴파일되지만 함께 선언하면 충돌하므로, 미완성 선언 구문이 아니라 반환 타입만 다른 오버로드의 문제임을 명확화. 정답 D 유지.

다른 66개 Question은 그대로다. 생성자 검증/기본 생성자, static 공유, PIC/AXB/STIPJC,
선언 타입과 수신 객체·AB 필드/메서드 결과, null/패턴 변수, 역할 계약, 얕은 복사·내부 List/Date 노출,
할인/배송 조합과 외부 SDK 경계의 해설도 본문 목표와 충돌하지 않는다.
Question key·선택지 key/본문/순서·정답·난이도·연결은 baseline 비교에서 모두 유지했다.

## 공식 Reference와 Java 검증 근거

Java 25의 규범을 우선 확인하고, 한국어 보조 글은 설계 사례로 유지했다. 보조 글 다섯 URL과 Oracle Object 튜토리얼에도 접속했다.
Oracle 튜토리얼은 JDK 8 대상의 기본 관점이며 Java 25 생성자 규칙의 근거로 사용하지 않았다.
Tecoble 불변성 글의 stack/heap·주소 비유도 언어 보장으로 읽지 않도록 해당 relationNote에 한계를 명시했다.
추가한 canonical Reference는 실제 확인한 JLS 6.5.6.1 하나다. 기존 유효 Reference는 유지했다.

| 확인한 경계 | 공식 근거 |
| --- | --- |
| 클래스·생성자·상속·재정의·기본 생성자 | [JLS 8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html) |
| 초기 생성 문맥·필드 단순 대입 조건 | [JLS 6.5.6.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.5.6.1), [JLS 8.8.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8.7) |
| 초기화·위임·생성 중 메서드 호출 | [JLS 12.4/12.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html) |
| static 상태가 속하는 런타임 클래스 정의 | [JVMS 5.3](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html#jvms-5.3) |
| 필드 접근·오버로드·동적 호출·타입 검사 | [JLS 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html), [JLS 5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html) |
| 인터페이스의 역할/구현 | [JLS 9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html) |
| 구조 스냅샷·null 거부·원소 공유 | [List.copyOf](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)) |

[ObjectModelJavaTest](../../../../backend/src/test/java/com/guseoh/csforge/importcontent/ObjectModelJavaTest.java)는 JDK 컴파일러와 별도 Java 프로세스를 사용한다.
선택한 실제 Markdown fence를 실행 문맥에 넣으며, 주석·선언 골격까지 모두 독립 프로그램이라고 주장하지 않는다.

- 본문 생성자 7줄 누적 출력과 필드/블록 1회, 별도 재정의 호출 예제의 null→kim을 확인한다.
- 현재 클래스의 초기화 식 없는 필드 대입은 허용되고, 읽기·인스턴스 호출·this 노출·초기화 식 있는 필드/상속 필드 대입·중복/순환 생성자 호출·implicit super의 대상이 없는 경우/없는 무인자 생성자 호출은 거부된다.
- 허용된 전반부 대입을 상위 생성자가 관찰할 때 1/1을 얻는다. 정상 사례와 컴파일 거부 사례를 구분한다.
- 실제 static/dispatch/overload 본문과 10개 출력 문항을 컴파일·실행해 정답 선택지와 대조한다. 정수/문자열 출력 2, 2:2:4, PIC, AXB, STIPJC, B, AB, C, 4, 4가 일치한다.
- 오버로드 q4는 각 메서드 단독 컴파일 성공/함께 컴파일 실패를 확인한다. 캐스트 실패 문항은 ClassCastException을 확인한다.
- copy의 park:2:park:1, 변경 거부, 뷰와 스냅샷의 2:1, 공유 내부 목록과 복사한 내부 목록, null 거부를 확인한다.

## Import·개인 이력·범위 검증

`ContentImportIntegrationTest.objectModelPackPreviewUpdateAndReimportPreserveIdentitiesAndPersonalHistory`는 실제
Topic 1개 + Markdown 12개 + questions.json, **14개 파일 / 81개 canonical 항목**을 사용한다.
PostgreSQL Testcontainers와 실제 HTTP Preview/Apply 경로를 사용한다.

1. 같은 key의 이전 본문과 교정 전 두 Question을 seed한다. 12 Concept에 진도·북마크·노트·quiz/attempt·오답·복습 데이터를 만들고 두 교정 문항에는 선택한 오답도 기록한다.
2. Pack 전체 Preview **ERROR=0**, Concept 12개 + Question 2개 UPDATE, Apply HTTP 200을 확인한다.
3. Concept ID/topic/level/order, Question ID/type/difficulty/status, question_concept, 선택지 ID/key/order와 정답 관계가 같다.
4. 개인 데이터 8개 테이블의 **모든 열 snapshot**이 같으며 attempt.selected_choice_id도 유지된다.
5. 재Preview **81개 전부 UNCHANGED**, CREATED=UPDATED=ERROR=0. 다시 Apply HTTP 200 후 개인 snapshot도 같다.

source baseline 비교에서 해당 12 Concept의 식별/상태 메타데이터와 Curriculum 목표·학습 순서가 일치한다.
다른 Topic의 Curriculum 구간·canonical 파일은 바뀌지 않았고 기존 SVG 27개 해시도 같다.
#277 manifest는 변경 전 감사 증거이므로 덮어쓰지 않았다. snapshot 고정용 #277 validate.py의 전체 해시 일치를 현재 구현의 통과 조건으로 사용하지 않는다.

## 실행한 검증

| 검증 | 결과 |
| --- | --- |
| Frontend lint / 전체 test / build | 72개 파일·493개 테스트, TypeScript/Vite/PWA build 통과 |
| 관련 Frontend 계약·실제 Pack·기존 Markdown/첫 Pack 회귀 | 178개 통과. 상태 순서·초기화 횟수·출력 prefix·복사 후 이전 snapshot 유지 포함 |
| Java 25 코드/문항·공유 계약 | 실제 source 컴파일·실행과 정상/오류 JSON fixture 대조. 전반부 제한의 focused 재검증 통과 |
| Backend 최종 관련 test/build | 5개 파일·33개 테스트 모두 통과(실패·오류·skip 0), build 통과. 실제 Pack Import/개인 이력·기존 Import·전체 canonical bootstrap·공유 계약·Java·실패했던 CA 검증 포함 |
| Repository Validation | 최종 push HEAD의 Backend tests/build·Frontend lint/test/build·Compose 결과를 완료 보고에서 확인 |

재현 명령은 각각 frontend/backend 디렉터리에서 실행한다.

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
.\gradlew.bat test --tests '*ObjectModelJavaTest' --tests '*LearningVisualizationValidationTest' --tests '*ContentImportIntegrationTest' --tests '*CanonicalBootstrapIdempotencyIntegrationTest' --tests '*CaFloatingPointReferenceCorrectionIntegrationTest' build --console=plain
```

로컬 Backend 전체 시도 중 Docker Desktop이 중지되어 named pipe가 사라지면서 기존 CA 테스트의 PostgreSQL 시작 오류가 발생했다.
해당 시도는 중단하고 Docker Desktop/기본 endpoint를 복구했다. 실패한 CA 검증과 이 Pack의 Java/Import/전체 canonical bootstrap을 함께 재시도해 33개가 모두 통과했다.
로컬 전체 suite의 완료 기록은 없으며, 최종 push의 원격 CI에서 전체 suite를 별도로 확인한다.

## 화면 검증

실제 12개 Markdown을 읽는 로컬 메모리 API fixture와 Chromium을 사용했다. 영속성/Import의 증거는 위 실제 PostgreSQL 테스트로 구분한다.

- Guest/Owner 각각 12 Concept 전부: 코드·강조·도식 개수·오류 대체 없음, Guest 개인 입력 없음/Owner 노트 있음 확인.
- 7개 도식 × Guest/Owner × 320/390/768/1024/1280/1440px × light/dark = **168개 화면 조합**에서 페이지 overflow·SVG 글자 경계 잘림·접근성 이름 누락 없음.
- V2 8+3+6 = **17개 상태**를 순서대로 확인. 44px 컨트롤과 Enter/Space 진행, 역이동·초기화·누적 상태를 확인했다.
- static 구성의 간선/범례/정렬을 시각 점검했다. 구현 간선과 겹친 implements 레이블을 옮긴 뒤 해당 Guest/Owner 24개 조합을 다시 확인했다.
- 390px에서 내부 방향키 가로 스크롤·focus outline과 본문 넘침 없음을 확인했다. Owner 노트가 저장됨으로 바뀌어도 복사의 5/6 상태는 유지됐다.
- 시스템 테마는 현재 OS dark를 따라 #181818, 수동 light는 #ffffff, dark는 #181818. 도식 animation none, 브라우저 warn/error 0건.
- 검증 탭/뷰포트와 로컬 fixture 서버를 정리했다. 운영 데이터·Production 배포에는 접근하지 않았다.

## 리뷰 요청과 남은 범위

**이 Pack에서 중단하고 12 Concept/68 Question/7개 도식의 독립 리뷰를 요청한다.** 다음 Pack은 진행하지 않는다.
#278은 전체 33개 Pack Issue이므로 이번 완료가 전체 Issue 종료나 Release 승인은 아니다.
#277 Selector P0(selected-key set과 현재 readiness의 혼동)는 후속 초기 우선 교정 대상으로 유지하며 J-io-nio 본문/자산은 수정하지 않았다.
PR 생성·merge·Production 배포는 하지 않는다.

# #278 첫 Pack — J-language-types

기준: `refactor` `7a784770aeee6df257af058ee32772b2db04a916`, 2026-10-24 KST.
시작 시 fetch 후 `HEAD = origin/refactor`, working tree clean을 확인했다.
[Issue #278](https://github.com/guseoh/csforge/issues/278)의 **S0 + 첫 Topic 10 Concept만** 구현했다.
다음 Pack은 착수하지 않는다. 아래 구현/검증 완료 상태는 사람의 Pack 승인과 별개이며 **리뷰 대기**다.

## 범위와 설계 결정

- 공통 figure, grayscale 토큰, 접근성 canvas, native 단계 컨트롤, 오류 경계를 재사용했다. 새 라이브러리·DB schema·API·인증 정책은 추가하지 않았다.
- 실제 필요한 세 타입만 strict Zod/서버 검증/공유 fixture와 함께 추가했다. `java-value-reference`는 닫힌 세 예제를 공유하며, 배열 저장과 확정 할당은 각각 고정 예제다. 범용 객체 그래프·Java 실행기·임의 분기식은 받지 않는다.
- 기존 JSON `version: 1`과 네 타입, CommonMark 예약 fence 인식, payload 12000자/Markdown 필드당 최대 8개 제한을 유지했다. 옵션이 없는 새 타입도 알 수 없는 필드를 거부한다.
- 참조 A/B는 논리적 동일성이다. 물리 주소·JVM 메모리 영역·객체 allocation 수·즉시 GC·최적화 성능을 Java 언어 보장으로 묘사하지 않는다.
- 10개 본문의 합쇼체·문제 상황/원리/실행 예/오해/실무 경계를 개별 검토했다. 이미 정확한 문단과 제목·코드는 보존하고 필요한 설명과 도식만 고쳤다. 숫자·박싱·String 비교는 코드 결과가 직접 근거이므로 그림을 강제하지 않았다.
- 기존 `contentKey`, slug, topic, level, PUBLISHED 상태, 표시 순서, Question/선택지 key·정답·난이도·Concept 연결을 유지했다. Curriculum에서는 해당 Topic의 visualization/note만 감사 판정과 맞췄다.

## Concept별 완료 현황

키 접두사는 모두 `java.core.language-types.`다. Question 수는 이 Pack의 실제 연결 수이며 총 56개다.
`DONE`은 본문·도식 구현/검증 완료, `NO_VISUAL_NEEDED`는 본문 검토 완료 및 #277의 NONE 판정 유지다.

| Concept | #277 필요/목표 | 최종 상태 | 본문·도식 검토 결과 | 관련 Question |
| --- | --- | --- | --- | ---: |
| `primitive-reference-values` | REQUIRED / V2 | DONE | 원시 값 복사, Member A 공유, kim→lee, second→B/park를 9단계로 분리. 물리 주소를 배제하고 이전 snapshot 보존 | 6 |
| `variables-scope-definite-assignment` | RECOMMENDED / V1 | DONE | 두 분기 대입과 합류 도식. 지역 변수의 확정 할당/이름 범위와 객체 도달 가능성·회수 시점을 구별. 기존 GC 관련 잘못된 문장 교정 | 6 |
| `numeric-conversion-overflow` | NONE | NO_VISUAL_NEEDED | narrowing 결과 -1294967296, int 합 -294967296과 선행 long 승격 4000000000, Math.toIntExact 실패, widening 정밀도 손실, double 출력 확인 | 6 |
| `boxing-unboxing-wrapper` | NONE | NO_VISUAL_NEEDED | null 비교와 언박싱 NPE 구별, Map 부재/명시적 null/getOrDefault 경계 보강. 상수 박싱 동일성 보장과 구현 캐시 범위 구별 | 7 |
| `pass-by-value` | REQUIRED / V2 | DONE | #276의 replace(Member) 5단계 유지. caller A/kim과 parameter B/park 구별, 반환 후 즉시 수거로 해석하지 않음. 중복 ASCII 2개 제거 | 6 |
| `arrays-covariance-runtime-check` | REQUIRED / V2 | DONE | 같은 String[2]를 보는 두 선언 타입, String 저장 성공→Integer 저장 검사→ArrayStoreException의 5단계. null 허용·실패 원소 불변·기존 성공 보존 | 5 |
| `final-reference-and-immutability` | RECOMMENDED / V1 | DONE | final names 재대입 금지와 가변 ArrayList 분리. copyOf의 구조 변경 불가·원본 구조 변경 비반영·가변 원소 공유·할당 비보장 보강 | 5 |
| `string-immutability-equality` | NONE | NO_VISUAL_NEEDED | ==/equals·재대입·불변성 코드 대조. Locale.ROOT 전제와 메서드 호출마다 새 객체를 만들지는 않는다는 경계 보강 | 6 |
| `string-pool-interning` | RECOMMENDED / V1 | DONE | literal/pooled→A, created→B 관계. intern 반환이 created나 B를 변경하지 않음. 리터럴·상수 연결/비상수 연결의 동일성 차이 유지 | 4 |
| `stringbuilder-mutable-text` | RECOMMENDED / V1 | DONE | 기존 static-flow로 같은 builder의 append→toString 시점→불변 결과. snapshot은 실시간 뷰가 아님. 성장률·일률적인 성능 주장 배제 | 5 |

도식 7개는 V1 4개/V2 3개로 감사 목표와 일치한다. 기존 구조 ASCII 7개는 도식에 통합하거나 중복 설명으로 정리했다.
기존 코드 블록·표·API 이름을 유지했고 실제 Markdown 렌더러에서 한글 강조, 인라인 코드, 코드 복사와 도식 선언 소거를 검증했다.
Pack에서 새 literal 강조 결함은 발견하지 않았다. #275의 구두점 인접 강조 보정과 #276의 CommonMark 문맥 처리를 회귀 유지했다.

## 기존 SVG 처리

| 기존 경로 (`/learning/java/`) | #277 결정 | 이번 처리 |
| --- | --- | --- |
| `values-and-references.svg` | REBUILD → V2 | canonical 참조를 값·참조 9단계 inline 도식으로 교체 |
| `array-covariance.svg` | REBUILD → V2 | canonical 참조를 배열 저장 5단계 inline 도식으로 교체 |
| `stringbuilder-mutable-text.svg?v=2` | RESTYLE → V1 | 기존 누적→String 의미를 공통 흑백 inline static-flow로 이관 |
| `pass-by-value.svg` | KEEP (기존 canonical 미사용) | 기존 이미지 회귀 fixture와 이전 저장 본문 호환을 위해 그대로 유지 |

새 canonical 본문은 위 세 외부 이미지를 더 이상 요청하지 않는다. SVG 파일 자체는 삭제·변경하지 않았다.
아직 재import하지 않은 DB의 저장 본문도 과거 경로로 읽을 수 있어야 하기 때문이다.
Java 기존 27개 SVG의 파일·LF 정규화 해시는 #277과 모두 같다. 다른 Topic의 자산 처리 결정은 이번에 실행하지 않았다.

## Question 전량 검토

56개 전체의 문제·정답·distractor·모범 답안·해설·난이도·Concept 연결을 대조했다. 54개 객관식, 1개 서술형, 1개 시나리오다.
기존 난이도와 정답을 바꿀 근거는 없었고, 다음 세 문항만 필요한 표현을 교정했다.

- `numeric-conversion-overflow.q2`: 고정 int 상수의 합은 실제로 오버플로하므로 질문/B 선택지/근거의 불확정 표현 제거. 정답 B와 나머지 distractor 유지.
- `boxing-unboxing-wrapper.q3`: -128~127 int 상수 표현식 박싱의 동일성은 JLS 보장이다. 이를 전부 캐시의 우연으로 설명하던 해설 교정. 1000의 동일성은 일반 보장이 없으며 값 비교 정답 D 유지.
- `string-pool-interning.q3`: 비상수 연결은 새 String을 생성하므로 해당 b와 리터럴 비교는 false라고 B의 오답 근거를 명확화. 내용 비교 정답 A 유지.

null/Map 시나리오, long ID 변환, 공유 객체 변경/매개변수 재대입, 배열 null 저장과 실패 전 저장 보존,
blank final/비정상 종료, Locale/상수 연결, builder snapshot 문항도 새 본문과 충돌하지 않는다.
사람의 전 Concept/Question 리뷰는 이 기록과 canonical diff를 대상으로 요청한다. 승인 완료로 기록하지 않는다.

## 정확성 근거

Java 25 공식 원문의 해당 규칙을 확인하고 같은 경계를 실행/컴파일 결과와 대조했다.
새 Reference는 학습에 필요한 Math.toIntExact, List.copyOf만 추가했다. 기존 공식 근거와 D2 보조 링크/시대적 한계 설명은 보존했다.

| 경계 | 확인한 공식 근거 |
| --- | --- |
| 원시/참조·final·필드 기본값 | [JLS 4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html) |
| 변환·숫자 승격·박싱·언박싱 | [JLS 5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html), [Math.toIntExact](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Math.html#toIntExact(long)) |
| 배열 공변성·실제 원소 저장 검사 | [JLS 10](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html) |
| if/else·정상/비정상 종료·blank final | [JLS 16](https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html) |
| parameter의 새 변수에 값 복사 | [JLS 15.12.4.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.4.5) |
| 문자열 리터럴·상수/비상수 연결·intern | [JLS 3.10.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.10.5), [JLS 15](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html), [String.intern](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#intern()) |
| 가변 builder·불변 결과/목록 경계 | [StringBuilder](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StringBuilder.html), [List.copyOf](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)) |

재현 가능한 [LanguageTypesProbe.java](LanguageTypesProbe.java)는 JDK만 사용한다. 10개 Concept의 핵심 실행 결과와
9개의 컴파일 허용/거부 사례를 검사했다. 예제 검증이지 모든 Java 프로그램에 대한 증명은 아니다.

```powershell
java docs/content-corrections/issue-278/J-language-types/LanguageTypesProbe.java
```

Java 25.0.4에서 통과했다. 미할당 한 경로/독립 if 두 개/범위 밖 이름/byte 변수 합/final 재대입 거부와
양쪽 대입/else throw/blank final 양쪽 대입/상수 byte 합 허용을 구별했다.

## 검증 기록

### Import·개인 데이터

`ContentImportIntegrationTest.languageTypesPackPreviewUpdateAndExactReimportPreservePersonalHistory`는 실제 소스의
Topic 1개 + Markdown 10개 + questions.json을 읽는다. 격리 PostgreSQL Testcontainers와 실제 HTTP Preview/Apply를 사용했다.

1. 같은 canonical key에 이전 본문을 저장하고 각 Concept에 진도·북마크·노트·퀴즈/문제 연결·attempt·오답 노트·복습 일정·복습 이력을 만든다.
2. Pack 전체 Preview: **ERROR=0**, 적용 가능, Concept 10개 UPDATE. Apply HTTP 200.
3. Concept ID/topic/level/order와 question_concept 관계, 개인 데이터 8개 테이블의 **모든 열 snapshot**이 적용 전후 같다.
4. 동일 파일 재Preview: **67개 전부 UNCHANGED**, CREATED=UPDATED=ERROR=0. 다시 Apply HTTP 200 후 개인 snapshot도 같다.

원본 front matter의 식별/상태 메타데이터와 56 Question의 key/선택지 key/정답/난이도/연결도 baseline과 비교해 유지했다.
#277의 272행 중 이번 10행만 바뀌었으며 다른 262 Concept와 기존 27 SVG는 source hash가 같다.
Curriculum의 다른 Topic 본문도 byte 정규화 비교에서 동일하다. #277 manifest는 변경 전 감사 증거이므로 해시를 덮어쓰지 않았다.
따라서 #277의 snapshot 고정용 전체 validate.py를 현재 구현의 통과 검사로 사용하지 않는다. 이번 범위는 실제 Pack 테스트와 위 보존 비교로 확인했다.

### 자동화

| 명령 (해당 디렉터리) | 결과 |
| --- | --- |
| `npm.cmd run lint` (frontend) | 통과 |
| `npm.cmd test` (frontend) | 71개 파일 / 455개 테스트 통과 |
| `npm.cmd run build` (frontend) | TypeScript / Vite / PWA build 통과 |
| `npm.cmd test -- --run src/lib/language-type-models.test.tsx src/lib/learning-visualization.test.tsx src/lib/visualization-models.test.ts src/components/MarkdownContent.test.tsx` | 관련 148개 통과; 실제 10개 Markdown·snapshot·공유 계약·기존 Markdown 회귀 포함 |
| `gradlew.bat compileJava test --tests '*LearningVisualizationValidationTest' --tests '*ContentImportIntegrationTest.languageTypesPackPreviewUpdateAndExactReimportPreservePersonalHistory' --console=plain` (backend) | compile·공유 계약·실제 Pack의 Preview/Apply/UNCHANGED/개인 이력 보존 통과 |
| `gradlew.bat test build --console=plain` (backend) | 51개 테스트 파일 / 178개 중 177개 통과·조건부 skip 1개, 실패·오류 0; build 통과 |
| `gradlew.bat test --tests '*LearningVisualizationValidationTest' --tests '*ContentImportIntegrationTest' --tests '*CanonicalBootstrapIdempotencyIntegrationTest' build --console=plain` (backend) | 마지막 문구 교정 후 관련 26개 전부 통과; 전체 canonical bootstrap 멱등성·Import/개인 이력·공유 계약·최종 build 확인 |
| `npm.cmd test -- --run src/lib/language-type-models.test.tsx` (frontend) | 마지막 문구 교정 후 실제 Pack 렌더링/모델 14개 재검증 통과 |
| local/prod `docker compose ... config --quiet` | 두 구성 통과, Production 비밀번호 누락은 예상대로 거부 |

공유 JSON fixture는 기존 28개에 정상 5개/오류 8개를 추가했다. 잘못된 example/null/추가 속성/임의 조건식/버전·안전하지 않은 텍스트를 양쪽 검증기에서 거부한다.
기존 CommonMark 32개 source, 일반 코드/이미지/한글 강조, pass-by-value/TCP snapshot, Heap 불변식·상태 기록 회귀를 유지했다.
Backend의 skip은 기존 `DailyRouteQueryAuditTest`가 `CSFORGE_PERF_AUDIT=1`일 때만 실행되는 성능 측정이기 때문이다.
성능 측정 환경을 새로 켜지는 않았다. 전체 검증 뒤 문구를 교정한 두 Concept과 Question의 인라인 코드 표시를 반영하고,
해당 콘텐츠를 읽는 Frontend 14개 및 Backend 26개 테스트와 Backend build를 최종 파일로 재검증했다.

### 브라우저

로컬 Chromium, 실제 Pack Markdown을 읽는 **메모리 API fixture**로 표시를 확인했다. Import 영속성은 위 실제 PostgreSQL 통합 테스트의 별도 증거다.

- Guest/Owner에서 10 Concept 전부: 본문·강조·코드·정확한 도식 개수·오류 대체 없음·개인 입력 권한 확인.
- 도식 7개 × Guest/Owner × 320/390/768/1024/1280/1440px × light/dark = **168개 조합**에서 페이지 가로 넘침, SVG 글자 경계 잘림, 접근성 이름 누락 없음.
- 수동 light/dark surface는 각각 #ffffff/#181818, 시스템 테마는 현재 OS dark를 따라 #181818. 색 반전 필터나 자동 재생 없음.
- 값·참조 9단계 전부 글자 경계·44px 컨트롤 확인. final과 intern의 참조/객체 관계, 확정 할당 분기/합류, 배열 최종 kim/null 및 실패 상태를 시각 점검.
- Enter/Space 단계 진행, 역이동/초기화, 작은 화면의 방향키 내부 가로 스크롤과 focus outline 확인. Owner 노트가 저장됨으로 바뀐 뒤에도 배열의 3/5 상태 유지.
- S0: 기존 Heap offer의 첫 중간 상태→다음 비교, TCP SYN 전송 중 상태와 단계 이동 확인. 브라우저 warn/error 0건.
- 검증용 서버와 DB만 사용했다. 운영 DB 적용·배포는 수행하지 않았다.

## 다음 리뷰와 남은 범위

**첫 Pack에서 중단하고 이 10 Concept/56 Question의 리뷰를 요청한다.** #278 전체 완료나 Release 승인을 뜻하지 않는다.
Selector의 selected-key set을 현재 readiness 목록처럼 해석하는 문제는 여전히 **P0 초기 우선 교정 대상**이다.
다음 승인된 J-io-nio 범위에서 select→처리→remove·취소/유효성·부분 read를 교정하며 이번에는 해당 Topic이나 SVG를 수정하지 않았다.
나머지 Java/Network 262 Concept 및 다른 영역은 후속 Pack 범위로 남긴다. PR·merge·Production 배포는 하지 않는다.

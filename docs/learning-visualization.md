# 흑백 학습 시각화 계약 — Issue #276

기준: `refactor`의 #275 구현(`f6f1c125`). 검증일: 2026-10-24 (KST).
영역·사용자 권한에 의존하지 않는 표시 계층이며, canonical Markdown이 선언의 원본이다.

## 선언과 확장 경계

Markdown의 예약 fenced code 언어 `csforge-viz`에 JSON 객체 하나를 넣는다.

````markdown
```csforge-viz
{
  "version": 1,
  "type": "min-heap",
  "title": "최소 힙의 트리와 배열",
  "description": "부모 값은 자식 값 이하입니다. 배열 전체가 정렬된 것은 아닙니다.",
  "initialValues": [30, 10, 20]
}
```
````

`version`은 데이터 계약 버전이다. 아래 V1/V2/V3 표시 수준이나 Concept 레벨과 별개다.

| type | 수준 | 필수 옵션 | 범위 |
| --- | --- | --- | --- |
| `static-flow` | V1 정적 SVG | `labels` | 일반 텍스트 2~6개, 각 1~40자. 순차 흐름 표현 |
| `java-pass-by-value` | V2 단계형 | `initialName`, `replacementName` | 한글·영문·숫자·공백·`_ . -` 중 1~12자, 공백만은 거부 |
| `tcp-handshake` | V2 단계형 | `clientIsn`, `serverIsn` | 각각 0~4294967295 정수 |
| `min-heap` | V3 조작형 | `initialValues` | 최대 15개, -99~99 정수. 입력 순서대로 offer하여 초기 힙 구성 |
| `java-value-reference` | V2 또는 V1 | `example` | `assignment-copy`는 본문의 원시 복사·참조 공유·재대입 9단계. `final-list`, `string-intern`은 각각 고정 관계를 보여 주는 V1 |
| `java-array-store` | V2 단계형 | 없음 | 본문의 String[2] 생성→Object[] 별칭→String 저장→Integer 검사→저장 거부 5단계 |
| `java-definite-assignment` | V1 정적 SVG | 없음 | score 조건의 양쪽 분기에서 result를 대입하고 합류하는 고정 if/else 예제 |
| `java-object-model` | V1 또는 V2 | `example` | V1: `static-members`, `inheritance`, `composition`, `casting`. V2: `initialization`(8단계), `dispatch`(3단계), `defensive-copy`(6단계) |

모든 타입은 `version: 1`, `title`(1~100자), `description`(1~600자)을 요구한다.
설명은 조작 없이도 핵심 계약·결과를 읽을 수 있는 요약이어야 한다. 알 수 없는 필드는 거부한다.
일반 텍스트에는 HTML 구분자, 제어 문자, `javascript:`/`data:`를 허용하지 않는다.
필드 길이는 Java/JavaScript 문자열 길이 기준이다. payload는 최대 12000자이며 Import는 Markdown 필드당 최대 8개로 제한한다.

좌표·색상·SVG 문자열·HTML·URL·임의 코드·컴포넌트 경로를 콘텐츠에서 받지 않는다.
새 타입은 명시적인 Zod 계약, 서버 계약, 순수 상태 모델, 승인된 렌더러를 함께 추가한다.
V1은 순차 흐름과 승인된 고정 관계/분기 예제를 지원하며 범용 그래프 편집기나 V4 정책 실험 엔진은 구현하지 않는다.

## 구현 책임

- `MarkdownContent`: 예약 언어의 code 노드만 `LearningVisualization`으로 전달한다. 일반 코드·이미지·GFM·#275의 한글 강조 처리는 유지한다. 안정적인 pre 컴포넌트 identity로 Owner 노트/진행 변경 시 조작 상태가 초기화되지 않게 한다.
- `learning-visualization.ts`: bounded JSON 파싱과 타입별 strict Zod 검증.
- `LearningVisualization`: 고정 렌더러 목록, 공통 figure/caption, 오류 경계, 안전한 텍스트 대체 표시. Guest/Owner API 호출을 추가하지 않는다.
- `DiagramPrimitives`: SVG canvas, 노드, 화살표, 단계 컨트롤, 키보드로 접근 가능한 내부 스크롤.
- `StepDiagram`: 참조 값 복사·TCP 메시지/상태 표시와 단계 이동.
- `InteractiveDiagram`: 정수 입력, 실제 힙 연산 호출, 배열/트리/기록의 동일 snapshot 표시.
- `visualization-models.ts`: 브라우저·React와 독립적인 상태 및 알고리즘 계산. 조작 상태는 해당 Reader에서만 유지하며 DB의 진도·평가·복습 상태와 섞지 않는다.
- `language-type-models.ts`: 첫 Java Pack의 값·참조 및 배열 저장 snapshot. `LanguageValueDiagram`, `ArrayStoreDiagram`, `DefiniteAssignmentDiagram`은 같은 canvas/노드/간선/컨트롤과 테마 토큰을 재사용한다.

## Import와 오류 경로

`ContentImportValidator`가 `VisualizationMarkdownValidator`와 `LearningVisualizationValidator`를 호출한다.
Concept 본문뿐 아니라 문제 본문·해설·모범 답안·선택지 본문/근거의 예약 fence도 검증한다.
검증 오류는 `contentMarkdown.visualizations[0]` 같은 기존 필드 오류 계약으로 Preview에 표시된다.
Apply는 기존 analyzer로 재검증하고 오류가 있으면 transaction 쓰기 전에 거부한다.
새 테이블, entity, 저장 형식, API 응답 형식은 추가하지 않았다.

서버는 승인된 `org.commonmark:commonmark:0.31.0`으로 AST를 만들고 실제 `FencedCodeBlock`만 검사한다.
최상위 4칸/탭 들여쓰기는 일반 코드로 유지한다. 리스트 안에서는 항목의 본문 들여쓰기를 기준으로
정상 fence와 추가 4칸 들여쓴 일반 코드를 구분하며, quote·중첩 목록·HTML block·바깥 code fence의 문맥도 파서가 처리한다.
예약 구문의 literal 예시는 위 예제처럼 더 긴 바깥 일반 fence에 넣거나 일반 들여쓰기 코드를 사용한다.
escape/entity가 해석된 info의 첫 단어로 예약 언어를 인식한다. JSON 계약과 함께 기존 Import 정책도 유지하므로
info는 `csforge-viz` 하나이고 닫는 fence를 명시해야 한다. CommonMark에서 렌더링되는 미종료 fence나 metadata 포함 fence도
선언으로 인식하되 Import에서는 이 정책에 따라 거부한다. HTML 렌더러는 사용하지 않는다.

Import를 거치지 않은 오래된 잘못된 선언은 런타임에서도 검증하고 대체 안내를 표시한다.
유효한 선언의 렌더러 오류는 개별 오류 경계에서 설명으로 대체한다. 본문·코드·이미지는 남는다.
SVG는 컴포넌트에서 생성하므로 외부 SVG fetch 실패나 외부 이미지 내부 테마 상속 문제가 없다.
원격 SVG 인라인 로딩, `dangerouslySetInnerHTML`, `eval`, 동적 컴포넌트 import는 사용하지 않는다.

## Diagram Design Spec

선택: **안전한 React 인라인 SVG 컴포넌트**. 흰색/검정 이중 자산은 상태 조합마다 자산이 늘어나므로 선택하지 않았고,
외부 SVG fetch/정제 방식은 이 PoC에 불필요하다. 기존 일반 `img` SVG는 기존 정책 그대로다.

| 토큰 | light | dark |
| --- | --- | --- |
| surface | `#ffffff` | `#181818` |
| node | `#f2f2f2` | `#292929` |
| active | `#d6d6d6` | `#454545` |
| text | `#202020` | `#eeeeee` |
| muted | `#525252` | `#c4c4c4` |
| line | `#626262` | `#aaaaaa` |

수동 `data-theme=light/dark`와 시스템 `prefers-color-scheme`을 함께 따른다.
일반 앱 accent·경고·코드 구문 색상 정책과 별개의 중성 토큰이다. invert 필터를 쓰지 않는다.

- 노드/간선 기본 선 1.5px, 활성 선/테두리 3px. 현재 상태는 굵기·배경 명도와 함께 상태 문장/인덱스로 표시한다.
- 실선은 참조/현재 전송, 점선은 지난 전송·호출 종료·참조 없는 객체 등 해당 도식의 범례로 설명한다.
- SVG 글자 15px, 인덱스 13px. 노드 텍스트 줄 간격 21px. 도형 경계에서 간선을 연결하고 화살촉은 끝점에서 같은 방향 벡터로 생성한다.
- 힙은 배열 인덱스의 완전 이진 트리 좌표를 사용한다. 층 간격 88px, 원 반지름 24px. 원소 수에 맞춰 폭 320~720px·높이를 계산해 작은 힙에 빈 대형 canvas를 두지 않는다.
- 도식 텍스트를 축소하지 않는다. 작은 화면은 내부 가로 스크롤과 안내 문장을 제공한다. 힙은 첫 표시와 폭 변경 시 루트를 중앙에 두며, 사용자의 단계 이동만으로 pan 위치를 바꾸지 않는다.
- figure 설명, SVG 고유 title/aria 이름, focus 가능한 스크롤 영역, native button/input/details, 44px 컨트롤, 입력 오류 연결, `role=status`의 단계 설명을 사용한다.
- 자동 재생·시간 의존 애니메이션은 없다. Reduced Motion에서도 상태 진실이 동일하며 animation/transition을 끈다.

## 세 PoC의 정확성 범위

1. `java/language-types/pass-by-value.md`: 기존 `replace(Member value)` 코드와 같은 호출 전→참조 A 복사→새 B 재대입→B.name 변경→반환의 5 snapshot이다. caller는 항상 A/kim을 유지한다. 참조 없는 B를 즉시 수거됐다고 표현하지 않는다.
2. `java/collections/priorityqueue.md`: 자연 순서 정수 최소 힙이다. 삽입은 sift-up, poll은 마지막 값의 루트 이동과 sift-down을 수행한다. 실행 뒤 첫 중간 snapshot부터 다음 단계로 비교·교환을 학습하고 다시 되짚을 수 있다. 기존 기록과 미리 계산한 완료 결과는 보존한다. **완료 상태**에서 부모≤자식이며 복구 중 화면은 명시한다. 기록 재생 중에는 새 연산을 막는다. JDK의 정확한 내부 배열/교환 순서나 동률 안정성을 API 계약으로 주장하지 않는다.
3. `network-http/tcp/three-way-handshake.md`: 데이터 없는 일반 능동 연결 수립이다. 송신/수신을 나누어 마지막 ACK 전송 중에는 client ESTABLISHED/server SYN-RECEIVED, 수신 뒤 양쪽 ESTABLISHED를 보인다. SYN의 시퀀스 공간 소비와 32비트 순환을 반영한다. 동시 열기·재전송·Fast Open·TLS 성공은 이 모델의 보장이 아니다.

근거: [JLS 15.12.4.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.4.5),
[Java SE 25 PriorityQueue](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html),
[RFC 9293 §3.5](https://www.rfc-editor.org/rfc/rfc9293.html#section-3.5).

## 검증 기록과 완료 조건

- Frontend `npm.cmd run lint`, `npm.cmd test`(70개 파일/390개), `npm.cmd run build` 통과.
- 최종 표시/상태 수정 뒤 관련 45개 계약·상태 테스트와 TypeScript/Vite/PWA build 재검증.
- Backend `compileJava`, `LearningVisualizationValidationTest`, `ContentImportParserTest` 통과.
- PostgreSQL Testcontainers의 `ContentImportIntegrationTest`, `CanonicalBootstrapIdempotencyIntegrationTest` 통과.
  정상 Preview→Apply→공개 조회, 재수입 UNCHANGED, 잘못된 버전의 Preview/Apply 거부와 기존 본문 보존을 검증했다.
- `contracts/learning-visualization-cases.json`의 같은 정상/오류 fixture를 Java와 TypeScript에서 읽어 계약 차이를 검사한다. 잘못된 JSON·trailing JSON·알 수 없는 타입/버전/필드·크기/범위·HTML/코드 문자열을 포함한다.
- 상태 테스트는 참조 식별자, TCP 수신 전후 상태/ACK/32비트 순환, 동일 입력 재현, 힙 비교·교환, snapshot 불변성, 음수/중복 포함 100개 재현 입력의 poll 정렬 결과와 안정 상태 불변식, 좌표 경계를 확인한다.
- Chromium: 세 canonical Markdown을 읽는 격리 API fixture로 Guest/Owner × 320/390/768/1024/1280/1440px × light/dark **72개 상태**의 페이지 overflow 없음·SVG 이름 존재·흑백 테마 동기화를 확인했다.
- 시스템 테마(현재 OS dark)에서 `data-theme` 없이 도식 배경 `rgb(24,24,24)`를 확인했다. 수동 light는 `rgb(255,255,255)`이며 수동 dark도 일치했다. 도식 animation은 none이다.
- 키보드 단계 이동/역이동/초기화, 힙 삽입·poll·잘못된 입력·재생 중 조작 제한, 내부 화살표 키 스크롤, Owner 북마크/노트 autosave 후 힙 상태 보존을 확인했다.
- 런타임에서 version을 잘못 전달한 경우 텍스트 대체 표시와 기존 본문·코드 복사 컨트롤·Owner 노트 유지도 확인했다.
- 작은 힙의 추가 화면 점검에서 루트의 초기 가시성과 배열/노드 대응을 확인했다.

기존 이미지/Markdown 강조 보안 테스트와 전체 Frontend 회귀 테스트를 유지한다.
브라우저의 학습 데이터 저장은 메모리 fixture, Import 저장은 일회용 Testcontainers DB에서만 검증했다.
운영 데이터/DB schema/인증 정책과 다른 canonical Concept은 바꾸지 않았다.
남은 Java·Network 전수 감사·문체 교정·SVG 교체는 #277·#278의 범위다.

## 리뷰 후속 교정 (#276, 기준 `6e4a0a0e`)

- 들여쓰기를 제거하던 수동 스캐너를 CommonMark AST 순회로 교체했다. 파서는 재사용하고 순회는 문서 순서의 반복형 DFS로 수행한다. 의존성 추가는 사용자 승인을 받았다.
- `contracts/visualization-markdown-cases.json`의 32개 source를 서버와 실제 `MarkdownContent` 렌더러가 함께 읽는다. 최상위 0~3칸/4칸/탭, 리스트·순서 목록·중첩 목록의 상대 들여쓰기, 인용문, 바깥 코드/HTML block, escape/entity 언어, 미종료/metadata/잘못된 JSON, 실제 선언 개수 제한을 구분한다. 일반 코드가 오류 인덱스나 최대 8개 제한에 포함되지 않는 것도 확인한다.
- 힙 모델·JSON 계약은 변경하지 않았다. UI 커서만 완료 위치에서 첫 중간 상태로 변경하고 안내 문장을 보정했다. offer/poll의 정방향 배열 순서, 완료 불변식, 역이동 시 snapshot 보존 회귀 테스트를 추가했다.
- Frontend lint, 70개 파일/423개 테스트, TypeScript/Vite/PWA build가 통과했다. 관련 테스트 116개와 Backend 선언/Parser 테스트도 통과했다.
- PostgreSQL Import 통합 테스트는 일반 들여쓰기 코드와 정상 리스트 fence의 Preview→Apply→재수입 UNCHANGED 및 잘못된 리스트 선언의 Apply 거부/저장 본문 보존을 검증하고 통과했다. canonical bootstrap 멱등성 테스트도 통과했다.
- 격리 API의 Guest/Owner 브라우저 검증에서 offer `[10,30,20,5]`→비교/교환→`[5,10,20,30]`, poll `[30,10,20]`→비교/교환→`[10,30,20]`를 확인했다. 완료 전 조작 차단, 역이동, 초기화, Owner autosave 후 `1/6` 유지, 1440px light/390px dark에서 기존 읽기·권한·넘침 처리를 확인했다.
- 전체 Repository Validation은 push로 실행되는 기존 CI의 Backend tests/build, Frontend lint/test/build, Compose validation 단계로 확인한다. Production 배포 job은 main에만 해당하므로 refactor에서는 실행하지 않는다.

## 첫 Content Pack 확장 (#278)

새 세 타입은 `J-language-types`에 실제 필요한 예제만 다룬다. 공통 JSON `version: 1`, 길이·개수 제한,
기존 네 타입과 CommonMark fence 인식은 유지했다. `example`은 위 세 문자열만 받으며 좌표·객체 목록·조건식·실행 코드를 받지 않는다.
추가 옵션이 없는 두 타입도 공통 필드 외의 속성을 거부한다. Java/TypeScript는 같은 정상·오류 fixture를 읽는다.

값/참조의 A/B는 논리적 식별자이며 물리 주소, stack/heap 배치, GC 회수 시점을 뜻하지 않는다.
배열의 선언 타입과 실제 원소 타입을 분리하고, 실패한 두 번째 저장이 앞선 성공한 저장을 되돌리지 않는다는 것을 표시한다.
확정 할당 도식은 본문의 고정 if/else 예제를 설명하며 임의 Java 코드의 컴파일 가능성을 판정하는 도구가 아니다.
새 상태도 Reader의 일시적인 표시 상태이며 학습 이력이나 Import 데이터 모델에 저장하지 않는다.

Pack별 변경·정확성 근거·Import 및 브라우저 검증은
[J-language-types 완료 기록](content-corrections/issue-278/J-language-types/README.md)에 남긴다.

## 객체 모델 Pack 확장 (#278)

`java-object-model`은 두 번째 Pack에 필요한 위 일곱 고정 예제만 받는다. 기존 JSON 버전·필드 제한·일곱 타입은 유지한다.
제목/설명 외에는 `example`만 선언하며, 코드·좌표·노드·호출 조건을 콘텐츠에서 받지 않는다.
V1/V2 모두 기존 `DiagramPrimitives`와 흑백 토큰을 재사용한다. 범용 그래프/Java 실행기나 새로운 조작 엔진은 추가하지 않는다.

`object-model-models.ts`는 생성자 위치·필드/블록 실행 횟수·누적 출력, 한 메서드 호출의 검사/선택/실행,
목록 구조와 가변 원소 공유의 고정 snapshot을 제공한다. 표시 상태는 Reader에만 있으며 개인 이력에는 저장하지 않는다.
생성자 도식은 클래스 초기화가 끝난 정상 생성 예제로, 매개변수와 객체 필드, 같은 객체의 상위 초기화 경로를 구분한다.
전반부 직접 대입은 선언 시 초기화 식이 없는 현재 클래스 필드에만 허용되는 별도 조건이며,
도식의 `name` 필드에는 그런 대입이 없다. null→unset→kim 순서를 모든 프로그램의 보장으로 일반화하지 않는다.
복사 도식의 L1/L2/M/N도 논리적 구분이며 일반적인 객체 할당 수·JVM 배치·GC 시각을 뜻하지 않는다.

실제 본문/문항의 Java 컴파일·실행과 공유 계약·개인 이력 보존 검증은
[J-object-model 완료 기록](content-corrections/issue-278/J-object-model/README.md)을 따른다.

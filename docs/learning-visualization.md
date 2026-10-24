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

모든 타입은 `version: 1`, `title`(1~100자), `description`(1~600자)을 요구한다.
설명은 조작 없이도 핵심 계약·결과를 읽을 수 있는 요약이어야 한다. 알 수 없는 필드는 거부한다.
일반 텍스트에는 HTML 구분자, 제어 문자, `javascript:`/`data:`를 허용하지 않는다.
필드 길이는 Java/JavaScript 문자열 길이 기준이다. payload는 최대 12000자이며 Import는 Markdown 필드당 최대 8개로 제한한다.

좌표·색상·SVG 문자열·HTML·URL·임의 코드·컴포넌트 경로를 콘텐츠에서 받지 않는다.
새 타입은 명시적인 Zod 계약, 서버 계약, 순수 상태 모델, 승인된 렌더러를 함께 추가한다.
현재 V1은 순차 흐름만 지원하며 범용 그래프 편집기나 V4 정책 실험 엔진은 구현하지 않는다.

## 구현 책임

- `MarkdownContent`: 예약 언어의 code 노드만 `LearningVisualization`으로 전달한다. 일반 코드·이미지·GFM·#275의 한글 강조 처리는 유지한다. 안정적인 pre 컴포넌트 identity로 Owner 노트/진행 변경 시 조작 상태가 초기화되지 않게 한다.
- `learning-visualization.ts`: bounded JSON 파싱과 타입별 strict Zod 검증.
- `LearningVisualization`: 고정 렌더러 목록, 공통 figure/caption, 오류 경계, 안전한 텍스트 대체 표시. Guest/Owner API 호출을 추가하지 않는다.
- `DiagramPrimitives`: SVG canvas, 노드, 화살표, 단계 컨트롤, 키보드로 접근 가능한 내부 스크롤.
- `StepDiagram`: 참조 값 복사·TCP 메시지/상태 표시와 단계 이동.
- `InteractiveDiagram`: 정수 입력, 실제 힙 연산 호출, 배열/트리/기록의 동일 snapshot 표시.
- `visualization-models.ts`: 브라우저·React와 독립적인 상태 및 알고리즘 계산. 조작 상태는 해당 Reader에서만 유지하며 DB의 진도·평가·복습 상태와 섞지 않는다.

## Import와 오류 경로

`ContentImportValidator`가 `VisualizationMarkdownValidator`와 `LearningVisualizationValidator`를 호출한다.
Concept 본문뿐 아니라 문제 본문·해설·모범 답안·선택지 본문/근거의 예약 fence도 검증한다.
검증 오류는 `contentMarkdown.visualizations[0]` 같은 기존 필드 오류 계약으로 Preview에 표시된다.
Apply는 기존 analyzer로 재검증하고 오류가 있으면 transaction 쓰기 전에 거부한다.
새 테이블, entity, 저장 형식, API 응답 형식은 추가하지 않았다.

백틱/물결 fence, 일반 quote/list 컨테이너, 들여쓴 예약 선언을 검사한다.
일반 코드 fence 안에 있는 예시는 도식으로 검증하지 않는다. 예약 구문의 literal 예시는 위 예제처럼
더 긴 바깥 일반 fence에 넣는다. 이 검증기는 범용 Markdown AST 파서가 아니며 예약 선언은 보수적으로 검사한다.
fence 정보 문자열은 `csforge-viz` 하나이고 닫는 fence를 명시해야 한다.

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
2. `java/collections/priorityqueue.md`: 자연 순서 정수 최소 힙이다. 삽입은 sift-up, poll은 마지막 값의 루트 이동과 sift-down을 수행한다. 비교·교환 snapshot을 되짚을 수 있다. **완료 상태**에서 부모≤자식이며 복구 중 화면은 명시한다. 기록 재생 중에는 새 연산을 막는다. JDK의 정확한 내부 배열/교환 순서나 동률 안정성을 API 계약으로 주장하지 않는다.
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

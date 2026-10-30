# Java·Network 시각화 전수 감사 — #277

기준: `refactor` `d357efb491e355299aa389cf6538d47ec4f369db`, 2026-10-24 KST.
작업 시작 시 fetch 후 `HEAD...origin/refactor = 0/0`, working tree clean을 확인했다.
[Issue #277](https://github.com/guseoh/csforge/issues/277)의 감사·설계 산출물이며
[Issue #278](https://github.com/guseoh/csforge/issues/278)의 구현 입력이다.
이번 변경은 이 디렉터리의 감사 자료뿐이다. 콘텐츠·SVG·엔진·DB·개인 학습 이력은 변경하지 않았다.

## 범위와 증거 읽기

| 산출물 | 내용 |
| --- | --- |
| [java.json](java.json) | Java 18 Topic, 145 Concept의 개별 판정 |
| [network-http.json](network-http.json) | Network 15 Topic, 127 Concept의 개별 판정·신규 도식 범위 |
| [java-svg.json](java-svg.json) | 실제 Java SVG 27개의 사용처·중복 여부·소스 검사·유지/보정/재설계 |
| [packages.json](packages.json) | 33개 Topic 실행 단위, 수준별 수량·ASCII 범위·순서 그룹·의존성·완료 기준 |
| [baseline.json](baseline.json) | Curriculum·Topic catalog 해시와 발견된 제목 차이 |
| [validate.py](validate.py) | 누락·중복·메타데이터·도식 참조·증거 해시·패키지 정합성의 읽기 전용 검증 |

각 manifest의 `concepts` 원소 하나가 Concept 한 행이다. `objective`는 Curriculum의 원문이며,
`title`·`level`·`topicContentKey`는 canonical front matter다. `sourcePath`와 LF 정규화 SHA-256으로
현재 검토 대상을 고정했다. 이미지 ALT에 `Object[]`처럼 대괄호가 있어도 참조를 누락하지 않는다.
`existingMedia.fencedBlocks`는 **모든** fence의 인덱스·실제 시작 행·언어·내용 해시·용도·보존 결정을 갖는다.
자료는 앱에서 읽지 않으며 새 canonical 데이터 계약이나 DB 모델이 아니다.

검토는 각 Concept의 목표·설명 구조·실제 이미지·텍스트 도식·인접한 보장 경계를 현재 파일과 대조했다.
이전 [Java Wave 4](../learning-experience-2026/wave-4/),
[Network Wave 3](../learning-experience-2026/wave-3/)의 본문/Question 감사는 보조 증거로 사용하고,
그 기준 이후의 수정과 #276의 세 PoC를 별도로 대조했다. 예전 감사의 KEEP은 #277의 도식 승인으로 승계하지 않았다.
SVG는 27개 모두 title/desc·표시 텍스트·좌표·연결 경로를 소스로 검사했다.
**이번 감사에서 새 브라우저 화면 검증이나 Java/프로토콜 예제 전량 실행을 했다는 뜻은 아니다.**
모든 Reference URL의 원문·리다이렉트까지 새로 검증하지도 않았다. 각 행의 기존 공식 링크는
`canonical에 선언된 근거`이고, 아래 위험 목록은 이번에 공식 원문으로 재확인한 경계와 구현 전 미확정 범위를 구분한다.

## 전수 판정

| 영역 | Concept | REQUIRED | RECOMMENDED | NONE | V1 | V2 | V3 | V4 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Java | 145 | 33 | 52 | 60 | 47 | 37 | 1 | 0 |
| Network & HTTP | 127 | 55 | 44 | 28 | 59 | 40 | 0 | 0 |
| 합계 | 272 | 88 | 96 | 88 | 106 | 77 | 1 | 0 |

- REQUIRED: 참조 공유, 계층 경계, 프로토콜 송수신, 핵심 불변 조건처럼 그림으로 확인할 핵심 관계가 있다.
- RECOMMENDED: 설명을 보조하는 구체 관계가 있다. #278의 목표에는 포함하되 REQUIRED보다 뒤에 구현한다.
- NONE: 코드 결과·데이터·문법·비교표가 직접 근거다. 생략 이유를 각 행에 남겼다.
- V1은 구조·관계·정렬된 정적 비교, V2는 고정된 예시의 이전/다음 snapshot, V3는 사용자의 유효 입력과 연산,
  V4는 조건 변경에 따른 비교 실험이다. Concept level·JSON `version`과 별개다.
  이번 목표에는 고정 예시+코드로 충분해 V4를 배정하지 않았다. 네트워크·JVM 성능 시뮬레이터를 만들지 않는다.

fence는 총 1,108개: 코드 624, 구조 표현 335, 텍스트 자체가 대상인 자료 146, 기존 선언 3개다.
`structure` 335개는 최종 ASCII 도식으로 승인하지 않았다. 시각화 대상에서는 목표 도식으로 통합한다.
NONE Concept에 있는 구조 표현 36개는 중복을 없애고 문장·표로 옮긴다. NONE에 그림을 강제하는 뜻이 아니다.
나머지 코드·명령·HTTP/zone 레코드·덤프·수식·반환값·계약 목록은 유지한다.
같은 `text` 언어라도 `javap` 명령, 스레드 덤프, `Content-Length` 예시는 구조도와 구분했다.
`a + B` 같은 KEX 설명은 산술 코드가 아니라 입력 관계 도식이므로 재설계한다.

Curriculum의 `DIAGRAM` 항목을 NONE으로 낮춘 사례는 없다. `TEXT`/`NONE`에서 도식이 유익한 경우에는
현재 본문의 관계 설명을 근거로 상향했고 원래 값은 `curriculumVisualization`에 보존했다.
이는 **감사 권고**이며 Curriculum을 변경한 것이 아니다. #278에서 해당 pack의 note와 실제 구현을 함께 맞춘다.

## 기존 자산과 이미 해결된 지적

Java SVG는 27개, canonical에서 사용하는 파일은 25개다. 파일 내용 해시 중복·깨진 이미지 참조는 없다.
Network의 `/learning/network-http/` SVG는 0개이며 해당 127 Concept에 다른 이미지 참조도 없다.
Java/Network의 기존 선언은 `java-pass-by-value`, `min-heap`, `tcp-handshake` 각 1개다.
OS SVG 33개는 후속 전체 영역 통일화 backlog로 분리했다.

SVG 파일별 판정은 RESTYLE 8개, REBUILD 17개, KEEP 2개다. 모든 사용 중 SVG는 현재 외부 `img`와 고정 색상이며,
기존 의미가 정확해도 #276의 inline 테마 토큰을 자동 상속하지 않는다. **RESTYLE은 색상 일괄 치환 승인이 아니다.**
각 파일 행에 정렬·범례·텍스트·간선의 보정 범위를 따로 적었다. REBUILD는 목표 V1 재설계 또는 V2 전환이다.

`pass-by-value.svg`는 canonical 미사용이지만 `learning-visualization.test.tsx`의 기존 이미지 회귀 fixture에서 쓰인다.
`priority-queue-heap.svg`는 canonical/프런트 소스 사용처가 없다. 두 파일은 현재 PoC가 학습 역할을 대신한다.
KEEP은 **감사 중 파일 보존**이며 다시 화면에 삽입하라는 승인이 아니다.
#278에서는 전체 참조를 재검색하고 필요한 fixture를 이관한 뒤 중복 파일 보존/삭제를 기록한다.

이전 감사에서 지적한 다음 문제는 최신 자산/본문에서 이미 해결됐으므로 다시 결함으로 배정하지 않았다.

- HashMap `get` 그림은 이제 같은 key일 때 **value 반환**, 교체는 `put`이라고 명시한다.
- ArrayList/LinkedList는 별도 행이며 JVM stack 참조선은 다른 thread의 frame을 관통하지 않는다.
- Buffer `flip`은 같은 네 칸을 유지한다. 값 전달 SVG의 이전 간선 관통도 수정됐다.
- numeric 상수 축소·Locale.ROOT·비상수 문자열 연결·Key 생성자·Factory 인스턴스 호출·얕은 복사 전제와
  생성자 null→kim·Condition 소비자 대기 방향 등 기존 교정은 보존한다.
- #276 Heap의 첫 중간 상태부터 정방향 재생과 완료 전 조작 제한은 이미 구현돼 있다.

메타데이터 차이는 1개다. `network-http.core.request-journey.proxy-gateway-path`의 front matter 제목은
`Proxy와 Gateway 경유`, Curriculum·본문 H1은 `프록시와 게이트웨이 경유`다. 의미·key·level·연결은 일치한다.
이를 baseline의 알려진 차이로 정확히 기록했으며 #278 `N-request-journey`에서 제목만 정렬한다(P2).
검증기는 다른 제목 차이를 허용하지 않는다.

## 기술 위험과 정확성 gate

`확인`은 아래 범위의 규범/계약을 원문으로 읽었다는 뜻이다. 새 상태 모델·렌더러의 정확성까지 완료됐다는 뜻은 아니다.
행별 `sourceAndGuarantee`와 `accuracyValidation`은 이 표와 함께 사용한다. 구현 의존 사항을 실행 보장으로 그리지 않는다.

| 항목·우선순위 | 확인한 근거·확정 경계 | #278에서 해소할 범위·검증 |
| --- | --- | --- |
| Selector — P0 | [Java 25 Selector](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/Selector.html): selected-key set과 각 key의 ready-operation set은 다르며 전통적 select는 추가/갱신한다. | `nio-selector-readiness.svg`의 `현재 ready인 key`를 무조건 현재 readiness 목록처럼 읽는 오해를 제거. select→처리→remove, cancel/validity·부분 read의 고정 trace. Consumer overload의 다른 동작을 혼합하지 않는다. |
| 값 전달·얕은 복사 — P1 | [JLS 15.12.4.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.4.5): 새 parameter에 값 전달. 기존 PoC는 caller A를 유지한다. | 참조 값/객체 복사/재대입/가변 원소를 별도 상태로 대조. `copyOf`의 객체 allocation 횟수를 보장하지 않는다. |
| Heap — 유지 | [PriorityQueue API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html): head·동률 임의성·순회 미보장. | 기존 순수 모델·완료 heap invariant·snapshot 불변성·정방향/역방향 기록 회귀 유지. 교육용 배열은 JDK 실제 배열 계약이 아니다. |
| JMM·monitor·final — P1 | [JLS 17.4/17.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html): HB와 final 생성 시점 의미. | program-order/SW/HB 간선 분류, 같은 monitor·volatile 관찰 조건·생성 중 escape를 대조. 허용 실행 예시와 결과 보장을 구별하고 물리 시간/CPU cache 그림을 배제한다. |
| CAS — P1 | [AtomicInteger](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html): strong CAS 비교, 갱신 함수 재적용 가능. | expected/current와 성공·실패 전후 값, ABA·부수효과·전체 진행성 한계를 테스트. CAS 사용만으로 lock-free/wait-free라 선언하지 않는다. |
| GC·retained path — P1 | [JLS 12.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.6): 도달 가능성과 회수의 의미를 구분. | root 경로·고립 cycle·지워진 간선을 명시. 점선을 weak 참조와 혼용하지 않는다. 실제 collector 시각·즉시 수거·ReferenceQueue 알림의 메모리 회수 완료는 미확정/비보장이다. |
| class loading — P1 | [JVMS 5.3~5.5](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html): defining loader와 linking/initialization. | resolution 지연·상수 사용·오류 상태와 delegation/definition 간선을 구분. Java 25 constructor prologue와 instance field 초기화는 [JLS 12.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.5)로 별도 검증한다. |
| virtual thread — P1 | [Java 25 안내서](https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html): carrier mount/unmount와 native/foreign pinning. | 같은 carrier에 여러 VT를 동시에 mount한 것 같은 실선을 snapshot으로 분리. JEP 491 원문은 이 환경에서 403이므로 미확인; Java 25 안내서로 현행 pinning 범위를 교차 확인했다. 과거 synchronized pinning 설명을 재도입하지 않는다. |
| NIO Buffer — P1 | [Buffer API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/Buffer.html): position/limit/capacity와 flip·clear. | 고정 cells·부분 read/write·compact의 남은 데이터, `0 ≤ position ≤ limit ≤ capacity` 테스트. clear가 데이터를 지운다고 표시하지 않는다. |
| Instant·DST — P1 | 기존 `java.time` 공식 Reference가 근거이며 이 감사에서 전체 zone transition 값을 실행하지 않았다. | `instant-zones.svg`의 날짜 없는 뉴욕 offset와 DST의 02시 예시는 전제를 보강해야 한다. 고정 zone/date/tzdb로 gap=0·overlap=2 offsets, plusDays/Duration 결과를 Java 25 probe로 확인한 뒤 확정한다. |
| TCP — P1 | [RFC 9293 §3.5~3.10](https://www.rfc-editor.org/rfc/rfc9293.html): seq/ACK·연결 상태·FIN·전달 경계. | 기존 일반 handshake 유지. 송신/도착 분리, 32비트 순환·SYN/FIN 소비·누적 ACK·gap·half-close를 검사. RTO는 RFC6298, 혼잡은 명명한 RFC5681 예시를 구현 전에 재검증. OS별 timer·CUBIC/BBR 고정 보장은 제외한다. |
| DNS — P1 | [RFC 1034 §4.3/5.3](https://www.rfc-editor.org/rfc/rfc1034.html), [RFC 2308](https://www.rfc-editor.org/rfc/rfc2308.html): 위임/캐시·이름/타입 부재. | resolver가 각 질의의 주체. warm cache·CNAME·NXDOMAIN/NODATA와 실패 응답을 분리한다. 실제 recursive 구현·glue/bailiwick·최근 실패 캐싱 확장은 구현 전 별도 확인하며 하나의 timer로 통일하지 않는다. |
| TLS·PKI — P1 | [현행 RFC 9846](https://datatracker.ietf.org/doc/html/rfc9846) §1.2/2 확인. RFC8446은 대체됐다. key exchange 용어는 KEM 확장도 고려한다. | 일반 인증서 1RTT 시퀀스와 암호화 시작·CV/Finished·방향별 키만 확정 대상으로 삼는다. HRR/PSK/0RTT/mTLS·경로 검증 세부는 별도 검증하고 모든 TLS가 ECDHE 인증서 흐름이라고 일반화하지 않는다. QUIC은 TLS record가 아니라 별도 CRYPTO/packet 보호다. |
| HTTP cache·ETag — P1 | [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 9111 §4/5](https://www.rfc-editor.org/rfc/rfc9111.html): 조건 평가와 재사용 경계. | GET/HEAD 304·다른 메서드 412, INM 우선, weak/strong·Vary·no-cache/no-store, 저장 body와 갱신 metadata를 검증. Age의 실제 수치·SWR 복합 지시·개인정보 범위를 pack별 재확인한다. |
| HTTP/2·3 HOL — P1 | [RFC 9113](https://www.rfc-editor.org/rfc/rfc9113.html), [RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html), [QUIC RFC 9000](https://www.rfc-editor.org/rfc/rfc9000.html): stream/frame 및 transport 층. | H1 response ordering·TCP byte gap·QUIC offset gap을 별도 모델로 비교. HEADERS/CONTINUATION·QPACK dependency·공유 혼잡은 구현 전 해당 절 재검증. QUIC이 모든 blocking을 없앤다고 표현하지 않는다. |
| Cookie·프록시 — P1/P2 | canonical의 RFC6265·HTTPWG 6265bis·RFC7239를 근거로 삼는다. 이번에 초안 전체의 최신 상태를 재검증한 것은 아니다. | SameSite/site와 Origin·port 차이, header 작성/정리 주체·직접 우회 경로·신뢰 source를 검증. #278 시작 시 6265bis 발행 상태를 다시 확인하고 관행 X-Forwarded 형식을 표준 계약으로 승격하지 않는다. |

## 공통 도식 재사용과 구현 순서

현재 지원되는 JSON type은 `static-flow`, `java-pass-by-value`, `tcp-handshake`, `min-heap` 네 개뿐이다.
manifest의 `reuseCandidate`는 **설계 분류**이고 `targetAssetOrComponent`의 `제안:`은 아직 지원하지 않는 목표다.
일반 graph/DSL·좌표/색상 입력·임의 HTML/SVG/URL·코드 실행기를 만들지 않는다.

| 분류 | 재사용할 것 | 새로 필요한 책임 |
| --- | --- | --- |
| flow | `static-flow`의 2~6개 단순 순차 레이블, 공통 caption/arrow | 분기·예외·다중 lane은 현재 type으로 표현 불가. 첫 실제 시나리오에서 제한된 명명 type을 추가한다. |
| reference / topology | SVG primitives·정렬·노드/간선 범례·고유 aria ID | 값/객체·shallow copy, 타입/의존 관계, DNS tree, proxy 신뢰 경계는 의미가 달라 모델을 합치지 않는다. |
| lifecycle / sequence / timeline | `DiagramControls`·이전/다음·status·snapshot 레이아웃 | JVM/동시성 상태와 TCP/DNS/TLS의 순수 시나리오 모델은 분리한다. TCP 모델을 문자열 교체로 DNS/TLS에 재사용하지 않는다. |
| layers | canvas·중첩 박스·caption·접근 가능한 비교 구조 | encapsulation·route·HTTP framing·QUIC mapping의 계층/버전 레이블과 non-1:1 경계. |
| 기존 세 PoC | 렌더러·strict schema·모델·오류 fallback 전체 유지 | 값 전달/heap/handshake 소유 Concept에서 사용. 인접 Concept의 중복 그림은 연결·문장으로 줄인다. |

읽기 순서는 Curriculum 순서를 보존한다. 아래는 **구현 순서**이며 화면의 Topic/Concept 재정렬이 아니다.
먼저 Java를 pack별로 끝낸 뒤 Network를 pack별로 진행한다. 다른 영역·Question 생성·엔진 전면 재설계는 확장하지 않는다.

1. **S0 — 기존 기반 확인 및 첫 필요한 제한형 확장.** #276 세 PoC·CommonMark 계약을 회귀 확인한다.
   기존 공통 figure/tokens/controls를 활용한다. 각 새 type은 실제 첫 pack에서 strict Zod+서버 검증+공유 fixture+
   순수 모델+fallback을 함께 추가한다. 모든 future type을 먼저 만드는 거대 framework 작업은 하지 않는다.
2. **J1 — 핵심 상태/관계.** `J-language-types` → `J-object-model` → `J-collections` → `J-concurrency`
   → `J-io-nio` → `J-jvm-runtime`. 각 Topic 안에서는 manifest의 P0→P1→P2를 우선 처리한다.
   reference·heap 상태 기준을 세운 뒤 JMM·CAS·GC·selector의 보장 경계를 검증한다.
3. **J2 — 나머지 Java 12 Topic.** `packages.json`의 Topic을 하나씩 처리한다.
   `object-contracts/generics/functional/streams`, `enum-modeling/exceptions-resources/modern-language/api-design`,
   `design-patterns/time-numeric/coding-tests/metadata-compatibility` 순서로 권장한다.
   값/참조·의존 관계 primitives를 재사용하고 API·코드만으로 충분한 NONE 항목은 prose/표만 정리한다.
4. **N1 — 계층/전달/프로토콜.** `N-layering` → `N-local-delivery` → `N-ip-routing` → `N-port-nat`
   → `N-tcp` → `N-dns` → `N-tls`. 계층·seq/ACK의 의미를 고정한 다음 cache·권한·키 상태를 추가한다.
5. **N2 — HTTP와 전체 요청 경로.** `N-http-message` → `N-http-methods` → `N-http-status`
   → `N-http-cache` → `N-http-versions` → `N-http-state-intermediary` → `N-request-journey`.
   같은 cache/proxy/HOL 모델의 설명을 연결해 중복을 줄인다. request-journey는 이미 검증한 소유 모델을 조합한다.

작업량의 단위는 파일 수를 임의의 시간 추정으로 바꾸지 않고, `packages.json`의 Concept 수·목표 등급별 수·
ASCII 블록 수·SVG 사용 수로 기록했다. 공통 layout 재사용으로 여러 Concept을 한 type으로 표현할 수 있으므로
184개 시각화 대상이 184개 새 렌더러라는 뜻은 아니다. Topic pack이 커도 키별 완료 행은 유지한다.
J-concurrency(19C), J-jvm-runtime(12C), N-tcp(12C)는 작은 내부 묶음으로 나눠 검증하되 Topic 최종 전체 리뷰가 필요하다.

#278의 **각 pack 완료 gate**:

- 전 Concept의 기술·문체·강조·본문·Reference를 개별 대조한다. 시각화 NONE도 검토하며 순서·key·level·연결을 유지한다.
- 각 행의 질문에 그림·본문이 답하는지, 데이터·상태·화살표·실패 조건을 공식 근거/실제 probe로 확인한다.
  V2는 모든 snapshot·양방향 이동·reset, V3는 입력 경계·trace·완료 invariant·변경 불가 이전 snapshot을 검사한다.
- 실제 변경된 학습 목표/예제와 관련 Question 전량의 충돌을 확인한다. Question을 수정하면 모든 정답/오답/해설/난도를 리뷰한다.
- Import Preview ERROR=0 → **격리 DB** Apply → 동일 pack 재적용 전체 UNCHANGED를 확인한다.
  개인 progress/bookmark/note/attempt/wrong-note/review 데이터의 수정 전후 보존 증거를 남긴다.
- Guest/Owner의 동일 Reader 결과, 강조/코드/이미지와 저장 중 상태 보존, 잘못된 선언 fallback을 확인한다.
  320/390/768/1024/1440 화면·light/dark/시스템 테마·키보드·44px controls·status·스크롤·텍스트 명도 대비를 확인한다.
  장식보다 노드 정렬·레이블·간선 종단·현재 상태의 텍스트 설명을 우선한다.
- 새 type의 Frontend/Backend 계약·상태 테스트와 lint/test/build, 전체 영역 Import·중복·참조 validation을 통과한다.
  Topic reviewer 검토→교정→재검증 후 Java 전체/Network 전체를 각각 재대조한다.
  272행 모두 DONE/NO_VISUAL_NEEDED로 해소하고 SVG 27개의 최종 파일·사용처·대체 결과를 기록한다.

## 이번 감사 검증

```text
python docs/content-audit/issue-277/validate.py
```

결과: 272개 canonical Concept = Curriculum key = manifest key, 중복·누락 0;
level·Topic·objective 일치, 알려진 제목 차이 1개 기록. 27 SVG의 경로·사용처·내용 해시 대조 통과;
동일 내용 SVG 중복 0, broken canonical image 0, 새 미분류 fence 0.
33개 실행 pack의 수량/수준/구조 블록 정합성 통과. `content/`, `frontend/`, `backend/`는 기준 commit과 동일하다.
메모리 안에서 manifest를 변형한 중복 key·Concept 누락·잘못된 objective·fence 누락 4건도 각각 거부됨을 확인했다.
이 음성 검증은 실제 파일을 수정하지 않았다. staged diff의 whitespace 검사도 통과했다.

검증기는 Semantic PASS를 자동 생성하지 않는다. manifest의 판정이 여전히 맞는지는 사람이 확인해야 한다.
이 snapshot은 의도적으로 source drift에 실패한다. #278에서 내용을 바꾼 뒤 해시를 무조건 재생성해 감사 완료로 취급하지 말고,
별도 구현 완료 기록에 새 결과·검증 근거를 남긴다. 감사용 fence 인벤토리는 현재 canonical top-level 구문 전용이며
애플리케이션의 CommonMark parser를 대체하지 않는다.

문서만 변경하므로 로컬 Frontend/Backend 빌드는 반복하지 않는다. push 후 기존 Repository Validation CI의
Backend tests/build·Frontend lint/test/build·Compose validation 결과는 최종 작업 보고에 별도로 기록한다.
이번에는 Import·Production write·배포·PR·merge를 수행하지 않는다.

# Issue #222 · R1 Java Reference 정확성 교정

기준 `main`: `2ab1ccbb29ca0bc07858c20f56ae3a4826018d4f` (#224 merged), 2026-10-16. **이 PR은 Reference front matter만 변경한다.** 기존 Concept 본문, 841개 Java Question, identity, Curriculum, SVG, 제품 코드, DB 스키마와 역사적 #223 감사 기록은 변경하지 않는다.

## 출처와 판정 원칙

- [Issue #222 최신 계약](https://github.com/guseoh/csforge/issues/222), [#223 Java 49 findings](../../content-audit/learning-experience-2026/wave-4/findings.json), [관계별 감사 원본](../../content-audit/learning-experience-2026/wave-4/reference-relations.json)을 사용한다.
- Java 감사 당시 272 Reference 관계/210 URL 중 256 CURRENT_VERIFIED, 16 NEEDS_REVIEW이었다. **이전 상태값은 역사 기록**으로 유지하며 이번 변경이 원문의 검증 이력을 소급 변경하지 않는다.
- 같은 URL의 `title/referenceType/language/depth/recommendation`은 글로벌 메타데이터이고 `displayOrder/relationNote`는 관계별이다. 이 변경에서 **글로벌 제목 2URL(해당 관계 3개)**만 고쳤고 다른 메타데이터는 보존한다.
- 외부 페이지의 GitHub/웹 검색 색인에서 실제 내용·절을 확인했지만 D2 일부 원문은 직접 열면 공통 shell만 반환했다. 이를 직접 본문 전수 검증과 동일시하지 않는다. OpenJDK JEP 491은 원문 직접 확인에 접근 제약이 남아 있어 Oracle JDK 24·25 공식 문서로 교차 확인하며 유지한다.
- 오류가 명백한 자료 4관계는 **원문을 그대로 추천하지 않도록 제거**했다. Lambda 글은 Stream lazy pipeline을 직접 설명하는 확인된 학습 근거가 아니므로 해당 1관계를 제거했다. 이미 해당 Concept에는 다른 공식 자료가 존재하며 새로운 검증되지 않은 URL을 만들지 않았다.

## 확정 오류 6그룹 · 수정 대상 7관계

| ID / 심각도 | Concept · 대상 URL | 판정 · 실제 변경 | 근거 |
| --- | --- | --- | --- |
| W4-JAPI-001 / P0 | `api-design.static-factory-method` · [Tecoble 정적 팩터리](https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/) | **REMOVE** · `LottoNumber.of(int)`에 `static`이 빠져 정적 호출 불가. 기존 JLS 참조 보존 | [JLS 8.4.3.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.3.2) |
| W4-JOBJ-002 / P0 | `object-contracts.equals-contract` · [Tecoble Value Object](https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/) | **REMOVE** · Object.hashCode가 메모리 주소를 보장한다고 설명 | [Object.hashCode](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode()) |
| W4-JOBJ-002 / P0 | `object-contracts.hashcode-contract` · [Tecoble equals/hashCode](https://tecoble.techcourse.co.kr/post/2020-07-29-equals-and-hashCode/) | **REMOVE** · 고유 메모리 주소/객체마다 다른 hashCode 오개념. 동일 finding의 **두 번째 관계** | [Object.hashCode](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode()) |
| W4-JOM-003 / P0 | `object-model.class-object-constructor` · [Tecoble 생성자](https://tecoble.techcourse.co.kr/post/2021-05-17-constructor/) | **REMOVE** · 미설정 `int score`의 기본값을 null/NPE로 설명하나 실제 값은 0 | [JLS 4.12.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.5) |
| W4-JDPAT-002 / P1 | `design-patterns.strategy-pattern` · [Strategy/Command](https://tecoble.techcourse.co.kr/post/2021-10-04-strategy-command-pattern/) | **NOTE_FIX** · Strategy 부분만 활용, Command 예제 타입/호출 오류와 overload 일반화 경고 | [원문](https://tecoble.techcourse.co.kr/post/2021-10-04-strategy-command-pattern/) |
| W4-JJVM-004 / P2 | `jvm-runtime.jit-hotspot-warmup` · [우아한형제들](https://techblog.woowahan.com/2588/) | **GLOBAL_TITLE_FIX + NOTE_FIX** · 제목을 `신규 포인트 시스템 전환기 #2 – 오픈 준비 단계`로 수정, 7-1절 JIT warm-up의 **해당 워크로드 사례만** 권장 | [원문 7-1절](https://techblog.woowahan.com/2588/) |
| W4-JMETA-002 / P2 | `metadata-compatibility.serialization-contract-risk` · [우아한형제들](https://techblog.woowahan.com/2550/) | **NOTE_FIX** · 자바 직렬화 개념/사용법 입문 자료로만 추천, 장기 호환성과 보안은 공식 Serialization Spec 참조 | [원문](https://techblog.woowahan.com/2550/) |

## 기존 NEEDS_REVIEW 16관계 · 별도 판단

같은 URL의 서로 다른 Concept 관계는 각각 독립 결정이다. 현재 증거는 **웹 색인 내용과 제목에 기반한 관련 부분 확인**이며, D2 페이지 전문을 브라우저에서 독립 완독한 것으로 승격하지 않는다.

| Concept (접두사 `java.core.` 생략) | 원본 URL | 결정 | 읽을 부분 / 버전 한정 |
| --- | --- | --- | --- |
| `language-types.primitive-reference-values` | [D2/329631](https://d2.naver.com/helloworld/329631) | NOTE_FIX · 역사적 자료 유지 | GC reachability·root set; 2013년 finalization 설명은 현행 계약 아님 |
| `collections.hashmap-hashing-collision` | [D2/831311](https://d2.naver.com/helloworld/831311) | NOTE_FIX · 역사적 자료 유지 | Java 7·8의 hash/bucket/treeification 구현 사례 |
| `exceptions-resources.try-with-resources-suppressed` | [D2/1219](https://d2.naver.com/helloworld/1219) | GLOBAL_TITLE_FIX + NOTE_FIX | 실제 글 제목 `JDK 7`; try-with-resource statement와 suppressed exception |
| `functional.behavior-parameterization` | [D2/4911107](https://d2.naver.com/helloworld/4911107) | NOTE_FIX | Java 8 lambda, invokedynamic의 구현 예시 |
| `streams.stream-pipeline-laziness` | [D2/4911107](https://d2.naver.com/helloworld/4911107) | REMOVE · 관련성 불충분 | Lambda 역사 자료를 lazy Stream pipeline 동작 근거로 안내하지 않음 |
| `time-numeric.instant-local-zoned-time` | [D2/645609](https://d2.naver.com/helloworld/645609) | NOTE_FIX · 역사적 자료 유지 | Date/Calendar 시간대 문제와 Java 8 API 도입 배경 |
| `io-nio.byte-character-stream-charset` | [D2/76650](https://d2.naver.com/helloworld/76650) | NOTE_FIX · 역사적 자료 유지 | Unicode·한글 인코딩. 2012년 charset 기본값/Unicode 버전 주의 |
| `io-nio.path-files-api` | [D2/1219](https://d2.naver.com/helloworld/1219) | GLOBAL_TITLE_FIX + NOTE_FIX | 같은 제목 `JDK 7`; NIO.2·Path·Files와 try-with-resources 구분 |
| `concurrency.thread-lifecycle-interruption` | [D2/10963](https://d2.naver.com/helloworld/10963) | NOTE_FIX · 역사적 자료 유지 | BLOCKED/WAITING, thread dump lock owner 사례 |
| `concurrency.platform-virtual-thread` | [JEP 491](https://openjdk.org/jeps/491) | NOTE_FIX · 원문 직접 접근 미확정 | JDK 24 synchronized pinning 개선. [Oracle JDK 24](https://docs.oracle.com/en/java/javase/24/migrate/significant-changes-jdk-24.html)로 교차 확인 |
| `concurrency.platform-virtual-thread` | [D2/news/1203723](https://d2.naver.com/news/1203723) | NOTE_FIX · 역사적 자료 유지 | JDK 21 virtual thread 구조. JDK24 pinning 변경과 분리 |
| `jvm-runtime.jvm-runtime-data-areas-frames` | [D2/329631](https://d2.naver.com/helloworld/329631) | NOTE_FIX · 역사적 자료 유지 | stack reference→heap / GC root 설명, 물리 메모리 모델 보장 아님 |
| `jvm-runtime.gc-reachability-roots` | [D2/329631](https://d2.naver.com/helloworld/329631) | NOTE_FIX · 역사적 자료 유지 | root set·reachability, finalization 순서 주의 |
| `jvm-runtime.reference-strengths` | [D2/329631](https://d2.naver.com/helloworld/329631) | NOTE_FIX · 역사적 자료 유지 | soft/weak/phantom 구분; 옛 finalization/clear 설명 주의 |
| `jvm-runtime.gc-fundamentals-collectors` | [D2/1329](https://d2.naver.com/helloworld/1329) | NOTE_FIX · 역사적 자료 유지 | 2012 HotSpot 세대별 GC, PermGen은 현행 Java 25 규칙 아님 |
| `jvm-runtime.runtime-diagnostics-jcmd-jstack-jfr` | [D2/6043](https://d2.naver.com/helloworld/6043) | NOTE_FIX · 역사적 자료 유지 | 2012 GC 관측/jstat 예시 vs 최신 JDK25 도구 |

## 범위와 검증 게이트

- 정확성 P0 3그룹(총 4관계) 제거, Strategy P1 관계 보완, Woowa/JVM/serialization P2 관계 보완. NEEDS_REVIEW 16관계는 **모두 명시적 유지/제거/한정 판정**, 단 원문 직접 접근 제한은 남김.
- 수정 파일 **Java Concept 22개**. 기존 전체 Java 145 Concept/841 Question의 `contentKey`, 비-Reference 메타데이터/본문/Question/개인 이력 보호. 신규 URL 0, 관계 제거 5, 글로벌 title 변경이 있는 URL 2종(`/1219`, `/2588`). `displayOrder`의 불필요한 재정렬은 하지 않음.
- `python docs/content-corrections/issue-222-java/verify.py`: 15개 영역 전체 URL-global metadata 일치, 중복 관계, 변경 범위·본문 무변경·예상 relation 삭제 검증. 스크립트가 원문 의미의 신뢰도를 자동 보증하지는 않음.
- **후속 확인(2026-10-17 완료):** 격리 PostgreSQL의 PR 이전 22개 Reference → 교정 22개 Preview/Apply, 전 항목 exact reimport 3,380 UNCHANGED, identity·개인 이력·Reference 연결 보존은 `JavaReferenceFullMigrationIntegrationTest`에서 통과. 실제 Java Reader UI/Reference 표시 및 링크·키보드 사용성도 아래 독립 브라우저 검증 통과. **Production Apply/배포 없음**.
- #222 R2(15Area 전체 Reference 품질 재검토), R3(Concept Reader UX) 별도. 위 검증이 끝나기 전에는 PR은 Draft, 병합 보류.

## R1 격리 브라우저 Human Usage Check (2026-10-17)

**결과: PASS / 비운영 환경 검증.** [GitHub Actions #38989730460](https://github.com/guseoh/csforge/actions/runs/38989730460)의 일회성 Ubuntu runner에서 PostgreSQL 16.4(컨테이너), Java 25 Spring backend(local auth mode), Vite, Chromium, Noto CJK 한국어 글꼴을 사용했다. 실행 종료 시 일회성 DB/서버 정리. Google OAuth, 운영 DB, Vercel/Cloud Run 배포 사용 없음.

- 실제 `POST /api/canonical-bootstrap`: 처음 `EMPTY` → 12 batches, **3,380 CREATED / ERROR 0 → READY**.
- Java Concept 10개에서 기존 잘못된 Tecoble 4개/Stream D2 1개 URL 미노출, 공식 Reference 유지, D2 `JDK 7` 두 Concept title 일치/관계별 `relationNote` 차이, JEP 491 JDK 24 주의, JIT Woowa 교정 제목 확인.
- 실제 Reader 브라우저: 정적 팩터리(375/light), Path/Files(375/dark), 플랫폼·가상 스레드(1280/light), JIT 워밍업(1280/dark), 참조 강도(375/light). 5개에서 API의 URL/title/note와 실제 DOM 일치, HTML viewport **가로 넘침 0**, Reference 카드 배치 정상. 한국어 폰트 적용 후 실제 스크린샷 수동 열람까지 완료.
- 키보드 Reference 링크 focus → **Enter로 새 탭 URL 이동** → 외부 탭 닫기 → 원래 Reader URL 유지 **PASS**. 외부 D2 원문 내용 전문을 새로 검증한 결과는 아님.
- 콘솔 예외/앱 오류 없음. **주의:** `http://127.0.0.1:5173/favicon.ico` 미존재로 404 리소스 경고 1건 발견. Reference 수정과 무관한 favicon 경로의 일반 UI 문제로 별도 점검 가능. 이를 콘솔 완전 무경고로 보고하지 않음.
- 증거: [검증 성공 Actions Run 및 `pr225-reference-browser-evidence` Artifact](https://github.com/guseoh/csforge/actions/runs/38989730460), `report.json` 및 브라우저 스크린샷 PNG 5개. 임시 GitHub Actions workflow 서비스/실행 Step과 일회성 스크립트는 검증 후 PR diff에서 제거했다.

**R1 판정:** 실제 표시·운영 이력 격리·Reference 연결·UI Human Usage 모두 검증됨. 기존 D2 사이트 전체 원문 접근 및 JEP491 원문 접근 제약은 초기 감사 판정대로 보존한다. PR 병합 여부는 사용자 별도 승인; Issue #222 R2 전체 학습영역과 R3 Reader UX는 별도 후속.

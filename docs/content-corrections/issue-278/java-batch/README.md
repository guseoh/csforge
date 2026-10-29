# #278 Java Content Batch — 네 Topic

기준: `refactor` `786b25a9f4d0a08477e9c87da34122730037962b`, 2026-10-28 KST.
최신 원격을 fetch하고 기존 로컬 #270 보고서/`backend/bin/` 변경을 보존한 상태에서 진행했습니다.

| Topic | 검토 Concept / Question | 도식 결과 | 재import UNCHANGED | 별도 기록 |
| --- | --- | --- | ---: | --- |
| J-object-contracts | 5 / 31 | V1 2 · NONE 3 | 37 | [보고서](../J-object-contracts/README.md) |
| J-generics | 6 / 37 | V1 2 · V2 1 · NONE 3 | 44 | [보고서](../J-generics/README.md) |
| J-collections | 9 / 51 | V1 5 · V2 1 · V3 KEEP 1 · NONE 2 | 61 | [보고서](../J-collections/README.md) |
| J-io-nio | 6 / 35 | V1 2 · V2 2 · NONE 2 | 42 | [보고서](../J-io-nio/README.md) |

26개 Concept 전체를 검토해 23개 본문을 개선했습니다. 적절한 기존 설명은 유지했습니다.
154개 Question을 전수 대조해 11개 문항의 선택지/근거/해설만 교정했고,
정답 키·모범 답안·난이도·문항/선택지 key·순서·Concept 연결은 모두 보존했습니다.
단일 Codex의 구현·자체 검토 기록이며 독립 리뷰 승인으로 간주하지 않습니다.
기존 `J-object-model`은 수정하지 않았고 독립 리뷰 대기 상태를 유지합니다.

## 핵심 교정과 도식

- Selector P0: key별 `interestOps`/`readyOps`와 Selector의 selected-key set을 분리했습니다.
  기존 선택 키/준비 비트가 남는 경우, 0 갱신, 명시적 제거, 등록 유지, cancel의 즉시 무효화와 다음 선택의 정리를 6단계로 다룹니다.
  READ는 메시지 완성·다음 read 성공량 보장이 아니며 EOF/오류도 구분합니다.
  근거: [Selector](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/Selector.html),
  [SelectionKey](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/SelectionKey.html).
- Queue 전체를 FIFO로 소개하던 일반화, Reader 자체와 codec의 혼동,
  flush의 원격 수신/지연 보장 과장, TreeSet과 일반 Set 계약 경계,
  equals의 비대칭 원인·비교 결과 0의 의미를 교정했습니다.
- `java-api-contract`는 승인된 고정 예제 13개만 받습니다. 임의 코드·좌표·자유 그래프·외부 입력은 받지 않습니다.
  Java/TypeScript strict 계약과 공유 정상/오류 fixture를 함께 확장했습니다.
- 기존 중성 다크/라이트 토큰을 사용했습니다. PECS는 두 경계 사이 값 이동,
  List는 참조 슬롯/이중 연결의 두 행, Buffer는 같은 8칸과 커서,
  나머지는 계약·상태 차원을 분리한 레인으로 표시합니다. 장식 애니메이션·발광·그라데이션은 추가하지 않았습니다.
- 기존 ArrayList/PECS 구조는 inline RESTYLE, HashMap/Buffer/Selector는 inline REBUILD,
  PriorityQueue V3는 KEEP입니다. 기존 외부 SVG 27개는 이전 저장 본문의 호환성을 위해 보존했습니다.
  다른 Java Topic과 Network의 canonical 파일은 변경하지 않았습니다.

## 검증과 근거

| 검사 | 결과 |
| --- | --- |
| 전체 Backend `test build --no-daemon` | **PASS**, 54 suite / 190 tests, 실패·오류 0, 성능 환경용 1 skip, 28m 10s |
| 최종 콘텐츠/계약/전체 bootstrap targeted `test … build` | **PASS**, 4 suite / 10 tests, 실패·오류·skip 0, 3m 33s |
| Frontend `npm.cmd run lint`, `npm.cmd test`, `npm.cmd run build` | **PASS**, 73 files / 529 tests, TypeScript/Vite/PWA build 성공 |
| Compose | local/prod config 성공, POSTGRES_PASSWORD 누락 시 예상대로 거절 |
| 네 Topic 전체 Import | Preview ERROR=0 → Apply → 두 번째 Preview 전부 UNCHANGED → 재Apply |
| 보존 | 26개 Concept의 seeded 개인 이력 8개 테이블, 모든 Concept/Question/선택지 ID·정답·관계 동일 |
| Java 25 compiler/API | PECS 허용, 불공변/비실체화 instanceof/소거 충돌 거부, unsafe varargs의 지연 캐스트 실패, 해시 충돌·뷰·Comparator·실제 Buffer/Selector 상태 검증 |
| 실제 Markdown 브라우저 | 앱 CSS 40개를 읽는 임시 fixture에서 26개 × 다크/라이트 × 1440/390px = 104개 검사, 도식 대체 오류·SVG 텍스트 넘침 0 |
| 조작 | 새 V2 4개 정/역방향·초기화, Enter로 Buffer 6/6, 모바일 가로 이동, 힙 offer/poll·복구 중 조작 차단·잘못된 입력 거절 |
| 범위/식별자 | `inventory.py`로 26개 frontmatter 전체·154개 정답/관계/선택지 key와 순서 보존 확인, 제외 Topic·SVG 27개 무변경 |

최종 콘텐츠 검사는 전체 검사 이후의 최종 본문/문항과 생성된 canonical manifest를 대상으로 수행했습니다.
초기 Gradle 인자 오류와 재개 시 Docker 엔진 종료는 소스 검증과 구분했고,
명령/환경을 복구한 최종 실행은 위와 같이 통과했습니다. QA-only entry의 HMR에서 생긴 중복 createRoot 메시지는
새 페이지에서 재현되지 않았으며, 최종 새 페이지의 warn/error는 0건입니다.

브라우저는 실제 Markdown/컴포넌트/CSS 검증이며 영속성 증거를 대신하지 않습니다.
저장·이력 보존 증거는 별도의 실제 PostgreSQL Testcontainers 통합 검사입니다.
운영 DB·Production 배포·PR·merge에는 접근하지 않았습니다.

- [검증 집계와 원시 로그 해시](verification.json)
- [전체 Backend 집계](backend-full-summary.json), [최종 콘텐츠 검사 집계](backend-final-summary.json)
- [브라우저 검사 기록](browser-qa.json)
- [공식/보조 Reference 49개 확인 기록](references.json)
- [Selector 데스크톱 다크](selector-desktop-dark.png), [Buffer 모바일 라이트 6단계](buffer-mobile-light.png)
- [기존 디자인 후속 목록](design-followups.md)

`refactor` push의 Repository Validation은 이 최종 소스로 Backend tests/build,
Frontend lint/test/build와 Compose를 다시 실행합니다. 원격 run URL/결과는 최종 작업 보고에 기록합니다.
Production 배포 job은 main에만 해당하므로 이번 refactor push에서는 실행 대상이 아닙니다.

## 재현 명령

```powershell
python docs/content-corrections/issue-278/java-batch/inventory.py
# backend/
.\gradlew.bat test build --no-daemon --console=plain
.\gradlew.bat test --tests '*JavaApiContractTest' --tests '*LearningVisualizationValidationTest' --tests '*ContentImportIntegrationTest.fourTopicBatchPreviewApplyReimportPreservesCanonicalIdentitiesAndHistory' --tests '*CanonicalBootstrapIdempotencyIntegrationTest' build --no-daemon --console=plain
# frontend/
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

QA 서버와 임시 entry/data 파일은 검사 후 정리합니다. 새 DB schema·런타임 의존성·범용 도식 엔진은 추가하지 않았습니다.

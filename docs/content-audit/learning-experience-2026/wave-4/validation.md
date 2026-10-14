# Wave 4 세 Topic 및 Reference 관계 검증

2026-10-14, 최신 main `efe73a15da14c996bd08344181d4d6f87073803d`, 이전 감사 commit `81484fb00c172b5fa7e109e2aa3d914dba28b4c8`.

- `check-accumulation.py`: **15개 회귀 PASS**. 누적·중복key·누락row·stale Curriculum/SVG, 앞Topic 원본/단일 snapshot, 같은Topic/다른Topic 상태분리·미검토key, supporting 차용 거절, 기존44관계/두ledger bytes, Reference 중복·누락·무관한URL·stale source·변경인용·누락supporting을 검사한다.
- checkpoint3개: language-types10C/55Q, object-model12C/68Q, api-design5C/28Q. 고유178 item key/hash, C5축/Q2축 수기 근거, 원문 인용/정확한 source object 대응 **PASS**.
- generate / `--check`: errors/drift0, 전체15Area/134Topic/721C/2,525Q/Reference1,043관계·625URL/60SVG. Wave4 **3Topic/27C/151Q**, 누적 **119Topic/603C/1,835Q**; Java Area는CURRENT_PARTIAL 유지.
- 관계 sidecar53 canonical행의 front matter 집합·객체·파일/hash 대조 PASS. 기존20+24관계의 상태는19+24 verified/1D2미확정으로 보존, api-design9관계 직접검토 추가. 보조3관계는 사용Concept에만 귀속한다. 누적52verified/1미확정에 confirmed P0 출처오류2관계를 별도 qualityIssueIds로 표시한다.
- 이전 두 Topic 원본, 단일Topic snapshot, 첫 report/validation, object-model report, 두 Java probe, LEX-002 계승은 Git81484fb의 bytes와 동일. 새 two-topic-summary snapshot도 그 Git 원본 bytes와 동일. 기존 발견7그룹과 severity/P0 3·P1 3·P2 1은 보존했다.
- api-design 밖의 모든 Concept/Question review와 source hash 동일. 기존 두 Topic Reference 상태/접근/qualityIssueIds 동일. 미검토 Java 및 다른 Area Reference 행 동일. Wave1~3 원본 ledger·발견·summary/초기근거 무변경 PASS.
- 변경Python4개 AST 구문 PASS. `git diff --check` / staged check, 감사 폴더 한정 검사 PASS. 기존 미추적 backend/bin/ 보존.
- canonical/Curriculum/자산945 input은 baseline Git object 동일. DB/Import/제품기능·이미지 생성/수정 없음. PR178 head와 현재 api-design canonical Git 차이0.
- 제한 javac probe exit0: original builder includeClosed compile error / 해당호출 한줄 제거 compile success / 최소재구성 instance factory의 class호출 non-static compile error. Temurin25.0.4.1·임시디렉터리이며 해당쟁점만확인했다. 초기probe의 repository 경로 오프셋을 보정했고 sandbox 임시폴더 권한 실패는 승인된 제한 실행으로 해결했다. 실제 최종 stdout/hash는 신규ledger에 기록했다.

새 commit의 GitHub CI는 PR/최종 보고에서 별도 확인한다. D2본문1관계, 공식문서전문/모든코드실행 및 Reader/mobile/theme/human QA는 미완료다. 다음 object-contracts5C/31Q는 미검토이며 Wave4/Java/Issue200 전체완료로선언하지않는다.

## object-contracts 정식 checkpoint 추가 (2026-10-14)

- 5C/31Q 전수 의미 근거와 36개 source hash, 관계별 Reference 7개 추가. 기존 세 Topic ledger 및 기존 Reference 관계/판정은 보존한다.
- 새 발견 그룹: W4-JOBJ-001 P0(인자 생성자 없는 Key), W4-JOBJ-002 P0(두 한국어 학습 자료의 Object.hashCode 고유 주소 일반화), W4-JOBJ-003 P1(Comparator q4 비교 대상 타입 전제).
- 누적 기대: Java 4/18Topic·32C/182Q, 전체 120/134Topic·608/721C·1,866/2,525Q. 원본 저장소 audit.py generate/--check 및 Python 회귀 테스트와 최종 CI는 새 커밋에서 별도 확인한다.
- canonical/Curriculum/SVG·DB/Import·제품 코드 변경 없음. Java25 전체 예제 실행 및 Reader/mobile/theme/human QA 완료는 주장하지 않는다. Draft/병합 보류.

## enum-modeling checkpoint 확장 (2026-10-14)

- 4개 Concept와 18개 Question(MC17/SCENARIO1)의 전체 본문·정답·모든 오답 rationale·모범 답안·해설을 직접 검토한 22개 수기 ledger row 및 해시를 추가했다.
- 새 발견 W4-JENUM-001 P0(선행 enum에 존재하지 않는 COMPLETED)·W4-JENUM-002 P1(2개 Question의 미선언 enum/상수)를 추가했다. javac21 제한 재구성으로 상수·식별자 컴파일 오류 확인(전수 Java25 probe 아님).
- 관계별 Reference5개 추가, Wave4 65관계/54URL(64 verified/1 D2 unverified); 누적 5Topic/36C/200Q, 전체 121Topic/612C/1884Q.
- 실제 Python audit.py generate/--check, check-accumulation, checkpoint-topic 및 git diff --check 실행 결과는 아직 확인하지 못했다. 원격 GitHub 인벤토리 교차 검사와 Actions CI는 별개로 판단한다.
- 변경은 감사 문서만. canonical/Curriculum/이미지/DB/Import/제품 무변경·Draft 병합 금지.

## enum-modeling 실제 Actions 감사 재검증 (2026-10-14)

- 일회성 **읽기 전용** `CSForge Audit Verification Once` 워크플로를 Draft 브랜치에서 실행했다. 최초 [실행 #38523229234](https://github.com/guseoh/csforge/actions/runs/38523229234)는 **검증 실패**: `audit.py` generate 및 `--check` 각각 errors/drift0이었으나, Git에서 추적하는 생성 결과와의 `git diff --exit-code`에서 **area-summary.json/md, inventory.json, reference-inventory.json, wave-4/findings.md 총 5파일의 생성 산출물 불일치**를 발견했다. 기존 수기 결과의 정렬·기존 항목 순서 및 계승 LEX-002 설명이 생성기 출력과 불일치한 부분이었다.
- 생성기의 실제 unified diff를 정확히 적용하여 위 **5개 감사 산출물만** 교정했다. Concept·Question 원문, Curriculum, SVG/이미지, 기타 제품 파일은 수정하지 않았다.
- 수정 커밋 `e6e17f0f60d9aa60b50cadbe3d713a403ac03fec`의 [재실행 #38523599416](https://github.com/guseoh/csforge/actions/runs/38523599416)은 **SUCCESS**: `check-accumulation.py` **16/16 PASS**, 다섯 Java Topic의 `checkpoint-topic.py` 모두 **PASS**, `audit.py` generate 및 `--check` **errors 0/drift 0**, 이어지는 `git diff --exit-code -- docs/content-audit/learning-experience-2026/`, baseline의 `content`/학습 이미지 변경 없음, `git diff --check` 모두 **PASS**.
- 검증한 전체 범위는 **15 Area/134 Topic/721 Concept/2,525 Question/Reference 1,043관계·625URL/SVG 60**, Wave4 부분 완료 **Java5 Topic/36C/200Q**, 전체 누적 전수 검토 **121 Topic/612C/1,884Q**다. D2 Reference 1관계 미확정, 외부 자료의 사실 오류 및 후속 교정 대상은 별도 유지한다.
- 검증용 `.github/workflows/csforge-audit-verification-once.yml`은 성공 후 커밋 `eb9043d75c60a29bc473157053256d68131c59ce`에서 **삭제**했다. 최종 PR diff에서 워크플로·canonical·DB·제품 경로를 남기지 않는다. 읽기 전용 실행으로 배포하지 않았으며 별도 Import Apply/Human Reader QA는 수행하지 않았다.

## design-patterns 실제 로컬 checkpoint 검증 (2026-10-14)

기존ff3bf6b4를fast-forward한후원본8C/40Q와전체48개source hash/인용/10Reference/1SVG를정식검토했다. 누적회귀17개PASS, audit.py generate/--check errors/drift0, design-patterns checkpoint PASS. 최신6Topic/44C/240Q·전체620C/1924Q를확인했다. 새세부P2 두건을기존후보와구별했다. 코드변경의구문/diff와canonical/앞5ledger/관계/snapshot불변을대조한다. CI는push된실제commit에대해따로확인한다. 과거단락의5Topic/미실행상태는역사적기록이다.

## collections checkpoint (2026-10-14)

9C/51Q의 수기 근거·hash·인용, 19개 Reference 관계와 3SVG source hash를 확인했다. 누적 회귀17개 PASS, generate errors0, checkpoint PASS, --check drift0이다. 최신 Java7Topic/53C/291Q 및 전체629C/1975Q를 재집계했다. 제한 Java probe는 copyOf null NPE와 get의 mapping 보존을 확인했다. 이전5Topic ledger·65관계의 보존과 Topic/Concept 간 Reference 격리는 회귀 검사에 포함된다. 새 산출물 외 canonical/Curriculum/SVG 변경은 없다. 직전 design-patterns HEAD20e8ad21의 Repository Validation #1215(run38530080210)는 SUCCESS였고, collections CI는 push된 HEAD에 대해 별도로 확인한다.

## generics checkpoint (2026-10-14)

6C/37Q의 개별 hash/수기 근거/발견 인용과11 Reference 관계·PECS SVG source hash를 확인했다. 회귀17개 PASS, generate/--check errors/drift0, checkpoint PASS. Java8Topic/59C/328Q·전체635C/2012Q, 관계105중103의 관련 의미 확인/2미확정을 재집계했다. 한계는 checkpoint/ledger에 명시하며 자동 검사로 의미 판정을 생성하지 않는다. 직전 collections HEADcab16fcac68540efe585009511a6994826bff30b의 [Repository Validation #1216](https://github.com/guseoh/csforge/actions/runs/38532532282)는 SUCCESS: Backend tests/build, Frontend/Compose validation 성공, Cloud Run 배포 skipped. generics CI는 해당 push HEAD에서 별도 확인한다.

## exceptions-resources checkpoint (2026-10-14)

8C/46Q의 수기 근거·hash·발견 인용/12 Reference 관계/1SVG source를 확인했다. 회귀17개 PASS, generate/--check errors/drift0, checkpoint PASS. Java9Topic/67C/374Q·전체643C/2058Q를 재집계했으며 기존 ledger/Wave1~3 변경은 없다. 명시된 helper 반례와 null 매핑의 제한 Java probe가 성공했다. 직전 generics HEAD35f4b037cc609e5908214fa2d78ff13cb72ffa93의 [CI #1217](https://github.com/guseoh/csforge/actions/runs/38533596230)는 SUCCESS: Backend tests/build, Frontend/Compose 성공, Cloud Run 배포 skipped. 신규 checkpoint CI는 push HEAD에서 확인한다.

## functional checkpoint (2026-10-14)

5C/33Q 개별 근거·hash·발견 인용과8 Reference 관계를 확인했다. 회귀17개 PASS, generate/--check errors/drift0, checkpoint PASS. Java10Topic/72C/407Q·전체648C/2091Q를 재집계했다. 제한 probe는 대문자 parameter 이름과 Consumer 입력만 확인한다. 기존 ledger/Wave1~3 및 canonical/Curriculum/SVG 변경은 없다. 직전 exceptions-resources HEAD55a045e572965bcc1e868bb1232cf1ca8c4b3b33의 [CI #1218](https://github.com/guseoh/csforge/actions/runs/38534798523)는 SUCCESS: Backend tests/build, Frontend/Compose 성공, 배포 skipped. 신규 checkpoint CI는 push HEAD에서 확인한다.

## streams checkpoint (2026-10-14)

7C/41Q 전수 읽기의 개별 근거/hash/인용과9 Reference 관계/1SVG를 대조했다. 3Q 품질 미확정을 독립 사례로 보존하고, 사례 key·판정·확인 이유/공식 근거/원문 prompt 정확 일치를 생성기에서 검증한다. 누적 회귀18개 PASS, generate/--check errors/drift0, checkpoint PASS. Java11Topic/79C/448Q·전체655C/2132Q는 전수 읽기 근거 집계이며 품질미확정3Q가있다. 기존 ledger/Wave1~3/canonical/Curriculum/SVG 무변경. 직전 functional HEADd9cd4bd79afe3018ca91bbc6235fee865546787e의 [CI #1219](https://github.com/guseoh/csforge/actions/runs/38535861589)는 SUCCESS. 신규 checkpoint CI는 push HEAD에서 확인한다.

## modern-language checkpoint (2026-10-14)

8C/43Q의 개별 근거·hash·인용 및13 Reference 관계를 대조했다. 회귀18개 PASS, generate/--check errors/drift0, checkpoint PASS, Python AST/diff 검사 성공. Java12Topic/87C/491Q·전체663C/2175Q다. 기존 streams의 품질 미확정3Q, 앞선 ledger/Reference/Wave1~3/canonical/Curriculum/SVG는 보존한다. 직전 streams HEADf84f8d65faed89993a92f6eb2f3d6629cb86d3ec의 [CI #1220](https://github.com/guseoh/csforge/actions/runs/38537596804)는 SUCCESS. 신규 checkpoint CI는 push HEAD에서 확인한다.

## time-numeric checkpoint (2026-10-14)

7C/42Q의 수기 근거/hash/인용,15개 Reference 관계와2SVG 전체 source/geometry를 대조했다. 누적 회귀18개/checkpoint/generate/--check errors/drift0/Python AST/diff PASS. Java13Topic/94C/533Q·전체670C/2217Q를 재집계했다. Reference162관계 중156관련 의미 확인/6미확정; 직접 읽은 streams 품질 미확정3Q 보존. 기존 ledger/Wave1~3/canonical/Curriculum/SVG 무변경. 직전 modern-language HEADce243fb1f869b270e0a5e1e5b1c8ad439477ca15의 [CI #1221](https://github.com/guseoh/csforge/actions/runs/38539255954)는 SUCCESS. 현재 checkpoint CI는 push HEAD에서 확인한다.

## io-nio checkpoint (2026-10-14)

6C/35고유Q·15 Reference 관계·2SVG source와좌표를직접대조했다. 누적회귀18개/checkpoint/hash/인용/generate/--check errors/drift0/Python AST/diff PASS. 제한UTF8decoder probe는첫실행Windowsstdout인코딩실패후 숫자codepoint출력으로1회수정재실행성공. Java14Topic/100C/568Q·전체676C/2252Q;streams직접읽은품질미확정3Q유지. 기존ledger/Wave1~3/canonical/Curriculum/SVG보존. 직전 time-numeric HEAD335fbf5a595830267ced2b2530607e24a97c119c의 [CI #1222](https://github.com/guseoh/csforge/actions/runs/38540225247)는SUCCESS. 신규checkpoint CI는push HEAD에서확인한다.

## coding-tests checkpoint (2026-10-14)

7C/46고유Q/11관계전수근거·hash·인용을확인하고복수Concept문항중복집계없이누적했다. 회귀18개/checkpoint/generate/--check errors/drift0/Python AST/diff PASS. Java15Topic/107C/614Q·전체683C/2298Q이며streams직접읽은품질미확정3Q보존. NONE도식계약은코드·ASCII로실제목표와대조했다. 기존ledger/Wave1~3/canonical/Curriculum/SVG 무변경. 직전 io-nio HEADb00d7c8b41c7710130f9ad0f0bd4f39573480136의 [CI #1223](https://github.com/guseoh/csforge/actions/runs/38541155008)는SUCCESS. 신규checkpoint CI는push HEAD에서확인한다.

## metadata-compatibility checkpoint (2026-10-14)

7C/39Q全본문·문항수기근거/46hash/인용·15관계및ProxySVG source/geometry를대조했다. 회귀18개/checkpoint/generate/--check errors/drift0/Python AST/diff PASS. Java16Topic/114C/653Q·전체690C/2337Q. Wave4 Reference203관계/162URL중195관련의미검토/8미확정이며확인된Woowa목적불일치는별도qualityIssueIds에연결했다. 앞선streams품질미확정3Q와기존ledger/Wave1~3/canonical/Curriculum/SVG보존. 직전 coding-tests HEADec693c369ea511481a3885e63923fb312a76db22의 [CI #1224](https://github.com/guseoh/csforge/actions/runs/38541995756)는SUCCESS. 신규checkpoint CI는push HEAD에서확인한다.

## concurrency checkpoint (2026-10-14)

19C113Q/132hash·인용/38관계 및4SVG 전체 source/좌표를 직접 대조. 회귀18개/checkpoint/generate errors0 통과. --check/Python AST/diff와 기존 근거 보존을 최종 대조한다. Java17Topic133C766Q·전체709C2450Q. Reference 누적241관계 중230의미 검토/11미확정, streams 품질 미확정3Q 유지. 직전 metadata HEAD97f6216d7df955d169654a91b8607dcf2858b549의 [CI #1225](https://github.com/guseoh/csforge/actions/runs/38543076624)는 실제 검증 job SUCCESS/Deploy SKIPPED. 현재 CI는 push HEAD에서 확인한다.

## jvm-runtime 및 Java 전체 최종 checkpoint (2026-10-14)

12C75Q/87hash·인용·31관계·7SVG 전체 source/좌표를 직접 대조했다. checkpoint-topic.py PASS. canonical catalog의18Topic/145C/841Q key-set을 독립 비교하고 직전17Topic ledger/241Reference 관계 원본 보존을 회귀에 추가했다. check-accumulation.py 19개 PASS. audit.py generate와 --check errors/drift0, 변경 Python6개 AST PASS, git diff --check PASS. 기준선 대비 content/backend/frontend/.github 변경 경로0, 작업 시작점 대비 Wave1~3 변경0이다.

Java18Topic145C841Q 및 전체15Area134Topic721C2525Q의 전수 읽기 근거가 완성됐다. Java C KEEP116/보강29, Q KEEP804/보강34/품질 미확정3을 분리한다. Reference272관계/210URL 중256관련 의미 검토/16미확정. 잔여13Topic 새 P0 2/P1 7/P2 24와 기존첫5Topic/계승LEX-002를 별도로 집계했다. Reader render/mobile/theme·모든snippet/GC/JIT timing 실행은 미수행이다. 직전 concurrency HEAD5f31d79dd61df6325de89577e51cac1ad568d636의 [CI #1226](https://github.com/guseoh/csforge/actions/runs/38571441198)는 실제 Backend tests/build·Frontend/Compose step SUCCESS, Deploy SKIPPED다. 최종 push HEAD의 CI는 PR에서 확인한다. 콘텐츠 교정·ChatGPT 최종 품질 검토·Issue200 최종 승인은 별도 단계다.

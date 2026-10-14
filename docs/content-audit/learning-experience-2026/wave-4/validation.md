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

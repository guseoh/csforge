# Wave 4 두 Topic 검증

2026-10-14, main `efe73a15da14c996bd08344181d4d6f87073803d`, 이전 감사 commit `393d098c1e3f16ccc80a5fc9fdf2c6848a1fd98b`.

- 두 checkpoint: language-types10C/55Q, object-model12C/68Q. 고유145 item key/hash, 각 C5축/Q2축 수기 근거, 발견·판정·원문/추가 인용 대조 PASS.
- `check-accumulation.py`: 실제 두 Topic 원본/앞 Topic 발견·SVG·probe 보존, 공통 URL의 반대 검토 상태 격리, 중복 key·누락 row·stale Curriculum/SVG pin 거절, 이전 단일 Topic의 Git bytes·품질 분포 snapshot 비교의 **6개 회귀 검사 PASS**.
- generate / `--check`: 15Area/134Topic/721C/2,525Q/1,043 Reference관계/625 URL/60SVG, errors/drift0. Wave4는2Topic/22C/123Q로 별도 집계되며 Java Area는CURRENT_PARTIAL 유지.
- 기존 language-types의4발견/LEX-002/D2상태/4SVG/probe가 누적 결과에 보존됨. 미검토 Java Topic의 판정/hash/Reference 행이 기존 Git snapshot과 동일. 기존 Wave1~3 수기 ledger·발견·summary 및 초기 근거 무변경 PASS.
- canonical/Curriculum/자산945 input의 baseline Git object 동일. 새 finding의 인용은 대상 Question object/Concept 또는 Reference URL 안에서 일치. external constructor 글의int/null 오류는 공식JLS/직접접근근거를별도기록하며외부자료의파일hash를위조하지않음.
- 변경Python audit.py/wave_review.py 및 추가회귀검사 구문, `git diff --check`/staged 공백·감사 폴더 한정 확인 PASS. 기존 미추적 backend/bin/ 보존.
- ObjectModelProbe: Temurin25.0.4.1+1-LTS에서exit0, ordinary=null→kim / early=ready / omittedIntScore=0. 언어보장은JLS, 실행은한구현의제한된대조.

로컬 product build/test·Import·DB·배포·SVG제작/수정은 실행하지 않았다. 새 commit의 GitHub CI는 PR/최종 보고에서 별도 확인한다. D2미확정1관계, 모든명세전문/전체예제실행 및 Reader/mobile/theme/human QA는 미완료다. Wave4전체완료로선언하지않는다.

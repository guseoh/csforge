# language-types 검증 근거

2026-10-14, main `efe73a15da14c996bd08344181d4d6f87073803d`, 이전 감사 HEAD `0b092dad5d6222e1e38c9f51b707d3bdf446e977`. 아래 검증은 수기 근거와 원문 관계를 확인하며 의미 판정을 자동 생성하지 않는다.

- Topic checkpoint: 10C/55Q, 고유 65 key·hash·C5축/Q2축의 근거와 발견/판정 연결, 원문/추가 인용 PASS.
- `audit.py` generate / `--check`: 15 Area/134 Topic/721C/2,525Q/1,043 Reference 관계/625 URL/60 SVG, 오류·drift 0.
- Question 발견의 인용은 해당 contentKey의 canonical object 안에 일치하며 발견의 line·file hash를 생성한다. JSON duplicate property, 관계, enum, key 및 source hash 검증 PASS.
- Python audit.py/wave_review.py 구문 검사 PASS.
- 기존 Wave 1~3 ledger·생성 snapshot·발견 및 초기 근거 무변경, 다른 Java Topic의 item 판정/Reference 검증 무변경 대조 PASS.
- canonical/Curriculum/이미지 945 input의 baseline Git object 동일. 감사 파서의 ALT 대괄호 처리 보정으로 기존 array-covariance 링크가 인식됨; 그림 존재/연결로 자동 KEEP 처리하지 않음.
- 제한된 Java25 probe exit0: 상수 축소, String/int += null, Locale, 상수/비상수 연결의 네 쟁점만 실제 실행. 실행 결과/환경/소스 hash를 checkpoint에 고정.
- `git diff --check` 및 staged 공백/변경 범위 확인 PASS. 감사 폴더만 변경, 기존 미추적 backend/bin/ 보존.

로컬 product build/tests·Import·DB·배포는 실행하지 않았다. 새 커밋의 GitHub CI는 PR과 최종 보고에서 확인하며 과거 성공을 재사용하지 않는다. D2 관련 1관계는 Reference NEEDS_REVIEW이고 Reader render/mobile/theme 및 전체 runtime 예제 QA는 미완료다. Java 전체/Issue #200 전체 완료를 의미하지 않는다.

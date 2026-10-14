# coding-tests 정식 checkpoint

2026-10-14. 7C/46고유Q의 전체 본문·모든 보기/rationale·정답·모범 답안·해설·난도·연결을 직접 읽고 [53개 근거/hash](topics/java--coding-tests.json)에 기록했다. 복수 Concept의 시나리오는 각 연결을 확인하되 고유 문항1개로 센다. Concept KEEP6/보강1, Question KEEP45/보강1. 새 P0 0/P1 1/P2 1그룹이다.

W4-JCOD-001 P2는 priorityqueue-coding-tests 본문에서 앞의 Integer queue와 뒤의 State 삽입/반환이 같은 queue 이름으로 연결되면서 State용 큐 선언이 생략된 부분이다. 독립 예시로 읽으면 원리는 맞지만 연결해 실행할 타입 전제가 없다. State용 states 선언과 비교 기준·두 호출 이름만 보강한다. W4-JCOD-002 P1은 같은 Concept q1의 “기본 생성”과 비어 있지 않은 큐의 최소 헤드 전제 누락이다. empty의 peek/poll null과 null 원소 금지를 구분해 prompt·D feedback을 한정하며 정답A는 유지한다. #201 최소 교정 대상이며 canonical 수정은 없다.

입력 줄·토큰·EOF·숫자 결과 범위, 조립과 출력 buffer·메모리 비용, primitive/reference sort·원본 변경·반열린 범위, 비교자 우선순위·overflow·reverse 범위, Deque의 양끝 상태, PQ tie/가변 키/stale version, count/membership와 최종 출력 정렬을 개별 대조했다. 단순 용어와 상태 실행·설계 시나리오의 목표를 구분했다. Hash 빈도 시나리오의 Entry는 서술한 전용(word,count) tuple 전제로 읽었으며 Map.Entry에 count/word API가 존재한다고 승인하지 않았다.

11 Reference 관계를 각각 공식 API의 관련 절에 대응했다. 새 미확정은 없다. 모든 Curriculum NONE은 코드·front/back/우선순위·조립 흐름으로 설명이 충분한지 확인했으며 이미지 부재 결함은 만들지 않았다. 전체 snippet 컴파일·성능·Reader render/mobile/theme QA는 미수행이다.

회귀18개/hash/인용/checkpoint/generate/--check errors/drift0을 검증했다. Java15/18Topic·107/145C·614/841Q, 전체683/721C·2298/2525Q의 전수 읽기 근거다. streams 품질 미확정3Q를 보존한다. 다음 metadata-compatibility, concurrency, jvm-runtime의 잔여3Topic/38C/227Q를 계속한다. Java 전체 완료가 아니다.

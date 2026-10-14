# jvm-runtime 정식 checkpoint

2026-10-14. [12C/75Q ledger](topics/java--jvm-runtime.json)의 전체 본문·모든 보기/rationale·모델/해설·난도·연결을 직접 읽었다. 87개 source hash/정확한 인용으로 추적한다. Concept KEEP9/보강3, Question KEEP71/보강4, 신규 REWRITE_REQUIRED/품질 미확정0. 새 P0 0/P1 1/P2 4그룹이다.

W4-JJVM-002 P1: heap-metaspace-native-thread-memory.q4는 참조값과 그 대상인 래퍼 객체를 섞어 D를 문자 그대로 읽으면 의도한 B 외의 답 논거가 성립한다. 정답을 D로 임의 변경하지 않고, 래퍼 객체/참조값/실제 backing bytes의 주어를 분리해 유일성을 회복한다.

P2: 001은 gc-reachability-roots.q4의 부자연스러운 도달 불가 문장, q5의 진행성/참조 생존성 혼동, java-memory-leaks.q6의 old 생성/세대 오기다. 003은 JVMS의 자동관리 시스템과 구현별 기법 선택을 첫 문장 한 곳에서 구분한다. 004는 Woowa2588의 실제 제목·편을 맞추되 확인된 7-1 warmup 사례와 본문은 유지한다. 005는 런타임 영역 SVG에서 Thread A의 heap 참조선이 Thread B의 현재 frame 내부를 가로지르는 좌표 간섭이며 경로만 분리한다.

31 Reference 관계 중26 관련 의미 검토/5 미확정. 같은 D2 329631이라도 frames·roots·reference-strengths의 세 관계를 각각 미확정으로 남겼다. GC1329/diagnostics6043도 shell만으로 본문을 확인했다고 주장하지 않는다. guide의 index와 하위 chapter 읽기를 구분했으며 공식 GC/JIT/Metaspace/NMT 절을 해당 목적에 독립 대응했다. Woowa 제목 문제는 관계 검토 완료와 별도의 품질 발견으로 연결한다.

JVMS5.4/5.5의 preparation 기본값과 initialization의 ConstantValue-before-clinit, lazy resolution/erroneous state, name+defining loader, thread별 frame·shared heap/method area를 대조했다. JLS12.7의 unload 가능 조건, ref API의 soft-OOM/phantom-get/queue 등록 객체 자체 수명도 확인했다. 기존 PR178의 ConstantValue·NMT 등 해결 내용을 다시 결함으로 만들지 않는다. NMT의 JDK·third-party 제외와 jcmd25의 format=plain은 정확하다.

HotSpot tiered/JIT와 deoptimization은 Java 일반 보장으로 확대하지 않았다. Java25 고정 tag의 deoptimization 이유·invalidate/recompile 관련 코드/주석과 공식 JMH fork/DCE 예제를 추가 대조했다. collector-dependent 참조 처리 시점은 같은 허용 계약에서도 달라질 수 있으며, GC 문항의 의미 보존을 모든 실행 결과 동일성으로 승인하지 않는다.

7SVG 전체 source/title/desc/styles/좌표/경로를 실제 설명과 비교했다. 명확한 좌표 간섭 외에 roots의 제거된 경로 범례, retained path의 삭제 전후 상태는 선택 보강 후보다. 실제 Reader render/mobile/theme 및 모든 snippet·collector/JIT timing 실행은 미수행이다.

Java18/18Topic·145/145C·841/841Q 전수 읽기 근거가 완성됐다. 전체15Area/134Topic·721C/2525Q를 재집계한다. 품질 미확정인 기존 streams3Q와 Reference 미확정은 유지하며, 이 checkpoint를 콘텐츠 교정·모든 품질 문제 해결 또는 Issue200 최종 승인으로 선언하지 않는다.

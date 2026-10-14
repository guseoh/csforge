# metadata-compatibility 정식 checkpoint

2026-10-14. 7C/39Q의 전체 본문·정답·모든 보기/rationale·모델·해설·난도·Concept 연결을 직접 읽고 [46개 근거/hash](topics/java--metadata-compatibility.json)에 기록했다. Concept KEEP6/보강1, Question KEEP36/보강3. 새 P0 0/P1 0/P2 2그룹이다.

W4-JMETA-001 P2: annotation-processing-vs-reflection.q2 C의 일반 주석 “보존 정책”, serialization-contract-risk.q2 B/전체 해설의 UID “클래스 파일 버전”, jpms-classpath-modulepath.q3 A의 classpath 항목 “디스크립터 없음” 표현을 최소 교정한다. 일반 주석과 애너테이션 Retention, 직렬화 class descriptor의 UID와 JVMS 파일 버전, descriptor 파일 존재와 classpath/modulepath 해석을 구분한다. 정답D/D/A와 본문 핵심은 유지한다.

W4-JMETA-002 P2: serialization-contract-risk의 Woowa 훑어보기편은 실제 입문·장점·사용처를 설명하고 단점은 다음 포스팅에 위임한다. 현재 relationNote의 장기 데이터 계약·운영 위험 보충 목적은 지원이 부족하다. #201/#222에서 관계 한 곳의 목적을 입문으로 좁히거나 실제 위험·진화를 설명하는 자료로 교체한다. 정확한 공식 근거를 사용하는 canonical 본문은 재작성하지 않는다.

15 Reference 관계를 독립적으로 관련 절과 대조했다. 새 미확정은 없으며 CURRENT_VERIFIED에는 관련성 문제를 실제 확인한 Woowa 관계도 포함된다. 관계 검토 완료와 Reference 무결점을 분리한다. `Class`의 declared에는 bridge/synthetic이 포함될 수 있고, 접근 준비 setAccessible의 InaccessibleObjectException과 invoke의 IllegalAccessException을 구분했다. reflection.q6 “호출하려다”는 준비 단계 거부까지 포함한 흐름으로 성립하며 invoke 자체의 직접 예외라고 승인하지 않는다. 선언 클래스·중복 interface·checked exception·자기 호출의 JDK Proxy 보장을 Spring 전체 보장으로 확대하지 않았다.

dynamic-proxy-flow SVG 전체 소스·좌표·라벨/반환 흐름을 확인했다. NONE/TEXT 계약은 기존 표·코드·단계 흐름과 대조했으며 Reader render/mobile/theme·모든 snippet 실행은 미수행이다.

누적 회귀18개/hash/인용/checkpoint/generate/--check errors/drift0을 검증했다. Java16/18Topic·114/145C·653/841Q, 전체690/721C·2337/2525Q의 전수 읽기 근거다. 앞선 streams 품질 미확정3Q는 보존한다. concurrency19C/113Q와 jvm-runtime12C/75Q, 총2Topic/31C/188Q를 계속 검토한다. Java 전체 완료가 아니다.

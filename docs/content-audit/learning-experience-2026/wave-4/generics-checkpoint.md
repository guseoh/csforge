# generics 정식 checkpoint

2026-10-14. 6 Concept / 37 Question(MC32·서술4·시나리오1)의 본문과 모든 실제 문항 필드를 직접 읽었다. [개별 수기 근거·hash](topics/java--generics.json), [11 Reference 관계](reference-relations.json), PECS SVG 전체 소스의 의미와 좌표를 확인했다. Concept KEEP5/보강1, Question KEEP35/보강2다. 기존 Quality PASS를 복사해 판정하지 않았다.

신규 P0 0/P1 1/P2 1그룹이다. W4-JGEN-001 P1: type-erasure-reifiable-types의 newArray 예시는 int.class도 Class<Integer>로 받을 수 있지만 reflection의 int[]를 generic T[]로 캐스팅하면 실패한다. 참조타입 토큰 전제와 primitive/boxed Class 차이만 최소 보강한다. W4-JGEN-002 P2: generic-invariance.q4 B와 wildcards-pecs.q3 B의 오답 rationale이 Double/Integer 반례를 뒤바꿨다. 정답·난도·본문을 유지하고 두 feedback만 교정한다. 후속 #201 범위이며 이번 감사에서 canonical 교정은 하지 않았다.

JLS4.5/4.10/4.5.1/4.8/5.1.9/4.6/4.7/4.12.2/8.4.4/9.6.4.7 및 SafeVarargs API의 관련 절을 관계별로 읽어 대조했다. JLS15.8.2와 Array.newInstance API는 별도 보조 근거로 확인했으며 다른 Concept의 canonical Reference 상태로 전파하지 않았다. 기존 D2 미확정2관계는 그대로다.

Temurin25.0.4.1 제한 probe에서 String.class→String[], int.class→reflection int[] 및 generic helper의 CCE를 실행 확인했다. 이 한 경계 외 37Q·전체 예시 실행을 주장하지 않는다. Object를 피연산자로 명시한 instanceof 문제와 Java16 이후 다른 정적 타입의 검사 가능성을 구별했다. erasure를 소스 검사 부재나 선언 metadata 전부 소멸로 일반화하지 않는다. PECS 도식의 producer 읽기/consumer 쓰기 방향은 본문과 맞으며 실제 Reader render/mobile/theme QA는 미완료다.

회귀17개·checkpoint(hash/인용/개별 근거)·generate/--check errors/drift0을 확인했다. 누적 Java8/18 Topic·59/145C·328/841Q, 전체124/134 Topic·635/721C·2012/2525Q다. 근거 NEEDS_REVIEW84C/500Q와 partial2C/13Q는 별도다. Reference105관계 중103검토/2미확정. 다음 exceptions-resources8C/46Q부터 잔여10Topic/86C/513Q를 이어간다. Java 전체 완료가 아니다.

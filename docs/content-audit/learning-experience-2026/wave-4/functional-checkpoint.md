# functional 정식 checkpoint

2026-10-14. 5 Concept/33 Question(MC28·서술3·시나리오2)의 전체 본문과 모든 실제 문항 필드를 직접 읽고 [38개 수기 근거/hash](topics/java--functional.json)에 기록했다. Concept KEEP5/보강0, Question KEEP31/보강2다. 이전 PASS만으로 현재 판정을 생성하지 않았다.

새 P0 0/P1 0/P2 1그룹(W4-JFUN-001)이다. behavior-parameterization.q3 D의 오답 rationale은 무인자 부수효과를 Runnable/Consumer로 함께 묶지만 Consumer는 입력T 하나를 받는다. method-reference-functional-composition.q1 D는 String이 타입 이름이라 람다 매개변수가 될 수 없다고 설명하지만 대문자 String 식별자는 유효한 매개변수 이름이다. 표준 String.trim의 instance 호출과 미제시 trim(String) helper를 구별하는 이유로 반박해야 한다. #201에서 두 feedback만 최소 교정하고 정답C·본문·난도를 유지한다.

JLS9.8의 단일 논리 SAM/Object 예외,15.27의 대상 문맥·캡처·검사 예외,15.13의 bound/unbound/static/constructor 참조 및 java.util.function/Predicate 관련 절을 Reference8관계별로 대조했다. 같은 package URL의 두 Concept는 각 학습 역할을 따로 확인했다. D2 람다/invokedynamic 기사 본문은 shell만 노출되어1관계 NEEDS_REVIEW다. 구현 방식 invokedynamic를 언어의 일반 보장으로 확대하지 않는다. 기존 미확정3관계도 유지한다.

제한 Java probe에서 명시 trim helper를 추가한 `String -> trim(String)`과 입력을 받는 Consumer.accept를 실행 확인했다. 이 helper가 원문에 존재하거나 문항D가 정답이라는 주장은 아니다. 33Q/전체 overload 실행을 주장하지 않는다. 본문은 SAM·정책·target·capture·합성 순서로 충분하며 TEXT 캡처 도식도 참조 고정과 객체 변경을 구별한다. SVG가 없다는 사실만으로 결함을 만들지 않았다. Reader render/mobile/theme QA는 별도다.

Java10/18Topic·72/145C·407/841Q, 전체126/134Topic·648/721C·2091/2525Q로 집계한다. 근거 NEEDS_REVIEW71C/421Q와 partial2C/13Q는 별도다. 다음 streams7C/41Q부터 잔여8Topic/73C/434Q를 계속 진행한다. Java 전체 감사 완료가 아니다. 검증 결과는 validation.md와 생성 progress/summary를 따른다.

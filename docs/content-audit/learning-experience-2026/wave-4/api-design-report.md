# Wave 4 api-design — 전수 의미 검토

2026-10-14, 기준선 `efe73a15da14c996bd08344181d4d6f87073803d`, 이전 감사 HEAD `81484fb00c172b5fa7e109e2aa3d914dba28b4c8`. [최신 실행 댓글](https://github.com/guseoh/csforge/issues/200#issuecomment-6161130016)에 따라 Reference 관계 격리를 먼저 수정하고 이 Topic만 추가했다.

| Concept | 연결 Q 전수 검토 | 품질 | 실제 판단 |
| --- | ---: | --- | --- |
| static-factory-method | 7 | TARGETED_ENHANCE | 본문/문항은 정확하다. 연결 출처의 static 누락만 P0로 분리한다. |
| builder-pattern-construction | 4 | TARGETED_ENHANCE | 중간/완성 상태·검증·복사는 충분하다. 호출 예시와 구현 연결만 P2 보강한다. |
| dependency-injection-construction | 6 | KEEP | plain Java 사용/조립 경계, fake, final과 객체 수명을 정확히 구별한다. |
| minimize-accessibility-api-surface | 4 | KEEP | 필요한 책임 공개와 이미 배포된 반환 타입·소유권 계약을 구별한다. |
| method-contract-parameter-validation | 7 | KEEP | 입력/객체 상태/조합 조건, 변경 뒤 실패와 rollback 경계를 충분히 설명한다. |

5C 모두 CURRENT_VERIFIED, KEEP3/보강2. MC25/DESCRIPTIVE2/SCENARIO1의 **28Q 모두 직접 검토·KEEP**이다. 모든 선택지와 각 rationale, 정답·modelAnswer·explanation·모호성·난도·중복 목표·Concept 연결을 읽었다. acceptedAnswers는 이 Topic에 없다. 자동화나 과거 PASS로 판정하지 않았다. [개별 33개 수기 근거와 source hash](topics/java--api-design.json)를 사용한다. 검토 완료와 교정 완료는 다르다.

## 새 발견과 최소 후속 범위

**P0 1 / P1 0 / P2 1 그룹**, REWRITE_REQUIRED/항목 품질 NEEDS_REVIEW0이다. 기존 두 Topic의 발견은 변경하지 않았다.

- **W4-JAPI-001 P0**, `java.core.api-design.static-factory-method`: 연결 Tecoble 글은 캐시 LottoNumber의 정적 팩터리를 설명하지만 선언은 `public LottoNumber of(int number)`로 static이 없다. 이 선언은 instance method이고 클래스 이름으로 호출할 수 없다. [JLS8.4.3.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.3.2), [JLS15.12.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.3) 및 제한 컴파일로 대조했다. 정확한 canonical 설명/7Q는 유지하고 **출처1관계 교체 또는 오류 한정 relationNote**만 #201/#222에서 조정한다.
- **W4-JAPI-002 P2**, `java.core.api-design.builder-pattern-construction`: 첫 호출의 `.includeClosed(true)`가 뒤의 같은 이름 SearchOption 구현에는 없다. 두 예시를 연결하면 method-not-found가 난다. **호출 한 줄 제거 또는 축약 구현임을 한 문장 명시**하는1C 보강만 권장한다. 검증·복사·생성 경계 설명 및4Q는 유지하며 P2로 이전 전체 PASS를 취소하지 않는다.

정확한 canonical 경로·인용·외부 원문 위치·공식 근거·최소 수정은 [findings.md](findings.md)의 W4-JAPI 항목에서 추적한다. 본문/Question/Reference를 이번에 교정하지 않았다.

## Reference·도식·코드 대조의 범위

canonical **9 Reference 관계/9 URL**을 개별 대조했다. JLS8 class method/constructor, JLS15.9 constructor 선택·인자 전달, JLS6.6 접근 규칙, Objects.requireNonNull, Lombok Builder의 생성 요소/Default/Singular, JPA3.2 §2.1 provider no-arg와 application constructor를 학습 목적에 대응시켰다. JPA/Spring 생성 계약을 plain Java 언어 보장으로 설명하지 않는다.

Tecoble factory 글의 명명·캐시·하위 반환은 관련성이 있지만 위 선언 오류는 별도다. DI 글의 BurgerChef/Owner 외부 선택 예시는 유용하다. 그 글의 Toby interface-only 인용은 한정된 정의이며 plain Java DI 필수 조건으로 승인하지 않는다. snippet 오타/생략을 전부 컴파일했다고 주장하지 않는다. Oracle constructor tutorial은 JDK8 입문 자료이며 Java25의 새 문법/프레임워크 수명 명세가 아니다.

[Reference 관계 sidecar](reference-relations.json)의 해당9행과 보조3행은 직접 관련 절을 읽은 근거다. Integer.valueOf100의 필수 cache, Builder.tags의 List.copyOf shallow 구조, reserve의 JLS14.1/상태 추론은 **사용한 Concept에만** 귀속한다. CURRENT_VERIFIED는 의미 대조 완료이며 잘못된 factory 출처를 PASS로 숨기지 않는다.

NONE4/TEXT1 계약이며 실제 본문 이미지/SVG 참조는0이다. Builder→검증/복사→결과 상태 흐름, 조립 코드→서비스의 책임 흐름, 생성 방식 표, reserve 전후 코드의 학습 효과를 검토했다. 기존 텍스트/코드가 목적에 충분하며 이미지 부재만으로 결함을 만들지 않는다. Reader/mobile/theme/human QA는 미완료다.

[제한 컴파일 probe](probes/check-api-design.py)를 Temurin javac25.0.4.1에서 실제 실행했다. 본문 SearchOption 구현/첫 호출을 발췌하고 Objects import만 보충한 대조는 includeClosed 오류, 그 한 호출 제거는 성공이었다. 외부 글의 missing static 선언을 최소 재구성한 클래스 호출은 non-static 오류였다. 임시 디렉터리 권한 제한은 승인된 sandbox 밖의 제한 실행으로 해결했다. 코드/명령/환경/stdout/hash는 ledger에 있다. 전체33항목 코드 실행·성능·제품 빌드 완료가 아니다.

PR #178의 기존 근거를 존중하고 그 head와 현재 api-design canonical Git 차이0을 확인했다. KEEP3C/28Q는 이번 직접 검토 근거로 결정했다. 다음은 `java.core.object-contracts` 5C/31Q이며 이번에 검토하지 않았다. Wave4/Java/Issue200 전체 감사 완료가 아니다.

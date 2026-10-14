# Wave 4 / object-model 의미 검토

2026-10-14, 기준선 `efe73a15da14c996bd08344181d4d6f87073803d`. 기존 감사 HEAD `393d098c1e3f16ccc80a5fc9fdf2c6848a1fd98b`에서 [최신 실행 댓글](https://github.com/guseoh/csforge/issues/200#issuecomment-6159815782)에 따라 `java.core.object-model`만 추가했다.

| 대상 | 직접 전수 검토 | KEEP | TARGETED_ENHANCE | REWRITE_REQUIRED / 품질 NEEDS_REVIEW |
| --- | ---: | ---: | ---: | ---: |
| Concept | 12 | 10 | 2 | 0 / 0 |
| Question | 68 | 65 | 3 | 0 / 0 |

MC62 / DESCRIPTIVE3 / SCENARIO3의 모든 필드·정답·각 보기/rationale·모범 답안·해설·모호성·난도·중복 목표·Concept 연결을 읽었다. 현재 Topic에 acceptedAnswers는 없으며 없는 필드를 확인했다고 주장하지 않는다. 뒤에 추가된 encapsulation q7, abstraction q5, inheritance q5, composition q7, interface q5, defensive-copy q7도 포함한다. Concept는 학습 목표/Level/깊이·정확성/코드/내부 상태/가독성/경계·도식·Reference·문항 coverage의 5축, Question은 2축으로 [80개 개별 수기 근거](topics/java--object-model.json)를 기록하고 원문 hash를 고정했다. CURRENT_VERIFIED는 읽고 평가했다는 뜻이며 무결점 또는 교정 완료가 아니다.

## 실제 새 발견

**P0 1 / P1 1 / P2 1 그룹**이며 기존 발견의 중복 계승은 없다. 자세한 contentKey·원문 인용·line·파일 hash·근거·최소 수정은 [누적 findings](findings.md)의 `W4-JOM-*`에 있다.

- **W4-JOM-003 P0, class-object-constructor의 Reference**: Tecoble의 연결 글은 `private int score` 예시 뒤 미대입 필드를 null/NPE로 설명한다. JLS4.12.5의 int 기본값은 0이다. URL 부재나 canonical 본문 오류가 아니라 실제 읽은 연결 학습 자료의 기술 오류다. 본문/문항은 유지하고 출처 교체 또는 오류를 명확히 한정하는 관계 설명만 권장한다.
- **W4-JOM-001 P1, initialization-order-constructor-chaining 본문**: 생성 중 Child.print에서 name이 어떤 값인지 “기대와 다른 상태”로만 표현한다. default null → Parent 생성자의 Child.print → Child initializer kim의 구체 상태·실행 순서와 일반 필드/블록의 소스 순서가 필요하다. Java25 prologue의 직접 field write와 일반 initializer를 별도 단계로 보여 주되 기존 q2/q4의 정확한 보정은 유지한다.
- **W4-JOM-002 P2, 초기화 q3·상속 q2·다형성 q6의 오답 feedback**: PCI에 P-before-I를 설명하거나 AA에 첫 A만 설명하면 해당 오답의 틀린 부분을 반박하지 못한다. protected/public 보기의 해설도 private 비교로 바뀌어 있다. 각각 I-before-C / 접근 폭과 invariant 보호 구분 / B.label의 둘째 B만 설명하도록 보강한다. 정답·전체 설명은 모두 맞고 P2가 전체 PASS를 취소하지 않는다.

[#201](https://github.com/guseoh/csforge/issues/201)에 **초기화 본문1C/문항3Q** 및 정확한 본문을 유지한 생성자 Reference **1C**의 최소 범위를 권장한다. [#222](https://github.com/guseoh/csforge/issues/222)와 생성자 출처 오류 **1관계**의 교체/한정을 조정한다. 동일 대상의 중복 구현을 권고하지 않으며 이번 실행은 감사만 수행했다.

## 공식 문서·실행·Reference

JLS25의 생성자/기본 생성자, static incarnation, 초기화 7단계/early construction, private/protected, subtype/override/hiding/signature, overload의 most-specific 및 실제 객체 dispatch, checked cast/instanceof binding, interface 역할·메서드·필드 규칙을 관련 절에서 대조했다. JDK API의 List.copyOf / unmodifiableList / Date.setTime도 실제 문항의 소유권 경계와 비교했다. 모든 명세 전문·모든 예제를 검증한 것은 아니다. Java 객체 초기화와 Spring Bean 생명주기를 구별하고 HotSpot/vtable/JIT 배치를 언어 보장으로 쓰지 않는다.

canonical **Reference24관계/19 URL** 모두 접근해 관련 의미를 대조했다. CURRENT_VERIFIED24는 무결점 출처24를 뜻하지 않는다. 생성자 자료의 확정 P0 오류1관계는 `qualityIssueIds`로 별도 표시하고 [reference-issues.json](reference-issues.json)에 포함한다. 첫 Topic의 D2 미확정1관계는 그대로 남는다.

다른 한국어 자료는 실제 사용한 관련 절의 역할과 한계를 적었다. getter 글의 메시지/컬렉션 경계만 참고하고 미완성 snippet의 전체 compile PASS를 주장하지 않는다. instanceof 글의 Piece 책임 이동은 관련성이 있지만 단발 nanoTime 비교는 일반 성능 보장이 아니다. 불변 객체 글의 입력/반환 소유권 예시는 유용하되 toString 출력은 물리 주소가 아니다. Oracle object tutorial은 JDK8 입문 자료이며 Java25의 새 문법 규범으로 승격하지 않는다. 이 한계를 무차별 Reference 교체나 본문 재작성 이유로 사용하지 않는다.

[ObjectModelProbe.java](probes/ObjectModelProbe.java)를 실제 Temurin25.0.4.1+1-LTS에서 실행했다. `ordinary=null` 뒤 `ordinary=kim`, Java25 prologue 직접 대입의 `early=ready`, 미대입 int의 `omittedIntScore=0`을 관찰했다. 코드/명령/환경/stdout/hash는 Topic ledger에 있다. 제한된 쟁점의 실행이며 모든68문항/본문코드 실행이나 성능 측정으로 보고하지 않는다.

## 도식과 이전 PR 근거

이번 Topic의 본문 이미지 참조/SVG는0이다. 생성 흐름, static/instance 비교, is-a/has-a, compile/runtime dispatch, cast 성공/실패, 공유/복사 객체 그래프의 실제 ASCII·코드·표를 읽었다. DIAGRAM인 composition과 defensive-copy도 책임 화살표와 소유권 그래프가 설명에 충분하므로 이미지 부재 결함을 만들지 않는다. 초기화 보강은 새 그림 없이 default 값/prologue/parent/field·block/epilogue의 작은 상태 표면 충분하다. Reader render/mobile/theme/human QA는 미완료다.

PR #178의 이전 본문·review 근거를 보존했다. 해당 head `e94902dfe7154ef054f0c591e5ab49d4cca81fac`와 현재 object-model canonical 파일을 Git으로 비교해 변경0을 확인했다. Java25 q2/q4의 prologue 허용·일반 initializer 순서 구분은 이미 해결된 내용이므로 새 결함으로 재분류하지 않는다. 과거 PASS는 PRIOR_REVIEWED이며 이번 KEEP은 직접 읽은 근거로 결정했다.

검증과 누적 결과는 [현재 Wave4 인덱스](README.md) 및 [validation.md](validation.md)를 따른다. 다음 Topic은 api-design이며 이번에 의미 검토하지 않았다. Java/Wave4/Issue200 전체 완료가 아니다.

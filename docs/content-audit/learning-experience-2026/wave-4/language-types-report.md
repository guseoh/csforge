# Wave 4 / J-A — language-types Topic checkpoint

2026-10-14(Asia/Seoul). 기준선 `origin/main`은 `efe73a15da14c996bd08344181d4d6f87073803d`, 작업 시작 감사 HEAD는 `0b092dad5d6222e1e38c9f51b707d3bdf446e977`이다. [Issue #200 실행 계약](https://github.com/guseoh/csforge/issues/200)의 첫 Topic **java.core.language-types 10 Concept / 55 Question**만 직접 전수 검토했다. 다른 Java Topic을 이번 완료 범위에 포함하지 않는다.

| 항목 | CURRENT_VERIFIED | KEEP | TARGETED_ENHANCE | REWRITE_REQUIRED | 품질 NEEDS_REVIEW |
| --- | ---: | ---: | ---: | ---: | ---: |
| Concept | 10 | 6 | 4 | 0 | 0 |
| Question | 55 | 51 | 4 | 0 | 0 |

새 발견 **4그룹(P0 2 / P1 2 / P2 0)**과 기존 **LEX-002 P2 1그룹**을 분리한다. 보강 4C/4Q에는 기존 값 전달 SVG 대상 Concept 1개가 포함된다. CURRENT_VERIFIED는 본문·문항을 읽고 판단 근거를 확보했다는 의미이며, 오류 없음이나 콘텐츠 교정 완료를 뜻하지 않는다. 미확정 Reference는 별도 기록한다.

## 개별 의미 근거와 이전 품질 근거

[Topic ledger](topics/java--language-types.json)에 Concept별 목표/Level·깊이, 정확성/내부 동작/코드/가독성/경계, 도식, Reference, 연결 문항 coverage의 5축과 Question별 정답·보기·각 rationale·모범 답안·설명, 모호성/난도/중복 목표의 2축을 수기로 기록했다. MC **53**, SCENARIO **1**, DESCRIPTIVE **1**을 모두 읽었다. 현재 Topic에 acceptedAnswers 필드는 없으며, 없는 필드를 검토 완료로 꾸미지 않았다. 마지막 추가 문항 numeric q5와 boxing q7도 포함한다. 65개 contentKey별 source hash, Java Curriculum/Topic catalog hash, 4개 SVG hash를 고정했다.

[PR #178](https://github.com/guseoh/csforge/pull/178)의 본문과 4개 review submission, inline thread 없음, 최종 head `e94902dfe7154ef054f0c591e5ab49d4cca81fac` 및 merge `5e1b3328af8844e7a22e8d440cd75b80a0ad740d`를 확인했다. Git의 이전 base/head Question object로 variables q3의 수정 방안 질문 D에서 실패 원인 질문 A로 바뀐 근거, primitive q1 D의 한국어 설명을 대조했다. 현재의 작은 상수 박싱 동일성 보장, 리터럴 intern 보장, 값 전달 직접 JLS §15.12.4.5 출처를 유지한다. 과거 승인/수정 근거는 PRIOR_REVIEWED로 보존하며 자동 KEEP 근거로 사용하지 않는다. 기존 pass-by-value 1C/6Q의 부분 검토는 inventory의 priorSampleReview와 review-notes.json에 남는다.

## 실제 발견과 최소 후속 범위

정확한 key·경로·원문 인용·line·파일 hash·공식 근거·권장 수정은 [findings.md](findings.md)와 [findings.json](findings.json)에 있다.

| 발견 | 심각도 | 대상 | 최소 변경 |
| --- | --- | --- | --- |
| W4-JA-001 | P0 | numeric-conversion-overflow C, q1/q4 | 비상수 변수 대입 전제를 명시하고 final 상수 변수의 범위 내 암시 축소 예외를 설명. int 승격·현재 q4 정답은 유지 |
| W4-JA-002 | P1 | boxing-unboxing-wrapper.q6 | total을 int로 선언하고 values 타입을 제시. String +=에서는 null이 문자열로 연결돼 언박싱 결론이 성립하지 않음 |
| W4-JA-003 | P0 | string-immutability-equality C | kim.toUpperCase()의 기본 Locale 의존 출력을 Locale.ROOT 또는 Locale 무관 문자열로 한정. 불변성 모델과 q6 ab→AB는 유지 |
| W4-JA-004 | P1 | string-pool-interning C, q4 | 단순 동일성 비보장에서 false를 도출하지 말고 비상수 +는 새 String을 만든다는 JLS 계약을 명시. 정답 C 유지 |
| LEX-002 계승 | P2 | pass-by-value C / 기존 SVG | caller→A 화살표가 parameter box를 관통하는 경로만 우회. 새 이미지나 본문 재작성 불필요 |

[#201](https://github.com/guseoh/csforge/issues/201)에 **새 3C/4Q + 기존 값 전달 SVG 1C**의 최소 델타를 권장한다. [#222](https://github.com/guseoh/csforge/issues/222)는 D2의 본문 접근/Reference 역할 재확인 1관계를 조정한다. 이번 감사에서 후속 구현·새 Issue 생성은 하지 않았다.

## 공식 근거, 실행 및 Reference 한계

JLS25의 타입/변수/초기값, definite assignment, widening/narrowing/boxing/unboxing, 호출 매개변수, 배열 store, final, String equality/literal/concat을 관련 절로 대조했다. JDK25 API의 String.intern/toUpperCase, StringBuilder snapshot/동기화 경계, Map.get/getOrDefault, Objects.requireNonNullElse, Math.toIntExact, List.copyOf를 확인했다. JVMS2.7의 객체 내부 표현 미강제도 참조 그림의 경계 근거로 확인했다. 문서 전문과 모든 anchor를 검증했다는 의미는 아니다.

canonical Reference **20관계 / 18 URL** 중 관련 의미 **19관계 CURRENT_VERIFIED / D2 1관계 NEEDS_REVIEW**다. D2 직접 응답은 shell만 노출되어 본문·학습 가치를 확인하지 못했다. dead link나 GC 기술 오류로 단정하지 않으며 primary JLS 근거와 기존 PR의 GC 보조 역할을 구별한다. 보조 공식 API는 ledger의 supplementalSources에 따로 기록했고 canonical Reference를 추가하지 않았다. 다른 Topic이 공유하는 같은 URL을 이번 검토로 자동 승격하지 않는다.

[LanguageTypesProbe.java](probes/LanguageTypesProbe.java)를 Temurin OpenJDK **25.0.4.1+1-LTS**에서 실제 source-file launch로 실행했다. `implicitNarrowing=42:3`, String total+null은 문자열 `null`, int total+null은 NPE, 기본 tr-TR의 kim 대문자 code points `[75,304,77]`과 ROOT의 KIM, 비상수/상수 문자열 연결 동일성 `false:true`를 관찰했다. stdout·명령·환경·코드 hash는 ledger의 probeEvidence에 있다. 이 실행은 네 쟁점의 반례/보조 대조이며, 전체 예제/문항 실행·성능 측정·언어 보장 전체의 런타임 증명을 주장하지 않는다.

## 기존 도식과 인벤토리 정정

values-and-references / pass-by-value / array-covariance / stringbuilder-mutable-text **4 SVG의 전체 소스·라벨·좌표·방향·본문 연결**을 읽었다. 적절한 그림은 유지한다. 값 전달 경로의 기존 P2만 계승하고 TEXT/NONE Concept에 그림 부재로 결함을 만들지 않는다. Reader 렌더링·mobile/theme·human learning QA는 이번에 실행하지 않았다.

배열 Concept의 `![Object[] ... String[] ...](...)`은 원래 본문에 있었다. 기존 이미지 파서가 ALT 내부 대괄호를 처리하지 못해 미연결로 잘못 집계했다. 파서를 최소 수정한 현재 구조 인벤토리는 **Java27/OS33, 60/60 SVG 연결**이다. 이는 콘텐츠/자산 수정이 아닌 감사 오류 정정이다. 과거 Wave 3 및 Issue 실행 계약의 26 Java 연결/array-covariance 미연결 기록은 당시 snapshot으로 보존하며 새 후보로 재사용하지 않는다.

## 누적 진행률과 다음 범위

전수 완료 **14 Area**, 부분 완료 Java **1 Area**, 완료 Topic **117/134**. Concept **586/721(81.28%)**, Question **1,739/2,525(68.87%)**다. 남은 Java 전수 범위는 **17 Topic / 135C / 786Q**이며 그중 기존 partial은 3C/19Q다. 새 개별 근거 NEEDS_REVIEW는 **132C/767Q**, 품질 미확정은 **134C/767Q**다. 부분 검토만 있는 Concept 2개 때문에 근거와 품질 수가 다르다.

J-A는 **1/6 Topic, 10/44C, 55/240Q**이며 다음 Topic은 **java.core.object-model 12C/68Q**다. 다음 범위의 의미 검토는 수행하지 않았다. Wave 4 전체 또는 Issue #200 전체 감사 완료로 선언하지 않는다. ChatGPT의 최종 콘텐츠 품질 검토 후 다음 단계에 활용한다.

## 재실행과 검증

기존 도구를 재사용한다. read-topic.py는 원문 출력만, checkpoint-topic.py는 이미 작성한 판정의 coverage/hash/인용만 확인한다. Wave 4 loader는 현재 승인된 language-types checkpoint 한 개만 허용한다. 추후 Topic 확장 시 전수 검토 후 명시적 coverage 계약을 늘려야 하며 미검토 내용을 자동 채우지 않는다.

```powershell
python docs/content-audit/learning-experience-2026/wave-3/checkpoint-topic.py docs/content-audit/learning-experience-2026/wave-4/topics/java--language-types.json
python docs/content-audit/learning-experience-2026/audit.py
python docs/content-audit/learning-experience-2026/audit.py --check
java docs/content-audit/learning-experience-2026/wave-4/probes/LanguageTypesProbe.java
git diff --check
```

검증 결과는 [validation.md](validation.md), 최신 집계는 [summary.json](summary.json)이다. Wave 1~3의 ledger·발견·summary를 불변으로 보존하며 canonical/Curriculum/SVG/DB/Frontend/Backend는 변경하지 않는다.

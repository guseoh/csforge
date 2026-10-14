# streams 정식 checkpoint

2026-10-14. 7C/41Q(MC38·단답1·서술1·시나리오1)의 본문과 모든 실제 문항 필드를 직접 읽어 [48개 수기 근거/hash](topics/java--streams.json)에 기록했다. Concept KEEP6/보강1, Question KEEP36/보강2/품질 NEEDS_REVIEW3다. CURRENT_VERIFIED는 현재 원문 전수 읽기와 근거 대조의 범위이며, 이3문항의 기술적 적용 범위를 확정하거나 PASS한 뜻이 아니다.

새 확정 발견 P0 0/P1 0/P2 2그룹이다. W4-JSTR-001: toMap의 second/newOrder는 입력에서 나중에 만난 값이며 시간상 최신값을 보장하지 않는다. 기존 마지막 문단의 시각 비교 필요를 코드·latestByUser 이름과 연결하는 전제만 보강한다. W4-JSTR-002: stream-pipeline-laziness.q6 A는 map을 묻는데 해설은 filter를 반박하고, stream-map-filter-flatmap.q3 C의 filter(List::isEmpty)는 빈 List만 남기는데 반대로 설명한다. #201에서 해당 전제와 두 오답 feedback만 최소 교정하며 본문 모델·정답은 유지한다.

추가 검토3Q는 stream-pipeline-laziness.q2, stream-reduce.q3/q5다. 제한 Temurin25 실행에서는 peek+forEach 출력|12와 뺄셈 순차 축약-6을 관찰했다. 그러나 peek 중간 부수 효과의 생략 규칙과 terminal forEach 동작 보장 적용 범위, identity/associativity를 위반한 reduce의 교육용 leftfold 모델과 일반 API 결과 보장 사이의 한정을 현재 근거만으로 확정하지 않았다. ledger의 unresolvedReviewCases에 원문 인용·공식 근거·확인 이유·최소 대안을 각각 기록했다. 과거 Quality PASS를 무조건 취소하거나 추측으로 P0/P1 결함을 확정하지 않는다. ChatGPT 최종 검토에서 적용 범위를 확인한 뒤 필요한 경우 #201의 최소 교정 범위로 확정한다.

Reference9관계에서 Stream의 lazy/filter/map/flatMap/reduce/1회소비, Collectors grouping/partition/toMap, package의 비간섭·상태 비의존·병렬 축약과 BaseStream.parallel 관련 절을 개별 대조했다. forEachOrdered는 terminal 동작 간 one-at-time/happens-before를 보장하지만 원본·다른 writer·전체 파이프라인의 공유 상태까지 보편 안전하게 만들지는 않는다. pool/worker 숫자는 구현과 환경 요소로 구별한다. D2의 같은 URL도 이 Concept의 역할을 별도로 평가해 본문 미확정1관계를 유지했다. 누적 Reference134관계/112URL 중129관련 의미 확인/5미확정이다.

stream-pipeline.svg 전체 소스·좌표·terminal 평가 요구 라벨을 확인했다. 새 Reader render/mobile/theme QA는 없다. 제한 probe는4개 경계만 실행했으며 모든41Q·병렬 성능·외부 부수 효과를 검증한 것은 아니다. 불확실3Q를 실행 관찰만으로 KEEP 승격하지 않는다.

회귀18개(미확정 판정 보존/잘못된 원문 인용·자동KEEP 거절 포함)·checkpoint의 hash/인용·generate/--check errors/drift0을 확인했다. Java11/18Topic·79/145C·448/841Q를 직접 읽었고 전체127/134Topic·655/721C·2132/2525Q의 전수 읽기 근거가 있다. 전체 근거 NEEDS_REVIEW64C/380Q와 partial2C/13Q는 별도다. **품질 NEEDS_REVIEW는383Q로 직접 읽은 미확정3Q를 포함한다.** 다음 modern-language8C/43Q부터 잔여7Topic/66C/393Q를 이어간다. Java 전체 감사 완료가 아니다.

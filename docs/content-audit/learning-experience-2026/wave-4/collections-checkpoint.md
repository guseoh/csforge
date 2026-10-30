# collections 정식 checkpoint

2026-10-14. 9 Concept와 51 Question의 본문, 정답·모든 선택지·rationale·서술 답안·해설·난도·연결을 직접 읽었다. [60개 개별 근거와 hash](topics/java--collections.json), [19 Reference 관계](reference-relations.json), SVG 3개 전체 소스의 의미·좌표를 확인했다. Concept KEEP6/보강3, Question KEEP50/보강1이며 불확실한 항목을 자동 KEEP 처리하지 않았다.

새 발견은 P0 1/P1 1/P2 2그룹이다. W4-JCOL-001은 HashMap 조회 도식이 key 일치 시 교체한다고 설명하는 오류다. W4-JCOL-004는 immutable-unmodifiable-collections.q6의 copyOf 정답에 필요한 null 없는 입력 전제 누락이다. P2는 ArrayList/LinkedList 도식의 48px 요소 겹침과 HashMap 생성자·PriorityQueue 타입을 연결해 읽을 때 생기는 예시 문맥 문제다. 정확한 key·인용·최소 수정은 [findings](findings.md)를 따른다. #201에는 이 도식·예시·문항만 최소 교정하도록 권장하며 canonical 수정은 수행하지 않았다.

공식 JDK API의 관련 계약을 18개 관계별로 확인했다. HashMap의 D2 Reference 한 관계는 응답 shell에 기사 본문이 없어 NEEDS_REVIEW로 유지한다. 같은 URL의 다른 Concept 검토를 전파하지 않았다. TreeSet의 비교 일관성, HashMap 내부 구현과 공개 계약, best-effort fail-fast, shallow copy와 backed view를 구별했다. 기존 설명과 정답이 정확한 부분은 유지한다.

Temurin Java25.0.4.1 제한 probe는 null 요소의 List.copyOf가 NPE를 던지는 것과 HashMap.get이 mapping을 교체하지 않는 것만 실행 확인했다. SVG 소스 의미·geometry 검토는 실제 Reader 렌더링·모바일·테마 QA와 구별한다. 51문항의 전수 실행이나 예시 전체 컴파일을 주장하지 않는다.

누적 Java7/18 Topic·53/145C·291/841Q, 전체123/134 Topic·629/721C·1,975/2,525Q다. 근거 NEEDS_REVIEW90C/537Q와 partial2C/13Q는 별도다. Wave4 Reference94관계 중92검토/2미확정이다. 다음은 generics6C/37Q이며 나머지11Topic/92C/550Q를 계속 검토한다. 최신 수량은 [생성 진행률](progress.md)을 따른다.

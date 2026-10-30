# exceptions-resources 정식 checkpoint

2026-10-14. 8C/46Q의 전체 본문과 정답·모든 선택지/rationale·모범 답안·해설·모호성·난도·중복 목표·연결을 직접 읽고 [54개 수기 근거/hash](topics/java--exceptions-resources.json)에 기록했다. Concept KEEP6/보강2, Question KEEP46/보강0. 정답 오류가 없는 문항은 이전 PASS 복사 없이 현재 읽은 근거로 유지한다.

새 P0 0/P1 1/P2 1그룹이다. W4-JEX-001 P1은 failure-atomicity의 임시 ArrayList가 Item 참조를 공유하는 복사 범위를 설명하지 않는 문제다. 구조만 수정하거나 불변 원소라는 전제에서는 타당하지만 가변 원소를 바꾼 뒤 실패하면 원본 상태가 변할 수 있다. W4-JEX-002 P2는 exception-as-control-flow의 Map.get==null 부재 처리에 null 값 정책 전제가 빠진 문제다. #201에서는 두 코드 예시의 전제·복사 범위만 최소 보강하며 기존 예외/DB/Spring 책임 모델과 정답은 유지한다.

12 Reference 관계를 개별 확인했다. JLS11의 계층·checked 계약·동적 처리기/전파, JLS14.20.3의 획득·역순 정리·주/억제 예외, Throwable 생성자/getSuppressed 및 표준 예외·AutoCloseable API의 관련 절을 직접 대조했다. D2 NIO.2 기사 응답은21행 shell이라 본문 의미를 확인하지 못해1관계를 NEEDS_REVIEW로 남겼다. 누적 Reference117관계/97URL 중114 관련 의미 확인/3미확정이다. 보조 Map/ArrayList/Closeable/Files.lines 근거를 다른 Concept의 canonical Reference로 전파하지 않았다.

exception-boundaries.svg 전체 소스의 Repository→service→API 책임·cause/복구/HTTP 라벨과 좌표를 확인했다. 새 Reader render/mobile/theme QA는 없다. 제한 Java probe는 미정의 validateAndModify에 가변 Item 변경 뒤 실패하는 명시 반례를 넣어 원소 공유 위험을 확인했다. 원문 helper의 실제 동작을 알아냈다는 주장은 아니다. null 매핑의 get=null/containsKey=true도 확인했으며46Q 전수 실행은 하지 않았다.

누적 회귀17개 PASS, generate/--check errors/drift0, checkpoint의 개별 근거·hash·인용/SVG hash PASS. Java9/18Topic·67/145C·374/841Q, 전체125/134Topic·643/721C·2058/2525Q다. 근거 NEEDS_REVIEW76C/454Q와 partial2C/13Q는 별도다. 다음 functional5C/33Q부터 잔여9Topic/78C/467Q를 이어간다. Java 전체 감사 완료가 아니다.

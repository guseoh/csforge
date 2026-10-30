# design-patterns 정식 checkpoint

2026-10-14. 기존5Topic/36C/200Q를 보존하고 8C/40Q 전체를 원문에서 직접 다시 읽었다. [기존1차메모](design-patterns-review-notes.md)는 수정하지 않는다. [48개 수기 근거/hash](topics/java--design-patterns.json), [10 Reference 관계](reference-relations.json), strategy SVG 전체 소스/좌표·본문 연결 및 제한 javac25 probe를 기록했다.

Concept KEEP5/보강3, Question KEEP39/보강1. 원래 후보의 Factory 인스턴스메서드/class호출 불일치(P0), 한국어 Strategy Reference의 Command코드/일반화 한계(P1)를 직접 확인했다. 추가 P2는 CsvImportJob의 필수 validate 구현 생략 표시와 decorator.q3 A해설의 둘째 counter2 반박 누락이다. 기존 핵심 패턴 모델·문항 정답을 다시 쓰는 대상으로 분류하지 않는다. 정확한 key/인용/공식 근거/최소 교정은 findings.md의 W4-JDPAT-001~004를 따른다.

#201: Factory 호출1C, template 예시 문맥1C, decorator 오답 rationale1Q 및 정확한 Strategy본문을 유지한 출처1관계. #222와 Strategy출처의 교체/한정1관계를 조정한다. 의미 검토와 후속 교정은 구별한다.

strategy SVG의 title/desc, calculator→계약/구현→계약/외부선택주입 흐름을 확인했다. source 의미/geometry 검토이며 render/mobile/theme/human QA는 아니다. 나머지 TEXT/표/코드는 책임·상태·실패 경계를 충분히 보인다. 이미지 생성/수정0. 예시 금액 연산의 전체long범위 산술정책은 기존 선택 검토 메모이며 본문이 모든long값 안전을 보장한다고 주장하지 않으므로 새 사실 오류로 만들지 않는다.

Temurin javac25.0.4.1에서 Factory class호출의 non-static 오류, undefined 협력자만 보충한 Csv예시의 validate미구현 오류를 제한 대조했다. 전문 코드/40Q전수 실행·성능 확인 주장이 아니다. JLS/JDK의 관련 절은 관계별로 확인했다. Flow의 flow-control/reactive-streams 계약을 단순 동기Observer에 전파하지 않는다.

누적 Java6/18Topic·44/145C·240/841Q, 전체122/134Topic·620/721C·1,924/2,525Q. 이번 정식 발견은 P0 1/P1 1/P2 2이며 새검토에서 확정된 후보를 두 번 세지 않는다. 최신 생성 수량은 [progress.md](progress.md)/summary.json을 따른다. 다음 collections9C/51Q부터 나머지12Topic은 아직 정식 checkpoint가 아니다. Topic별 승인 요청 없이 전체 잔여 작업을 이어간다.

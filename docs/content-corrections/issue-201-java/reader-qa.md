# Java 교정 Reader QA

2026-10-16. 실제 로컬 앱 `http://127.0.0.1:15173` → 별도 백엔드18081 → 테스트 PostgreSQL15433. 운영 앱/DB가 아니다. 교정 pack을 Import한 뒤 실제 Concept Reader와 오답 노트 UI에서 확인했다.

## SVG 의미·가독성

각 행은 실제 브라우저의 **375×812 / 1280×900**, **light / dark** 네 조합을 확인한 기록이다. XML 파싱만을 화면 QA로 부르지 않는다. 기존 title/desc와 Concept의 ALT가 존재하고, 각 자산이 정상 로드되며 본문 내에 표시됨을 확인했다.

| 기존 자산 | 테스트 Concept | 네 조합 | 실제 확인 내용 |
| --- | --- | --- | --- |
| array-list-linked-list.svg | java.core.collections.arraylist-linkedlist-tradeoff | 확인 | 네 인덱스 칸과 연결 노드를 별도 행에 놓아 겹침 제거. 최초 가로 배치는 모바일 라벨이 작아 세로 배치/라벨 크기를 보강한 뒤 재확인 |
| hashmap-buckets.svg | java.core.collections.hashmap-hashing-collision | 확인 | get의 value 반환과 다음 entry 확인, put의 교체 동작 구분. hash→bucket→equals 경로와 라벨/여백·고정 어두운 자산의 light/dark Reader 대비 |
| nio-buffer-flip.svg | java.core.io-nio.nio-channel-buffer | 확인 | 양쪽 모두 네 슬롯과 ABC_ 보존. 세 칸의 읽기 범위, p3→0/l4→3/capacity4, clear의 의미. 모바일 img bounds left18/right342/viewport375, 정상 로드/ALT 확인 |
| jvm-runtime-data-areas.svg | java.core.jvm-runtime.jvm-runtime-data-areas-frames | 확인 | A/B 독립 frame 출발점과 서로 다른 바깥 경로로 공유 Heap 도착. 다른 스택 박스 관통 없음. Method Area 공유 및 추상 모델/물리 배치 경계 |
| pass-by-value.svg | java.core.language-types.pass-by-value | 확인 | 호출 전 A→복사 후 공유 A→member A/value B 세 단계. caller 화살표가 parameter 박스·라벨을 관통하지 않으며 변수/객체가 분리됨 |

모바일에서는 이미지가 Reader 너비에 맞춰 축소된다. 복잡한 두 도식은 정보를 세로 패널로 배치해 원래의 작은 가로 라벨보다 읽기 쉽게 했다. 화면에서의 기본 가독성·클리핑·화살표를 확인한 범위이며, 모든 디바이스/보조공학/실제 학습자 사용성 검사를 완료했다고 주장하지 않는다. 테마/viewport 임시 변경은 원래 시스템 테마/기본 viewport로 복원했다.

## 수정 Stream3Q

실제 오답 노트의 해당 Question을 열어 prompt/코드/해설/모범 답안이 교정본으로 Import됐음을 확인했다. 새 학습 이력은 만들지 않고 Import 검증에서 시드한 이력을 사용했다.

- `java.core.streams.stream-pipeline-laziness.q2`: `Stream.of` 생성 → 구분자 출력 → `forEachOrdered` terminal 출력이 정상 코드 블록으로 표시. 실제 UI 정답 B `|12`와 해당 rationale/해설 일치. 나머지 선택지는 원문과 Java 계약을 직접 대조했다.
- `java.core.streams.stream-reduce.q3`: 명시적인 왼쪽 누적 반복문의 네 줄 코드가 정상 표시되며 모바일의 긴 줄은 기존 코드 영역의 가로 스크롤을 사용한다. 고정 순서 -6과 reduce 계약 구분을 유지한다.
- `java.core.streams.stream-reduce.q5`: 한 줄의 깨진 fence 대신 독립된 두 줄 Java 코드 블록이 표시됨. 순차·병렬 공통 identity/associativity 요구와 정확한 반례·반복문 대안이 모범 답안/해설에 표시됨. 난도 HARD와 Concept 연결 유지.

위 확인은 Codex의 로컬 화면 QA다. ChatGPT Java Full Content Review 및 사용자의 Human Usage Check/merge 승인은 남는다. 배포·Production Import·merge는 수행하지 않는다.

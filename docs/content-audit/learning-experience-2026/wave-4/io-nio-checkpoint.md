# io-nio 정식 checkpoint

2026-10-14. 6C/35고유Q의 전체 본문·선택지/rationale·모범 답안·해설·난도·Concept 연결을 직접 읽고 [41개 근거/hash](topics/java--io-nio.json)에 기록했다. selector.q7의 Buffer crosslink는 대응하되 문항1개로 센다. Concept KEEP5/보강1, Question KEEP33/보강2. 새 P0 0/P1 1/P2 2그룹이다.

W4-JIO-001 P1은 byte-character-stream-charset.q7의 미완성 UTF-8 바이트 보존 책임이다. CharsetDecoder 재사용만으로 미소비 바이트가 내부에 자동 보관된다고 가정하면 안 된다. decode(false)의 UNDERFLOW 뒤 input의 position..limit 바이트를 호출자가 compact/carry해 다음 입력과 다시 제공하는 책임을 모범 답안·해설에 명시한다. 목적과 오류 정책은 유지한다. 제한 Temurin25 probe는 첫2바이트가 input에 남고, compact 뒤 다음1바이트로 codePoint54620을 복원하며, 같은 decoder라도 첫 input을 버리고 tail만 주면 MALFORMED[1]임을 확인했다.

W4-JIO-002 P2는 nio-channel-buffer.q4 C rationale의 flip “교환관계” 표현이다. oldposition→limit, position=0으로 한 곳만 교정한다. W4-JIO-003 P2는 같은 Concept SVG의 왼4슬롯ABC_와 오른2사각형/ABC한셀 표현이다. 정확한 position/limit 라벨은 유지하고 양쪽의 동일 슬롯 배치를 권장한다. #201 최소 교정 범위이며 이번에는 본문·문항·SVG를 수정하지 않았다.

15 Reference 관계 중13관련 의미 확인/2D2 shell 미확정이다. 이전 다른 Topic의 같은1219 URL 상태를 빌리지 않고 직접 재대조했다. Charset 기본UTF8/Oracle COMPAT/System 출력 인코딩, InputStream/Reader의 단위·EOF, 버퍼 전달과 내구성, Path normalize/symlink·Files move 제공자 보장, Buffer/ByteBuffer 상태, Selector의 선택 집합·readiness 힌트와 키 생명주기를 구분했다. 두 SVG 전체 소스·좌표·라벨은 읽었으며 Reader render/mobile/theme QA는 미수행이다.

회귀18개/checkpoint/hash/인용/generate/--check/Python구문/diff를 검증했다. probe 첫 실행은 Windows stdout 인코딩을 UTF8로 읽다가 실패했고, 문자열 출력을 숫자 code point로 바꾼 한 번의 재실행이 성공했다. 이를 canonical UTF8 API 실패로 분류하지 않는다.

Java14/18Topic·100/145C·568/841Q, 전체676/721C·2252/2525Q의 전수 읽기 근거다. 직접 읽은 streams 품질 미확정3Q를 보존한다. 다음 coding-tests부터 잔여4Topic/45C/273Q를 계속한다. Java 전체 완료가 아니다.

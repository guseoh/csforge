from pathlib import Path
import json,re
root=Path('content/java')
fields={'promptMarkdown','content','rationaleMarkdown','explanationMarkdown','modelAnswer','title','description'}
phrases={
'Static factory':'정적 팩터리','static factory':'정적 팩터리','Dependency injection':'의존성 주입(DI)','dependency injection':'의존성 주입(DI)','shared mutable state':'공유 가변 상태','shared state':'공유 상태','object identity':'객체 동일성','reference identity':'참조 동일성',
'local variable':'지역 변수','source code':'소스 코드','source program':'소스 프로그램','class file':'클래스 파일','class-file':'클래스 파일',
'class loader':'클래스 로더','binary compatibility':'바이너리 호환성','source compatibility':'소스 호환성','compile-time':'컴파일 시점','run-time':'실행 시점',
'native code':'네이티브 코드','native instruction':'네이티브 명령','native machine code':'네이티브 기계어 코드',
'runtime data area':'런타임 데이터 영역','runtime dependency':'런타임 의존성','runtime optimization':'런타임 최적화','runtime machine':'실행 가상 머신',
'runtime model':'실행 모델','runtime object':'실행 중 객체','runtime class':'런타임 클래스','thread stack':'스레드 스택','heap object':'힙 객체',
'byte sequence':'바이트열','raw byte':'원본 바이트','binary format':'바이너리 형식','binary payload':'바이너리 페이로드',
'text abstraction':'텍스트 추상화','input abstraction':'입력 추상화','output abstraction':'출력 추상화','stateful decoder':'상태를 유지하는 디코더',
'variable-width charset':'가변 길이 문자셋','streaming decode':'스트리밍 디코딩','chunk boundary':'청크 경계','character boundary':'문자 경계',
'message boundary':'메시지 경계','protocol framing':'프로토콜 프레이밍','application message':'애플리케이션 메시지','business request':'업무 요청',
'selection loop':'선택 루프','event loop':'이벤트 루프','busy loop':'바쁜 대기 루프','selected key':'선택된 키','interest set':'관심 집합','ready set':'준비 집합',
'cursor metadata':'커서 메타데이터','write buffer':'쓰기 버퍼','non-blocking mode':'논블로킹 모드','non-blocking':'논블로킹','blocking':'블로킹',
'partial I/O':'부분 I/O','functional interface':'함수형 인터페이스','abstract method':'추상 메서드','default method':'디폴트 메서드',
'static factory method':'정적 팩터리 메서드','factory method':'팩터리 메서드','method reference':'메서드 참조','thread-safe':'스레드 안전',
'thread-safety':'스레드 안전성','worker thread':'작업 스레드','unchecked exception':'비검사 예외','checked exception':'검사 예외',
'unchecked warning':'비검사 경고','raw type':'로 타입','target type':'대상 타입','flow scope':'흐름 범위','binding variable':'바인딩 변수',
'side effect':'부수 효과','data race':'데이터 경합(data race)','race condition':'경합 조건(race condition)',
'output writer':'출력 Writer','input reader':'입력 Reader','underlying stream':'하위 스트림','underlying output':'하위 출력 계층','underlying writer':'하위 Writer 계층',
'mutable character sequence':'가변 문자 시퀀스','mutable builder':'가변 빌더','sorted collection':'정렬 컬렉션',
'key-value':'키-값','iteration order':'순회 순서','insertion order':'삽입 순서','natural order':'자연 순서',
'live JVM process state':'실행 중 JVM 프로세스 상태','fields/methods':'필드/메서드','constant pool':'상수 풀','archive API':'압축 파일 API','byte-oriented API':'바이트 중심 API','code unit':'코드 단위','round-trip':'왕복 변환','malformed/unmappable':'잘못된 형식/매핑 불가능','malformed input':'잘못된 형식의 입력','unmappable input':'매핑할 수 없는 입력','read/write':'읽기/쓰기','working directory':'작업 디렉터리','symbolic link':'심볼릭 링크','real path':'실제 경로','base directory':'기준 디렉터리','filesystem I/O':'파일 시스템 I/O','whole-file API':'전체 파일 API','crash-safe atomic replacement':'장애에도 안전한 원자적 교체','length prefix':'길이 접두부','terminal operation':'최종 연산(terminal operation)','user mode':'사용자 모드','user-mode':'사용자 모드','virtual machine':'가상 머신','constant pool':'상수 풀','Java language':'Java 언어','forward compatibility':'전방 호환성','downstream collector':'하위 수집기(downstream collector)','test case':'테스트 케이스','connection pool':'연결 풀','memory visibility':'메모리 가시성','memory ordering':'메모리 순서','memory model':'메모리 모델','thread pool':'스레드 풀',
'platform thread':'플랫폼 스레드','virtual thread':'가상 스레드','carrier thread':'캐리어 스레드','system call':'시스템 호출'
}
tokens={
'source':'소스','runtime':'런타임','compiler':'컴파일러','binary':'바이너리','metadata':'메타데이터','native':'네이티브','implementation':'구현',
'object':'객체','reference':'참조','variable':'변수','field':'필드','method':'메서드','parameter':'매개변수','caller':'호출자','resource':'자원',
'operation':'연산','storage':'저장 공간','reclaim':'회수','unreachable':'도달 불가능한','byte':'바이트','character':'문자','text':'텍스트',
'encoding':'인코딩','decoding':'디코딩','decode':'디코딩','encode':'인코딩','decoder':'디코더','format':'형식','abstraction':'추상화',
'input':'입력','output':'출력','context':'문맥','policy':'정책','collaborator':'협력 객체','fake':'페이크','failure':'실패','fallback':'대체 처리',
'validation':'검증','mutable':'가변','shared':'공유','worker':'작업자','workload':'작업 부하','correctness':'정확성','lifecycle':'생명주기',
'dependency':'의존성','collection':'컬렉션','collector':'수집기','scope':'범위','identity':'동일성','value':'값','state':'상태','thread':'스레드',
'class':'클래스','process':'프로세스','instruction':'명령','platform':'플랫폼','portability':'이식성','mapping':'매핑','monitor':'모니터',
'heap':'힙','stack':'스택','buffer':'버퍼','readiness':'준비 상태','chunk':'청크','payload':'페이로드','framing':'프레이밍','parser':'파서',
'cursor':'커서','memory':'메모리','unchecked':'비검사','hash':'해시','offset':'오프셋','target':'대상','binding':'바인딩',
'order':'순서','pool':'풀','factory':'팩터리','constructor':'생성자','wrapper':'래퍼','builder':'빌더','sequence':'시퀀스','stream':'스트림',
'queue':'큐','deque':'덱','list':'리스트','set':'집합','key':'키','iteration':'순회','membership':'포함 여부','counting':'개수 세기',
'comparator':'비교자','iterator':'반복자','interface':'인터페이스','instance':'인스턴스','callback':'콜백','contract':'계약',
'invariant':'불변 조건','ownership':'소유권','boundary':'경계','visibility':'가시성','synchronization':'동기화','carrier':'캐리어',
'liveness':'진행성','priority':'우선순위','zone':'시간대','charset':'문자셋','exception':'예외','error':'오류','pattern':'패턴','equality':'동등성',
'component':'구성 요소','head':'헤드','file':'파일','code':'코드','type':'타입','string':'문자열','underlying':'하위',
'locality':'지역성','framework':'프레임워크','application':'애플리케이션','client':'클라이언트','connection':'연결','task':'작업','buffering':'버퍼링','copy':'복사','graph':'객체 그래프','seam':'교체 지점','present':'값 존재','empty':'비어 있음','action':'동작','owner':'소유자','borrower':'차용자','generic':'제네릭','subtype':'하위 타입','view':'뷰','index':'인덱스','cache':'캐시','snapshot':'스냅샷','cast':'캐스팅','primitive':'원시 타입','data':'데이터','token':'토큰','loader':'로더','predicate':'조건 함수','function':'함수','ordering':'정렬 순서','compile':'컴파일','frame':'프레임','wildcard':'와일드카드','user':'사용자','timeout':'타임아웃','pipeline':'파이프라인','bytecode':'바이트코드','library':'라이브러리','kernel':'커널','processor':'프로세서','launcher':'실행 도구','semantics':'의미론','specification':'명세','algorithm':'알고리즘','threshold':'임계값','generation':'생성','program':'프로그램','keyboard':'키보드','content':'내용','handler':'처리기','stage':'단계','alias':'별칭','lookup':'조회','allocation':'할당','node':'노드','immutable':'불변','stateless':'무상태','stateful':'상태 유지','protocol':'프로토콜','unknown':'알 수 없는 값','consumer':'소비자','producer':'생산자','intermediate':'중간','traversal':'순회','batch':'배치','incident':'장애','bytes':'바이트','encoded':'인코딩된','replacement':'대체 처리','provenance':'출처 정보','syscall':'시스템 호출','filesystem':'파일 시스템','directory':'디렉터리','descriptor':'디스크립터','classpath':'클래스패스','authorization':'인가','streaming':'스트리밍','paging':'페이징','atomic':'원자적','option':'옵션','selected':'선택된','selectable':'선택 가능한','selection':'선택','mechanism':'방식','header':'헤더','durability':'내구성','provider':'제공자','message':'메시지','buffered':'버퍼링된','reset':'재설정','attributes':'속성','live':'실행 중인','read':'읽기','write':'쓰기','flush':'플러시'
}
# Code, URLs, and explicit English glosses are preserved.
protected=re.compile(r'(```.*?```|`[^`]*`|https?://[^\s)]+|/learning/[^)\s]+|\([A-Za-z][A-Za-z0-9 _./:+\-]*\))',re.S)

def has_final(s):
    # last Hangul syllable, ignoring parenthetical gloss/punctuation
    for ch in reversed(s):
        if '\uac00' <= ch <= '\ud7a3':
            return (ord(ch)-0xAC00)%28
    return 0

def fix_josa(j, trans):
    jong=has_final(trans)
    if j in ('은','는'): return '은' if jong else '는'
    if j in ('이','가'): return '이' if jong else '가'
    if j in ('을','를'): return '을' if jong else '를'
    if j in ('과','와'): return '과' if jong else '와'
    if j in ('으로','로'): return '로' if (not jong or jong==8) else '으로'
    if j in ('이라서','라서'): return '이라서' if jong else '라서'
    if j in ('이라면','라면'): return '이라면' if jong else '라면'
    if j in ('이라고','라고'): return '이라고' if jong else '라고'
    if j in ('이라는','라는'): return '이라는' if jong else '라는'
    if j in ('으로부터','로부터'): return '로부터' if (not jong or jong==8) else '으로부터'
    if j in ('으로서','로서'): return '로서' if (not jong or jong==8) else '으로서'
    if j in ('으로써','로써'): return '로써' if (not jong or jong==8) else '으로써'
    return j

def make_rx(term):
    suffix=r'이라서|라서|이라면|라면|이라고|라고|이라는|라는|으로부터|로부터|으로서|로서|으로써|로써|으로|은|는|이|가|을|를|과|와|로'
    return re.compile(r'(?<![A-Za-z0-9_.])'+re.escape(term)+r'(?![A-Za-z0-9_(\[])(?:(?P<josa>'+suffix+r')(?![가-힣]))?')
repls=[(make_rx(k),v) for k,v in sorted(phrases.items(),key=lambda x:len(x[0]),reverse=True)]
repls += [(make_rx(k),v) for k,v in tokens.items()]

def conv_plain(s):
    for r,trans in repls:
        def f(m):
            j=m.group('josa') or ''
            return trans+(fix_josa(j,trans) if j else '')
        s=r.sub(f,s)
    return s

def conv(s):
    parts=protected.split(s)
    for i in range(0,len(parts),2): parts[i]=conv_plain(parts[i])
    out=''.join(parts)
    # If Markdown emphasis closes between the translated noun and a Korean particle, fix the particle.
    nouns=sorted(set(list(phrases.values())+list(tokens.values())), key=len, reverse=True)
    suffix=r'이라서|라서|이라면|라면|이라고|라고|이라는|라는|으로부터|로부터|으로서|로서|으로써|로써|으로|은|는|이|가|을|를|과|와|로'
    for noun in nouns:
        rr=re.compile(re.escape(noun)+r'(?P<mark>\*\*|__|\*|_)(?P<josa>'+suffix+r')(?![가-힣])')
        def ff(m): return noun+m.group('mark')+fix_josa(m.group('josa'),noun)
        out=rr.sub(ff,out)
    return out


string_token=r'"(?:\\.|[^"\\])*"'
field_alt='|'.join(map(re.escape,[x for x in fields if x!='acceptedAnswers']))
value_rx=re.compile(r'("(?:'+field_alt+r')"\s*:\s*)('+string_token+r')')
answers_rx=re.compile(r'("__never_acceptedAnswers"\s*:\s*)\[((?:\s*'+string_token+r'\s*,?\s*)*)\]')
inner_rx=re.compile(string_token)
changed=set(); replacements=0

def repl_val(m):
    global replacements

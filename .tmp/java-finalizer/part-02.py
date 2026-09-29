'바이트-oriented':'바이트 중심','고정-작업자':'고정 작업 스레드','고정 작업자':'고정 작업 스레드','객체 객체 그래프':'객체 그래프','타입 타입 소거':'타입 소거','도달 가능한한':'도달 가능한','다른 다른 enum 타입':'다른 enum 타입',
}
for p in root.rglob('*'):
    if p.suffix not in ('.json','.md'): continue
    t=p.read_text(encoding='utf-8'); n=t
    for a,b in GLOBAL_FIXES.items(): n=n.replace(a,b)
    if n!=t: p.write_text(n,encoding='utf-8')

# Remaining general English prose: Korean-first while preserving APIs and parenthesized exact terms.
P2={
'tiered compilation':'계층형 컴파일(tiered compilation)','compilation level':'컴파일 단계','source compilation':'소스 컴파일',
'exhaustive handling':'빠짐없는 처리','exhaustive switch':'모든 경우를 다루는 switch','exhaustive 처리':'빠짐없는 처리','exhaustive 검사':'완전성 검사',
'retained path':'유지 경로(retained path)','operand stack':'피연산자 스택(operand stack)','GC root':'GC 루트',
'stack trace':'스택 추적(stack trace)','Heap dump':'힙 덤프(heap dump)','heap dump':'힙 덤프(heap dump)','Thread dump':'스레드 덤프(thread dump)','thread dump':'스레드 덤프(thread dump)',
'Garbage 컬렉션':'가비지 컬렉션(GC)','garbage 컬렉션':'가비지 컬렉션(GC)','garbage collection':'가비지 컬렉션(GC)',
'pause/response-time':'일시 중지 시간/응답 시간','handoff 안전성':'전달 안전성','handoff를':'전달을','handoff가':'전달이','handoff':'전달',
'downstream capacity':'하위 시스템 처리 용량','cold-start':'초기 기동(cold start)','warm-up':'워밍업(warm-up)','JIT/profile':'JIT/프로파일',
'deadlock':'교착 상태','starvation':'기아','livelock':'라이브락','fixed thread pool':'고정 크기 스레드 풀','fixed 플랫폼 풀':'고정 크기 플랫폼 스레드 풀',
'natural order':'자연 순서','raw List':'원시 타입(raw type) List','type argument':'타입 인자(type argument)','type mismatch':'타입 불일치','subtyping':'하위 타입 관계(subtyping)',
'local time':'지역 시각(local time)','local occurrence':'지역 시각 기준 발생 시점','region ZoneId':'지역 기반 `ZoneId`','IANA region':'IANA 지역','time zone rule':'시간대 규칙',
'mutual exclusion':'상호 배제(mutual exclusion)','downstream 수집기':'하위 수집기(downstream collector)','Fixed 작업자':'고정 작업 스레드','reverse 정렬 순서':'역순 정렬','reverse 정렬':'역순 정렬','tracing 문맥':'추적 문맥','local slot':'지역 변수 슬롯','local 변수':'지역 변수',
'trade-off':'트레이드오프',
}
T2={'business':'업무','custom':'사용자 정의','vendor':'공급자','lifetime':'수명','compilation':'컴파일','initialization':'초기화','retry':'재시도','mutation':'변경','cause':'원인','reachable':'도달 가능한','operand':'피연산자','pause':'일시 중지 시간','throughput':'처리량','region':'지역','hang':'멈춤','profile':'프로파일','leak':'누수','dump':'덤프','overhead':'추가 비용','capacity':'용량','race':'경합','evidence':'근거','deadline':'기한','local':'지역','timeline':'시간축','natural':'자연','backing':'기반','downstream':'후속','fixed':'고정','reentrancy':'재진입성'}
prot=re.compile(r'(```.*?```|`[^`]*`|https?://[^\s)]+|/learning/[^)\s]+|\([A-Za-z][A-Za-z0-9 _./:+\-]*\))',re.S)
def hx(s):
    for ch in reversed(s):
        if '\uac00'<=ch<='\ud7a3': return (ord(ch)-0xAC00)%28
    return 0
def particle(j,w):
    z=hx(w)
    return {'은':'은' if z else '는','는':'은' if z else '는','이':'이' if z else '가','가':'이' if z else '가','을':'을' if z else '를','를':'을' if z else '를','과':'과' if z else '와','와':'과' if z else '와','으로':'로' if (not z or z==8) else '으로','로':'로' if (not z or z==8) else '으로'}.get(j,j)
def rr(term):
    suf=r'으로|은|는|이|가|을|를|과|와|로'
    return re.compile(r'(?<![A-Za-z0-9_.])'+re.escape(term)+r'(?![A-Za-z0-9_(\[])(?:(?P<j>'+suf+r')(?![가-힣]))?')
R=[(rr(k),v) for k,v in sorted(P2.items(),key=lambda x:len(x[0]),reverse=True)]+[(rr(k),v) for k,v in T2.items()]
def koreanize(s):
    parts=prot.split(s)
    for i in range(0,len(parts),2):
        for r,w in R: parts[i]=r.sub(lambda m:w+(particle(m.group('j'),w) if m.group('j') else ''),parts[i])
    return ''.join(parts)
field_names=['promptMarkdown','content','rationaleMarkdown','explanationMarkdown','modelAnswer','title','description']
string_token=r'"(?:\\.|[^"\\])*"'; alt='|'.join(map(re.escape,field_names)); vr=re.compile(r'("(?:'+alt+r')"\s*:\s*)('+string_token+r')')
def replj(m):
    v=json.loads(m.group(2)); nv=koreanize(v); return m.group(1)+json.dumps(nv,ensure_ascii=False) if nv!=v else m.group(0)
for p in root.rglob('*.json'):
    b=p.read_text(encoding='utf-8'); a=vr.sub(replj,b)
    if a!=b: json.loads(a); p.write_text(a,encoding='utf-8')
for p in root.rglob('*.md'):
    lines=p.read_text(encoding='utf-8').splitlines(keepends=True); out=[]; front=bool(lines and lines[0].strip()=='---'); fence=False
    for i,line in enumerate(lines):
        st=line.strip()
        if i==0 and front: out.append(line); continue
        if front:
            if st=='---': front=False
            out.append(line); continue
        if st.startswith('```'): fence=not fence; out.append(line); continue
        if fence: out.append(line); continue
        out.append(koreanize(line))
    p.write_text(''.join(out),encoding='utf-8')

replace_file('content/java/jvm-runtime/jit-hotspot-warmup.md', {'"몇 번 실행하면 워밍업(warm-up) 완료" 같은 보편적인 숫자는 없습니다. Compilation timing은 JVM version, 코드 shape, 작업 부하, 실행 빈도에 따라 달라지고 GC나 OS scheduling도 측정값에 영향을 줍니다.':'"몇 번 실행하면 워밍업(warm-up)이 완료된다" 같은 보편적인 숫자는 없습니다. 컴파일 시점은 JVM 버전, 코드 형태, 작업 부하, 실행 빈도에 따라 달라지고 GC나 OS 스케줄링도 측정값에 영향을 줍니다.'})
replace_file('content/java/jvm-runtime/reference-strengths.md', {'softly-도달 가능한 객체':'소프트 참조로만 도달 가능한 객체'})
replace_file('content/java/concurrency/deadlock-starvation-livelock.md', {'Java 25의 `ThreadMXBean` 교착 상태 탐지 API는 플랫폼 스레드 monitoring을 중심으로 하므로 모든 형태의 virtual-스레드 멈춤까지 하나의 탐지 결과로 일반화해서는 안 됩니다. 진단 도구가 **어떤 스레드와 어떤 lock 종류를 관찰하는지**도 계약을 확인해야 합니다.':'Java 25의 `ThreadMXBean` 교착 상태 탐지 API는 플랫폼 스레드 모니터링을 중심으로 하므로 모든 형태의 가상 스레드 멈춤까지 하나의 탐지 결과로 일반화해서는 안 됩니다. 진단 도구가 **어떤 스레드와 어떤 잠금 종류를 관찰하는지**도 계약을 확인해야 합니다.'})
replace_file('content/java/streams/questions.json', {'두 인자 `toMap`은 같은 키에 여러 값이 들어오면 임의의 승자를 고르지 않고 duplicate-키 실패를 알린다. 중복이 정상이라면 merge 함수나 grouping 정책을 명시해야 한다.':'두 인자 `toMap`은 같은 키에 여러 값이 들어오면 임의의 승자를 고르지 않고 중복 키 오류를 알린다. 중복이 정상이라면 병합 함수나 그룹화 정책을 명시해야 한다.'})
# One source typo and introduced duplicate cleanups.
for p in root.rglob('*'):
    if p.suffix not in ('.json','.md'): continue
    t=p.read_text(encoding='utf-8'); n=t.replace('객체 객체 그래프','객체 그래프').replace('타입 타입 소거','타입 소거').replace('도달 가능한한','도달 가능한').replace('다른 다른 enum 타입','다른 enum 타입')
    if n!=t:p.write_text(n,encoding='utf-8')

# Final order-sensitive corrections after all general passes.
FINAL_REPL={
'지역 시각(지역 time)':'지역 시각(local time)',
'고정-작업자':'고정 작업 스레드',
'고정 작업자':'고정 작업 스레드',
'디코더는 malformed 바이트열이나 표현할 수 없는 입력을 report·replace·ignore 등으로 다룰 정책을 가질 수 있다. 손상 데이터를 조용히 바꿀지 실패로 처리할지 요구에 맞춰 선택한다.':'`CharsetDecoder`는 잘못된 형식의 바이트열이나 매핑할 수 없는 입력을 `REPORT`, `REPLACE`, `IGNORE` 중 하나로 처리하도록 설정할 수 있다. 손상 데이터를 조용히 바꿀지 실패로 처리할지 요구에 맞춰 선택한다.',
}
for p in root.rglob('*'):
    if p.suffix not in ('.json','.md'): continue
    t=p.read_text(encoding='utf-8'); n=t
    for a,b in FINAL_REPL.items(): n=n.replace(a,b)
    if n!=t: p.write_text(n,encoding='utf-8')

# Validate format and core corpus counts. Repository Validation will run full import/idempotency checks.
for p in root.rglob('*.json'): json.loads(p.read_text(encoding='utf-8'))
if len(json.loads((root/'topics.json').read_text(encoding='utf-8'))) != 18: raise RuntimeError('topic count changed')
if sum(1 for p in root.rglob('*.md')) != 145: raise RuntimeError('concept count changed')
if sum(len(json.loads(p.read_text(encoding='utf-8'))) for p in root.rglob('questions.json')) != 841: raise RuntimeError('question count changed')

    v=json.loads(m.group(2)); nv=conv(v)
    if nv==v:return m.group(0)
    replacements+=1; return m.group(1)+json.dumps(nv,ensure_ascii=False)

def repl_answers(m):
    global replacements
    def one(sm):
        global replacements
        v=json.loads(sm.group(0)); nv=conv(v)
        if nv==v:return sm.group(0)
        replacements+=1; return json.dumps(nv,ensure_ascii=False)
    return m.group(1)+'['+inner_rx.sub(one,m.group(2))+']'

for p in sorted(root.rglob('*.json')):
    before=p.read_text(encoding='utf-8')
    after=value_rx.sub(repl_val,before); after=answers_rx.sub(repl_answers,after)
    if after!=before:
        json.loads(after); p.write_text(after,encoding='utf-8'); changed.add(p)
for p in sorted(root.rglob('*.md')):
    lines=p.read_text(encoding='utf-8').splitlines(keepends=True)
    out=[]; fence=False; front=bool(lines and lines[0].strip()=='---'); touched=False
    for i,line in enumerate(lines):
        st=line.strip()
        if i==0 and front: out.append(line); continue
        if front:
            if st=='---': front=False
            out.append(line); continue
        if st.startswith('```'): fence=not fence; out.append(line); continue
        if fence: out.append(line); continue
        nl=conv(line); touched|=(nl!=line); out.append(nl)
    if touched:
        p.write_text(''.join(out),encoding='utf-8'); changed.add(p)


# --- Final reviewed corrections layered on the conservative pass ---
from pathlib import Path
import json, re, collections
curriculum = Path('content/curriculum/java.yaml')

# Correct Korean particles after converted nouns for 나/이나.
_all_maps = list(phrases.values()) + list(tokens.values())
def _jong(s):
    for ch in reversed(re.sub(r'\([^)]*\)', '', s)):
        if '\uac00' <= ch <= '\ud7a3':
            return (ord(ch)-0xAC00)%28
    return 0
for p in root.rglob('*'):
    if p.suffix not in ('.json','.md'): continue
    txt=p.read_text(encoding='utf-8'); new=txt
    for noun in sorted(set(_all_maps), key=len, reverse=True):
        if _jong(noun): new=re.sub(re.escape(noun)+r'나(?![가-힣])',noun+'이나',new)
        else: new=re.sub(re.escape(noun)+r'이나(?![가-힣])',noun+'나',new)
    if new!=txt: p.write_text(new,encoding='utf-8')

def replace_file(rel, mapping):
    p=Path(rel); s=p.read_text(encoding='utf-8')
    for a,b in mapping.items():
        s=s.replace(a,b)
    p.write_text(s,encoding='utf-8')

replace_file('content/java/io-nio/questions.json', {
'원래 의도와 다른 문자가 나오거나 잘못된 형식/매핑 불가능 입력으로 처리될 수 있다':'원래 의도와 다른 문자가 나오거나 잘못된 형식의 입력·매핑할 수 없는 입력으로 처리될 수 있다',
'다른 규칙으로 바이트를 해석하면 다른 문자가 만들어질 수 있고, 일부 시퀀스는 잘못된 형식/매핑 불가능 입력으로 오류나 대체 처리 처리될 수 있다.':'다른 규칙으로 바이트를 해석하면 다른 문자가 만들어질 수 있고, 일부 바이트열은 잘못된 형식의 입력이나 매핑할 수 없는 입력이 되어 오류 또는 대체 문자 처리가 발생할 수 있다.',
'문자셋 불일치가 언제나 예외가 되는 것은 아니다. 디코더 설정에 따라 대체 문자를 반환할 수도 있어 조용한 mojibake가 가능하다.':'문자셋 불일치가 언제나 예외가 되는 것은 아니다. 디코더 설정에 따라 대체 문자를 반환할 수도 있어 조용한 문자 깨짐(mojibake)이 가능하다.',
'디코더는 받은 바이트를 선택된 문자셋의 규칙으로 해석한다. 생산자가 사용한 문자셋과 소비자가 사용한 문자셋이 다르면 같은 바이트열이 다른 문자로 해석되거나 오류·대체 처리가 발생할 수 있다.':'디코더는 받은 바이트를 선택된 문자셋의 규칙으로 해석한다. 생산자가 사용한 문자셋과 소비자가 사용한 문자셋이 다르면 같은 바이트열이 다른 문자로 해석되거나 오류 또는 대체 문자가 발생할 수 있다.',
'String은 문자 내용이지 원본 바이트와 문자셋을 보관하는 출처 정보 객체가 아니다. 디코딩 후 자동으로 원래 입력을 재현하지 않는다.':'String은 문자 내용일 뿐, 원본 바이트 배열과 그때 사용한 문자셋 정보를 함께 보관하지 않는다. 디코딩 후 자동으로 원래 입력을 재현하지 않는다.',
'아니다. 잘못된 디코딩에서 다른 문자로 매핑되거나 대체 처리가 일어나면 원본 정보를 잃을 수 있다':'아니다. 잘못된 디코딩에서 다른 문자로 매핑되거나 대체 문자가 삽입되면 원본 정보를 잃을 수 있다',
'잘못된 디코더가 다른 문자로 바꾸거나 대체 처리를 쓰면 구별 정보가 사라질 수 있다. 그 String을 다시 인코딩해도 입력 바이트를 항상 복원할 수 없다.':'잘못된 디코더가 다른 문자로 바꾸거나 대체 문자를 삽입하면 구별 정보가 사라질 수 있다. 그 String을 다시 인코딩해도 입력 바이트를 항상 복원할 수 없다.',
'문제의 최초 바이트-to-문자 경계를 찾아야 한다.':'문제의 최초 바이트→문자 경계를 찾아야 한다.',
'ZIP 처리는 별도 압축 파일 API이 필요하다.':'ZIP 처리는 별도의 압축 파일 API가 필요하다.',
'Reader는 바이트를 문자로 해석하는 추상화이므로 이런 데이터에는 InputStream/바이트 중심 API이 더 자연스럽다.':'Reader는 바이트를 문자로 해석하는 추상화이므로 이런 데이터에는 `InputStream` 같은 바이트 중심 API가 더 자연스럽다.',
'잘못된 형식/매핑 불가능 입력을 report할지 대체 처리할지 같은 디코더 오류 처리':'잘못된 형식의 입력(malformed input)이나 매핑할 수 없는 입력(unmappable input)을 오류로 보고할지, 대체할지 같은 디코더 오류 처리',
'디코더는 malformed 바이트열이나 표현할 수 없는 입력을 report·replace·ignore 등으로 다룰 정책을 가질 수 있다. 손상 데이터를 조용히 바꿀지 실패로 처리할지 요구에 맞춰 선택한다.':'`CharsetDecoder`는 잘못된 형식의 바이트열이나 매핑할 수 없는 입력을 `REPORT`, `REPLACE`, `IGNORE` 중 하나로 처리하도록 설정할 수 있다. 손상 데이터를 조용히 바꿀지 실패로 처리할지 요구에 맞춰 선택한다.',
'문자와 바이트의 대응은 문자셋마다 다르고 여러 바이트가 한 코드 단위/문자를 만들 수 있다. 하나로 합치는 전역 규칙은 없다.':'문자와 바이트의 대응은 문자셋마다 다르고 여러 바이트가 하나의 코드 단위(code unit)나 문자를 만들 수 있다. 하나로 합치는 전역 규칙은 없다.',
'바이트-to-문자 경계에서는 어떤 문자셋을 쓸지뿐 아니라 잘못된 입력을 어떻게 다룰지도 중요할 수 있다. `CharsetDecoder`는 잘못된 형식/매핑 불가능 입력에 대한 행동을 구성할 수 있으며, 외부 데이터 품질과 오류 처리 요구에 맞게 선택한다.':'바이트→문자 경계에서는 어떤 문자셋을 쓸지뿐 아니라 잘못된 입력을 어떻게 다룰지도 중요할 수 있다. `CharsetDecoder`는 잘못된 형식의 입력(malformed input)과 매핑할 수 없는 입력(unmappable input)에 대한 동작을 설정할 수 있으며, 외부 데이터 품질과 오류 처리 요구에 맞게 선택한다.',
'어떤 한글 문자의 multi-바이트열이 두 청크 사이에 나뉘면':'어떤 한글 문자를 구성하는 여러 바이트가 두 청크 사이에 나뉘면',
'Variable-width 문자셋에서는':'가변 길이 문자셋에서는',
'PNG의 임의 바이트열을 문자로 해석하면 잘못된 형식의 입력이나 대체 처리가 생길 수 있어 원본 바이트 보존 계약과 맞지 않는다.':'PNG의 임의 바이트열을 문자로 해석하면 잘못된 형식의 입력이나 대체 문자 처리가 생길 수 있어 원본 바이트 보존 계약과 맞지 않는다.',
'임의 바이너리 바이트는 기본 문자셋에서 유효한 텍스트가 아닐 수 있고 디코딩 과정에서 대체 처리가 일어나 정보가 손실될 수 있다.':'임의의 바이너리 바이트는 기본 문자셋에서 유효한 텍스트가 아닐 수 있고 디코딩 과정에서 대체 문자가 삽입되어 정보가 손실될 수 있다.',
'전체 파일 API이':'전체 파일 API가',
'ByteBuffer는 바이트-oriented NIO 버퍼다.':'ByteBuffer는 바이트 중심의 NIO 버퍼다.',
'바이트-to-문자 변환을 어느 경계에서 할지가 더 중요하다.':'바이트→문자 변환을 어느 경계에서 할지가 더 중요하다.',
})
replace_file('content/java/jvm-runtime/questions.json', {
'JVMS 클래스 파일 형식은 코드, 상수 풀, 필드/메서드와 속성을 표현한다.':'JVMS 클래스 파일 형식은 코드, 상수 풀, 필드·메서드 정보와 속성을 표현한다.',
'힙이 바이트코드를 다른 소스 프로그램으로 번역하지 않는다.':'JIT가 바이트코드를 다른 소스 프로그램으로 번역하는 것은 아니다.',
'int local이 반드시 힙에 있어야 하는 것은 아니다. JVMS의 local-변수 구조는 추상 모델이다.':'`int` 지역 변수가 반드시 힙에 있어야 하는 것은 아니다. JVMS의 지역 변수 구조는 추상 모델이다.',
'javap는 바이트코드 slot을 표시할 수 있지만 hardware address를 정하거나 실제 배치를':'javap는 바이트코드 슬롯을 표시할 수 있지만 하드웨어 주소를 정하거나 실제 배치를',
})
replace_file('content/java/jvm-runtime/jdk-jvm-classfile.md', {
'title: "JDK·JVM·class 파일의 경계"':'title: "JDK·JVM·클래스 파일의 경계"',
'summary: "Java 소스가 javac를 거쳐 class 파일이 되고 JVM이 이를 실행하는 흐름을 이해하며 JDK·JVM·바이트코드·네이티브 코드의 역할을 구분한다"':'summary: "Java 소스가 javac를 거쳐 클래스 파일이 되고 JVM이 이를 실행하는 흐름을 이해하며 JDK·JVM·바이트코드·네이티브 코드의 역할을 구분한다"',
'relationNote: JVM과 class file specification의 범위 확인':'relationNote: JVM과 클래스 파일 명세의 범위 확인',
'relationNote: Java source compile 단계 확인':'relationNote: Java 소스 컴파일 단계 확인',
'Java source (.java)':'Java 소스(.java)',
'class file (.class)':'클래스 파일(.class)',
'- class file과 JVM instruction의 의미':'- 클래스 파일과 JVM 명령의 의미',
'- GC collector':'- GC 컬렉터',
'- 구체적인 runtime 최적화':'- 구체적인 런타임 최적화',
'x86·ARM machine 명령':'x86·ARM 기계어 명령',
'클래스패스·module path나':'클래스패스·모듈 경로나',
})
replace_file('content/java/enum-modeling/enummap.md', {'title: "EnumMap으로 enum key 매핑하기"':'title: "EnumMap으로 enum 키 매핑하기"'})
replace_file('content/curriculum/java.yaml', {
'title: "EnumMap으로 enum key 매핑하기"':'title: "EnumMap으로 enum 키 매핑하기"',
'scope: JDK·JVM·class 파일, 바이트코드, 클래스 로딩, 런타임 데이터 영역, GC, 메모리, JIT와 기본 JVM 진단 도구를 다룬다.':'scope: JDK·JVM·클래스 파일, 바이트코드, 클래스 로딩, 런타임 데이터 영역, GC, 메모리, JIT와 기본 JVM 진단 도구를 다룬다.',
'title: "JDK·JVM·class 파일의 경계"':'title: "JDK·JVM·클래스 파일의 경계"',
})
replace_file('content/java/concurrency/questions.json', {'인터럽트()에 대한 설명으로 옳은 것은?':'`interrupt()`에 대한 설명으로 옳은 것은?'})
replace_file('content/java/exceptions-resources/questions.json', {
'중간 계층마다 동일 실패를 로그한 뒤 다시 던지면 한 장애가 여러 스택 trace로 중복되어 signal-to-noise가 나빠지고 장애 count도 부풀 수 있다. Repository나 애플리케이션 계층은 필요하면 현재 계층의 의미 있는 예외로 cause를 보존해 번역하되, 실제 요청 문맥과 correlation 정보를 가진 최종 처리 경계에서 한 번 로그하는 편이 명확하다. 중간 계층이 복구하거나 추가 정보를 제공할 수 있을 때만 별도 로그가 정당화된다.':'중간 계층마다 동일한 실패를 로그한 뒤 다시 던지면 한 장애가 여러 스택 추적으로 중복되어 유효한 신호가 묻히고 장애 건수도 부풀 수 있다. 저장소나 애플리케이션 계층은 필요하면 원인 예외(cause)를 보존한 채 현재 계층의 의미가 드러나는 예외로 번역하되, 실제 요청 문맥과 상관관계 정보를 가진 최종 처리 경계에서 한 번 로그하는 편이 명확하다. 중간 계층이 복구하거나 추가 정보를 제공할 수 있을 때만 별도 로그가 정당화된다.',
'DomainFailure의 getCause()에서 원래 예외를 연결해 볼 수 있다':'DomainFailure의 `getCause()`에서 원래 예외를 연결해 볼 수 있다',
'Cause를 보존하면 추상화 경계를 유지하면서도 운영 시 실제 원인을 추적할 수 있다.':'원인 예외(cause)를 보존하면 추상화 경계를 유지하면서도 운영 시 실제 원인을 추적할 수 있다.',
})
replace_file('content/java/generics/questions.json', {
'비검사 경고만 발생하고 raw List와 동일하게 대입된다':'비검사 경고만 발생하고 원시 타입(raw type) List와 동일하게 대입된다',
'List<Object>는 raw가 아니므로 raw-to-parameterized 비검사 변환 규칙으로 통과하지 않는다. 명시적인 컴파일 시점 타입 mismatch다.':'List<Object>는 원시 타입(raw type)이 아니므로 원시 타입에서 매개변수화 타입(parameterized type)으로의 비검사 변환 규칙으로 통과하지 않는다. 명시적인 컴파일 시점 타입 불일치다.',
'컴파일 오류다. Object로 타입화한 목록과 raw 목록의 비검사 대입은 다르다':'컴파일 오류다. Object로 타입화한 목록과 원시 타입(raw type) 목록의 비검사 대입은 다르다',
'두 List는 서로 다른 명시적 타입 argument를 가진 불변 조건 타입이라 컴파일 오류다. 현재 목록이 비었는지도 타입 관계를 바꾸지 않는다.':'두 List는 서로 다른 명시적 타입 인자(type argument)를 가진 불공변 타입이므로 컴파일 오류다. 현재 목록이 비었는지도 타입 관계를 바꾸지 않는다.',
'컴파일러는 리스트 size에 따라 제네릭 subtyping을 런타임 판정하지 않는다. 허용되지 않는 대입은 비었어도 컴파일 시점 오류다.':'컴파일러는 리스트 크기에 따라 제네릭 하위 타입 관계(subtyping)를 실행 시점에 판정하지 않는다. 허용되지 않는 대입은 비어 있어도 컴파일 시점 오류다.',
'List<Object>는 명확한 타입을 가진 parameterized 타입이다. List<String>에 직접 대입할 수 없으며 목록의 현재 원소나 크기는 컴파일 시 subtyping 규칙을 바꾸지 않는다.':'List<Object>는 명확한 타입 인자를 가진 매개변수화 타입(parameterized type)이다. List<String>에 직접 대입할 수 없으며 목록의 현재 원소나 크기는 컴파일 시점의 하위 타입 관계 규칙을 바꾸지 않는다.',
})

# Fix hybrid translations produced by general replacements.
GLOBAL_FIXES={
'읽기-modify-쓰기':'읽기-수정-쓰기(read-modify-write)','line/local-변수':'줄 번호/지역 변수','local-변수 slot':'지역 변수 슬롯',
'Blocking mode':'블로킹 모드','Non-블로킹 mode':'논블로킹 모드','Non-블로킹 channel':'논블로킹 채널','non-제네릭':'비제네릭',
'cross-스레드 edge':'스레드 간 간선(edge)','stale-문맥':'이전 문맥 누수','steady-상태':'정상 상태(steady state)',
'키-to-값':'키→값','insertion-순서':'삽입 순서','deep-복사':'깊은 복사','compare-and-집합':'compare-and-set',
'읽기-compute-쓰기':'읽기-계산-쓰기','읽기-add-쓰기':'읽기-추가-쓰기','non-비어 있음':'비어 있지 않은 상태',
'old-생성 증가':'old 세대 사용량 증가','on-힙':'힙 내부(on-heap)','네이티브/non-힙':'네이티브·힙 외부(non-heap)',
'dead-코드 elimination':'죽은 코드 제거(dead-code elimination)','natural-순서':'자연 순서','duplicate 키':'중복 키',
'Type erasure':'타입 소거(type erasure)','erasure는':'타입 소거는',' erasure에':' 타입 소거에','raw-to-parameterized':'원시 타입에서 매개변수화 타입으로',

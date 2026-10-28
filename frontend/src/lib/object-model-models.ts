/** Java 25 본문의 생성자 연결 예제. 클래스 초기화는 이미 끝난 정상 생성 경로다. */
export const initializationFrames = [
  { location: '기본값', name: 'null', fields: 0, blocks: 0, code: 'new Child();', output: [], explanation: '객체는 하나입니다. 상속된 필드를 포함한 인스턴스 필드에 기본값이 들어갔고 name은 null입니다.' },
  { location: 'Child() 전반부', name: 'null', fields: 0, blocks: 0, code: 'System.out.println("noarg prologue");\nthis("kim");', output: ['noarg prologue'], explanation: '전반부에서 출력한 뒤 this("kim")으로 같은 객체의 Child(String) 생성자에 위임합니다.' },
  { location: 'Child(String) 전반부', name: 'null', fields: 0, blocks: 0, code: 'if (name == null) throw new IllegalArgumentException();\nSystem.out.println("target prologue");', output: ['noarg prologue', 'target prologue'], explanation: '위임받은 생성자의 인자 name은 kim이므로 검증을 통과합니다. 아직 필드 name에 대입한 것은 아닙니다.' },
  { location: 'Parent() 실행', name: 'null', fields: 0, blocks: 0, code: 'super();\nParent() { System.out.println("parent"); }', output: ['noarg prologue', 'target prologue', 'parent'], explanation: 'Child(String)의 super() 호출로 Parent() 본문이 실행됩니다. 이 시점의 Child.name은 여전히 null입니다.' },
  { location: 'Child 필드 초기화 식', name: 'unset', fields: 1, blocks: 0, code: 'String name = initialName();', output: ['noarg prologue', 'target prologue', 'parent', 'field'], explanation: 'Parent()가 반환된 뒤 Child의 필드 초기화 식을 실행해 name이 unset이 됩니다.' },
  { location: 'Child 인스턴스 초기화 블록', name: 'unset', fields: 1, blocks: 1, code: '{ System.out.println("block:" + name); }', output: ['noarg prologue', 'target prologue', 'parent', 'field', 'block:unset'], explanation: '필드 초기화 식 다음에 선언된 블록이 실행됩니다. 두 초기화는 소스 순서를 따릅니다.' },
  { location: 'Child(String) 후반부', name: 'kim', fields: 1, blocks: 1, code: 'this.name = name;\nSystem.out.println("target epilogue:" + this.name);', output: ['noarg prologue', 'target prologue', 'parent', 'field', 'block:unset', 'target epilogue:kim'], explanation: '생성자 매개변수 kim을 필드에 대입하고 target epilogue:kim을 출력합니다.' },
  { location: 'Child() 후반부', name: 'kim', fields: 1, blocks: 1, code: 'System.out.println("noarg epilogue");', output: ['noarg prologue', 'target prologue', 'parent', 'field', 'block:unset', 'target epilogue:kim', 'noarg epilogue'], explanation: '위임한 생성자가 반환되었습니다. 필드와 블록을 반복하지 않고 원래 생성자의 후반부로 돌아옵니다.' },
] as const

export const dispatchFrames = [
  { phase: '컴파일 시 호출 검사', code: 'Animal animal = new Dog(); animal.sound();', result: '아직 실행 전', explanation: 'Animal이 제공하는 sound()를 호출할 수 있는지 검사하고 메서드 서명을 선택합니다. Dog에만 있는 fetch()는 이 참조로 바로 호출할 수 없습니다.' },
  { phase: '실제 수신 객체 확인', code: 'animal.sound(); // 실제 수신 객체는 Dog', result: 'Dog.sound() 선택', explanation: '실제 수신 객체는 Dog입니다. 선택된 인스턴스 메서드 sound()를 재정의한 Dog의 구현을 찾습니다.' },
  { phase: '선택된 구현 실행', code: 'animal.sound(); // Dog.sound 구현이 dog 출력', result: 'dog', explanation: '같은 한 번의 호출에서 Dog.sound()가 dog를 출력합니다. 필드와 static 메서드의 선택까지 같은 규칙으로 일반화하지 않습니다.' },
] as const

/** 목록 구조와 원소 참조를 분리한다. L1/L2/M/N은 논리적 식별자다. */
export const defensiveCopyFrames = [
  { shared: false, copied: false, expanded: false, member: 'kim', rejected: false, code: 'List<MutableMember> original = new ArrayList<>(List.of(member));', explanation: '원본 L1은 가변 목록이며 원소 M을 가리킵니다. M의 name은 kim입니다.' },
  { shared: true, copied: false, expanded: false, member: 'kim', rejected: false, code: 'List<MutableMember> shared = original;', explanation: '필드에 원본을 그대로 저장하는 Team처럼 shared도 L1을 가리킵니다. 목록 구조를 복사하지 않았습니다.' },
  { shared: true, copied: true, expanded: false, member: 'kim', rejected: false, code: 'List<MutableMember> copy = List.copyOf(original);', explanation: '수정 불가능한 목록 결과 L2를 얻었습니다. 원본의 후속 구조 변경은 전달되지 않지만 원소 참조 M은 공유됩니다. 일반적인 할당 횟수를 뜻하지 않습니다.' },
  { shared: true, copied: true, expanded: true, member: 'kim', rejected: false, code: 'original.add(new MutableMember("lee"));', explanation: 'L1과 shared에는 N이 추가됐지만 L2의 원소는 M 하나입니다. 입력 경계의 구조 복사가 후속 추가를 차단합니다.' },
  { shared: true, copied: true, expanded: true, member: 'park', rejected: false, code: 'member.name = "park";', explanation: 'M은 양쪽 목록이 공유하는 가변 객체입니다. M.name을 바꾸면 copy에서도 park가 보입니다. List.copyOf는 깊은 복사가 아닙니다.' },
  { shared: true, copied: true, expanded: true, member: 'park', rejected: true, code: 'copy.add(new MutableMember("x")); // UnsupportedOperationException', explanation: 'copy의 구조 변경은 거부됩니다. 목록과 원소의 상태는 직전 단계 그대로이며, 원소까지 불변이라는 보장은 생기지 않습니다.' },
] as const

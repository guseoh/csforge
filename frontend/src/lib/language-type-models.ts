import type { VisualizationOf } from './learning-visualization'

type ObjectId = 'A' | 'B'
export interface ValueFrame {
  variables: readonly { name: string; value: string; target?: ObjectId }[]
  objects: readonly { id: ObjectId; lines: readonly string[] }[]
  code: string
  explanation: string
}

/** 본문의 고정 예제만 표현하며 참조의 내부 표현이나 물리 배치는 모델링하지 않는다. */
const assignmentFrames: readonly ValueFrame[] = [
  { variables: [{ name: 'int a', value: '10' }], objects: [], code: 'int a = 10;', explanation: '원시 값의 예제입니다. a에는 정수 10이 들어 있습니다.' },
  { variables: [{ name: 'int a', value: '10' }, { name: 'int b', value: '10' }], objects: [], code: 'int b = a;', explanation: 'a의 값 10을 별도 변수 b에 복사했습니다. 변수 자체를 공유하지 않습니다.' },
  { variables: [{ name: 'int a', value: '10' }, { name: 'int b', value: '20' }], objects: [], code: 'b = 20;', explanation: 'b만 20이 됩니다. a는 10을 유지합니다.' },
  { variables: [{ name: 'Member first', value: '참조 A', target: 'A' }], objects: [{ id: 'A', lines: ['Member', 'name = null'] }], code: 'Member first = new Member();', explanation: '여기부터는 참조 값의 별도 예제입니다. first는 새 Member A를 가리키며 name의 기본값은 null입니다.' },
  { variables: [{ name: 'Member first', value: '참조 A', target: 'A' }], objects: [{ id: 'A', lines: ['Member', 'name = "kim"'] }], code: 'first.name = "kim";', explanation: 'first를 통해 A의 name을 kim으로 변경했습니다.' },
  { variables: [{ name: 'Member first', value: '참조 A', target: 'A' }, { name: 'Member second', value: '참조 A', target: 'A' }], objects: [{ id: 'A', lines: ['Member', 'name = "kim"'] }], code: 'Member second = first;', explanation: '참조 값 A만 second에 복사했습니다. 변수는 둘이지만 Member 객체는 같은 하나입니다.' },
  { variables: [{ name: 'Member first', value: '참조 A', target: 'A' }, { name: 'Member second', value: '참조 A', target: 'A' }], objects: [{ id: 'A', lines: ['Member', 'name = "lee"'] }], code: 'second.name = "lee";', explanation: '공유하는 A의 상태가 바뀌어 first.name도 lee입니다. 참조 값 자체는 바뀌지 않습니다.' },
  { variables: [{ name: 'Member first', value: '참조 A', target: 'A' }, { name: 'Member second', value: '참조 B', target: 'B' }], objects: [{ id: 'A', lines: ['Member', 'name = "lee"'] }, { id: 'B', lines: ['Member', 'name = null'] }], code: 'second = new Member();', explanation: 'second만 새 B의 참조로 바뀌었습니다. first는 A를 유지합니다.' },
  { variables: [{ name: 'Member first', value: '참조 A', target: 'A' }, { name: 'Member second', value: '참조 B', target: 'B' }], objects: [{ id: 'A', lines: ['Member', 'name = "lee"'] }, { id: 'B', lines: ['Member', 'name = "park"'] }], code: 'second.name = "park";', explanation: 'B만 park가 됩니다. first.name은 lee를 유지합니다.' },
]

const finalList: ValueFrame = {
  variables: [{ name: 'final List<String> names', value: '참조 A · 재대입 금지', target: 'A' }],
  objects: [{ id: 'A', lines: ['ArrayList', '["kim"]', 'add로 내용 변경 가능'] }],
  code: 'names.add("kim"); // 허용',
  explanation: 'final은 names의 참조 재대입을 막습니다. 이미 가리키는 ArrayList의 변경은 막지 않습니다.',
}
const internedString: ValueFrame = {
  variables: [{ name: 'String literal = "java"', value: '참조 A', target: 'A' }, { name: 'String pooled', value: '참조 A', target: 'A' }, { name: 'String created', value: '참조 B', target: 'B' }],
  objects: [{ id: 'A', lines: ['대표 String', '"java"'] }, { id: 'B', lines: ['new String("java")', '내용은 같고 별도 객체'] }],
  code: 'String pooled = created.intern();',
  explanation: '리터럴과 pooled는 A를 가리키고 created는 별도 B를 유지합니다. intern()은 created 변수를 재대입하거나 B를 변경하지 않습니다.',
}

export function valueReferenceFrames(example: VisualizationOf<'java-value-reference'>['example']): readonly ValueFrame[] {
  switch (example) {
    case 'assignment-copy': return assignmentFrames
    case 'final-list': return [finalList]
    case 'string-intern': return [internedString]
  }
}

export interface ArrayStoreFrame {
  alias: boolean
  elements: readonly [string | null, string | null]
  phase: 'created' | 'aliased' | 'accepted' | 'checking' | 'rejected'
  code: string
  explanation: string
}

/** 두 저장 문장은 컴파일되며, 두 번째 저장의 실패가 첫 저장을 되돌리지 않는다. */
export function arrayStoreFrames(): readonly ArrayStoreFrame[] {
  return [
    { alias: false, elements: [null, null], phase: 'created', code: 'String[] names = new String[2];', explanation: '실제 배열은 길이 2인 String[]입니다. 참조형 원소의 초기값은 null입니다.' },
    { alias: true, elements: [null, null], phase: 'aliased', code: 'Object[] values = names;', explanation: '배열 공변성으로 대입됩니다. 변수의 선언 타입만 Object[]이고 실제 배열은 여전히 같은 String[]입니다.' },
    { alias: true, elements: ['kim', null], phase: 'accepted', code: 'values[0] = "kim";', explanation: 'String 저장은 실제 원소 타입과 맞아 성공합니다. null도 저장할 수 있습니다.' },
    { alias: true, elements: ['kim', null], phase: 'checking', code: 'values[1] = Integer.valueOf(1);', explanation: '이 문장은 Object[]의 선언 타입에서 컴파일됩니다. 실행 시 실제 String[]의 원소 타입으로 검사하며 아직 저장하지 않았습니다.' },
    { alias: true, elements: ['kim', null], phase: 'rejected', code: 'values[1] = Integer.valueOf(1); // ArrayStoreException', explanation: 'Integer를 String[]에 넣을 수 없어 저장에 실패합니다. [1]은 null이고, 앞서 성공한 [0]의 kim은 그대로 남습니다. 배열 전체를 되돌리지 않습니다.' },
  ]
}

"""Check the approved batch against its immutable refactor baseline; emit review inventory."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
BASE = '786b25a9'
TOPICS = {'object-contracts': (5, 31), 'generics': (6, 37), 'collections': (9, 51), 'io-nio': (6, 35)}
NOTES = {
    'equals-contract': 'record 예시와 별도 필드 골격 구분, 동등성 계약과 상속 비대칭 검토, 분기 ASCII를 문장으로 통합',
    'hashcode-contract': 'Money 생성자 보완, 동등성의 단방향 해시 함의·충돌·가변 키·영구 ID 경계',
    'tostring-diagnostics': '진단 표현·비밀 노출·순환·호출 비용·직렬화 계약 분리 확인; 기존 설명 유지',
    'comparable-natural-order': '부호·추이성·0 비교의 제3값 일관성 보강, BigDecimal·오버플로·TreeSet 경계',
    'comparator-custom-order': '동률 분기 V1, reversed의 적용 범위와 고유 tie-break·null 정책 확인',
    'generic-types-methods': '클래스/메서드 타입 변수 범위·추론·컴파일 검사 검토, 빈 List 예외 조건 추가',
    'generic-invariance': '금지된 대입을 실제 실행처럼 표시하지 않는 반례 V1; 배열 공변성과 시점 구분',
    'wildcards-pecs': '기존 양쪽 경계 구조를 inline RESTYLE, T 값의 읽기/쓰기 방향과 null·clear 예외',
    'raw-types-unchecked': '로 타입과 primitive 용어 구분, 비검사 경고·외부 별칭의 위험 검토',
    'type-erasure-reifiable-types': '소거·reifiable·선언 메타데이터·Class 토큰/primitive 거절 설명 확인; 기존 설명 유지',
    'generic-varargs-heap-pollution': 'List[] 별칭 저장 통과와 String 변환 실패를 4단계로 분리; @SafeVarargs는 주장',
    'list-set-map-contracts': 'List 순서/중복·Set 동등성·Map 세 뷰의 기반 관계 검토, view V1',
    'arraylist-linkedlist-tradeoff': '참조 슬롯/연결 두 행 구조 inline RESTYLE, 탐색+연결 비용과 물리 배치 경계',
    'hashmap-hashing-collision': 'Aa/BB 고정 입력과 충돌·동등성·value 반환·miss V2; 특정 bucket·equals 호출 횟수 비보장',
    'hashset-set-semantics': 'add 반환값·충돌과 중복·가변 원소·순회 순서 검토; 중복 도식 없음',
    'sorted-collections-tree': '비교 0·범위 조회·복잡도 확인; equals 불일치 시 일반 Set 계약 위반 명시',
    'queue-deque-arraydeque': 'Queue 전체=FIFO 일반화 교정, 앞/뒤 V1과 예외/특별값·null·동시성 계약',
    'priorityqueue': '기존 V3 KEEP, 중복 ASCII 제거; head·동률·순회·원소 변경·JDK 배열 경계',
    'iterable-iterator-foreach-modification': 'remove 지원 반복자의 유효 순서 V1, optional 연산·best-effort fail-fast·배열 foreach 분리',
    'immutable-unmodifiable-collections': 'view의 구조 공유와 copyOf의 구조 분리/가변 원소 공유 V1; 깊은 복사·새 할당 비보장',
    'byte-character-stream-charset': 'InputStreamReader 디코딩 경계 V1, UTF-16 unit·byte·기본 charset·잘못된 디코딩/청크 잔여 바이트',
    'input-output-reader-writer': '바이트/문자 API와 실제 codec 경계, 부분 read·EOF·자원 소유권 확인, 중복 ASCII 통합',
    'buffered-io': 'Java 버퍼/flush/하위 계층 V1, 내구성·원격 수신 완료와 구분',
    'path-files-api': '경로 값/실제 I/O·상대 기준·exists 경합·bounded 처리·symlink/인가 경계, ASCII를 문장으로 통합',
    'nio-channel-buffer': 'capacity=8 고정 V2, partial I/O·flip·compact·clear와 논블로킹 0 busy-loop 교정',
    'blocking-nonblocking-selector': 'P0: key별 interest/ready 비트와 selected-key set 분리, 누적/제거/취소 6단계와 부분 I/O·EOF 경계',
}


def baseline(path):
    return subprocess.check_output(['git', 'show', f'{BASE}:{path}'], cwd=ROOT).decode('utf-8')


def sha(source):
    return hashlib.sha256(source.encode('utf-8')).hexdigest()


def metadata(source):
    header = source.split('---', 2)[1]
    return {key: re.search(rf'^{key}: (.*)$', header, re.M)[1] for key in ['kind', 'contentKey', 'topicContentKey', 'slug', 'title', 'level', 'status', 'displayOrder']}


def diff(a, b, path=''):
    if isinstance(a, dict) and isinstance(b, dict):
        return [p for k in a.keys() | b.keys() for p in diff(a.get(k), b.get(k), f'{path}.{k}')]
    if isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        return [p for i, (x, y) in enumerate(zip(a, b)) for p in diff(x, y, f'{path}[{i}]')]
    return [] if a == b else [path.lstrip('.')]


audit = json.loads((ROOT / 'docs/content-audit/issue-277/java.json').read_text(encoding='utf-8'))['concepts']
for topic, (nc, nq) in TOPICS.items():
    folder = ROOT / f'docs/content-corrections/issue-278/J-{topic}'
    folder.mkdir(parents=True, exist_ok=True)
    concepts = []
    for path in sorted((ROOT / f'content/java/{topic}').glob('*.md')):
        relative = path.relative_to(ROOT).as_posix()
        source, old = path.read_text(encoding='utf-8'), baseline(relative)
        assert metadata(source) == metadata(old), relative
        assert source.split('---', 2)[1] == old.split('---', 2)[1], relative
        c = next(c for c in audit if c['sourcePath'] == relative)
        declarations = re.findall(r'^```csforge-viz\n([\s\S]*?)^```', source, re.M)
        assert len(declarations) == (0 if c['targetTier'] == 'NONE' else 1), relative
        concepts.append(dict(path=relative, contentKey=c['contentKey'], baselineSha256=sha(old), reviewedSha256=sha(source), targetTier=c['targetTier'], auditDecision=c['changeDecision'], result='NO_VISUAL_NEEDED' if c['targetTier'] == 'NONE' else 'DONE', review=NOTES[path.stem], visualizations=[json.loads(d) for d in declarations]))
    path = f'content/java/{topic}/questions.json'
    source = (ROOT / path).read_text(encoding='utf-8')
    qs, old = json.loads(source), json.loads(baseline(path))
    assert len(concepts) == nc and len(qs) == nq
    questions = []
    for a, b in zip(old, qs):
        for key in ['contentKey', 'kind', 'questionType', 'difficulty', 'status', 'conceptKeys', 'correctChoiceKey', 'modelAnswer']:
            assert a.get(key) == b.get(key), (path, key, b['contentKey'])
        assert [(c['key'], c['displayOrder']) for c in a.get('choices', [])] == [(c['key'], c['displayOrder']) for c in b.get('choices', [])]
        questions.append(dict(contentKey=b['contentKey'], result='CORRECTED' if a != b else 'KEEP', changedFields=sorted(diff(a, b)), reviewedSha256=sha(json.dumps(b, ensure_ascii=False, sort_keys=True))))
    record = dict(baseline=BASE, reviewedAt='2026-10-28', topic=f'J-{topic}', counts=dict(concepts=nc, questions=nq), concepts=concepts, questions=questions, questionFileSha256=sha(source), stableMetadataAndAnswerKeysPreserved=True)
    (folder / 'review.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'J-{topic}: {nc} Concepts / {nq} Questions; stable metadata/choice keys/answers preserved')

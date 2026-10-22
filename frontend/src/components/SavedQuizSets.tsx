import { useEffect, useState } from 'react'
import { getAvailableConceptIdsForPractice } from '../lib/learning-api'
import { csvValues } from '../lib/quiz-search'
import type { QuizSearch } from '../lib/quiz-search'
import {
  SAVED_QUIZ_SETS_KEY, decodeSavedQuizSets, deleteQuizSet, encodeSavedQuizSets,
  renameQuizSet, saveQuizSet, type SavedQuizSet,
} from '../lib/saved-quiz-sets'

function readSets(): SavedQuizSet[] {
  try { return decodeSavedQuizSets(localStorage.getItem(SAVED_QUIZ_SETS_KEY)) }
  catch { return [] }
}

/** Browser-local preference; actual Quiz attempts and progress remain persisted server-side. */
export function SavedQuizSets({ current, onApply }: { current: QuizSearch; onApply: (settings: QuizSearch) => void }) {
  const [sets, setSets] = useState(readSets)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [staleScope, setStaleScope] = useState<{
    item: SavedQuizSet; activeIds: number[]; missingIds: number[]
  } | null>(null)

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === SAVED_QUIZ_SETS_KEY || event.key === null) setSets(readSets())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const commit = (next: SavedQuizSet[]) => {
    try {
      localStorage.setItem(SAVED_QUIZ_SETS_KEY, encodeSavedQuizSets(next))
      setSets(next)
      setError('')
      return true
    } catch {
      setError('브라우저 설정을 저장하지 못했습니다. 저장 공간과 브라우저 설정을 확인하세요.')
      return false
    }
  }
  const apply = async (item: SavedQuizSet) => {
    setStaleScope(null)
    setError('')
    const requested = csvValues(item.settings.concepts).map(Number)
    if (requested.length === 0) {
      onApply({ ...item.settings })
      return
    }
    if (requested.length > 100) {
      setError('지정된 Concept가 100개를 초과합니다. 세트를 나누거나 조건을 수정해 주세요.')
      return
    }
    setCheckingId(item.id)
    try {
      const active = new Set(await getAvailableConceptIdsForPractice(requested))
      const missingIds = requested.filter(id => !active.has(id))
      if (!missingIds.length) {
        onApply({ ...item.settings })
      } else {
        setStaleScope({ item, activeIds: requested.filter(id => active.has(id)), missingIds })
      }
    } catch {
      setError('저장된 Concept 범위를 확인하지 못했습니다. 서버 연결을 확인하고 다시 불러오세요.')
    } finally {
      setCheckingId(null)
    }
  }

  const add = () => {
    try {
      if (commit(saveQuizSet(sets, name, current, crypto.randomUUID()))) setName('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : '세트를 저장할 수 없습니다.') }
  }
  const rename = (id: string) => {
    try {
      if (commit(renameQuizSet(sets, id, editName))) setEditingId(null)
    } catch (reason) { setError(reason instanceof Error ? reason.message : '이름을 변경할 수 없습니다.') }
  }

  return <section className="saved-quiz-sets" aria-labelledby="saved-quiz-sets-title">
    <div><p className="eyebrow">자주 쓰는 조건</p><h2 id="saved-quiz-sets-title">나의 Quiz 세트</h2></div>
    <p className="helper-text">설정은 현재 브라우저에만 보관됩니다. 로그인해도 다른 브라우저와 동기화되지 않습니다. 풀이·학습 기록은 서버에 보존됩니다.</p>
    <div className="saved-quiz-create">
      <label htmlFor="saved-quiz-name">현재 조건 저장</label>
      <input id="saved-quiz-name" value={name} maxLength={50} placeholder="예: Java 면접 대비"
        onChange={event => setName(event.target.value)} />
      <button type="button" className="secondary-button" onClick={add}>세트 저장</button>
    </div>
    {error && <p className="helper-text error-text" role="alert">{error}</p>}
    {staleScope && <div className="state-card saved-quiz-scope-warning" role="alert">
      <strong>저장한 Quiz 세트의 일부 Concept를 사용할 수 없습니다.</strong>
      <p>‘{staleScope.item.name}’의 공개 Concept {staleScope.activeIds.length}개 ·
        누락·비공개 {staleScope.missingIds.length}개
        (ID: {staleScope.missingIds.slice(0, 10).join(', ')}{staleScope.missingIds.length > 10 ? ' 외' : ''}).
        원래 범위를 자동 변경하지 않았습니다.</p>
      <div className="saved-quiz-actions">
        {staleScope.activeIds.length > 0 && <button type="button" className="secondary-button"
          onClick={() => {
            onApply({ ...staleScope.item.settings, concepts: staleScope.activeIds.join(',') })
            setStaleScope(null)
          }}>공개된 {staleScope.activeIds.length}개만 불러오기</button>}
        {staleScope.activeIds.length === 0 && <p>사용 가능한 Concept가 없습니다. 세트의 범위를 변경하세요. 전체 문제로 자동 전환하지 않습니다.</p>}
        <button type="button" className="text-button" onClick={() => setStaleScope(null)}>취소</button>
      </div>
    </div>
    {sets.length === 0 ? <p className="helper-text">저장한 세트가 없습니다. 위에서 현재 Quiz 조건을 저장하세요.</p> :
      <ul className="saved-quiz-list">
        {sets.map(item => <li key={item.id}>
          <div><strong>{item.name}</strong><small>{item.settings.concepts ? '개념 지정 · ' : ''}{item.settings.areas || '모든 영역'} · {item.settings.count}문항</small></div>
          {editingId === item.id ? <div className="saved-quiz-edit">
            <input aria-label={`${item.name} 이름 수정`} value={editName} maxLength={50}
              onChange={event => setEditName(event.target.value)} />
            <button type="button" className="text-button" onClick={() => rename(item.id)}>이름 저장</button>
            <button type="button" className="text-button" onClick={() => setEditingId(null)}>취소</button>
          </div> : deletingId === item.id ? <div className="saved-quiz-edit">
            <span>정말 삭제할까요?</span>
            <button type="button" className="text-button" onClick={() => {
              if (commit(deleteQuizSet(sets, item.id))) setDeletingId(null)
            }}>삭제 확인</button>
            <button type="button" className="text-button" onClick={() => setDeletingId(null)}>취소</button>
          </div> : <div className="saved-quiz-actions">
            <button type="button" className="secondary-button" disabled={checkingId !== null}
              onClick={() => { void apply(item) }}>{checkingId === item.id ? 'Concept 확인 중…' : '불러오기'}</button>
            <button type="button" className="text-button" onClick={() => { setEditingId(item.id); setEditName(item.name); setDeletingId(null) }}>이름 변경</button>
            <button type="button" className="text-button" onClick={() => { setDeletingId(item.id); setEditingId(null) }}>삭제</button>
          </div>}
        </li>)}
      </ul>}
  </section>
}

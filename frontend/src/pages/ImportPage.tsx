import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ApiRequestError } from '../lib/http'
import { applyImports, previewImports, type ImportApply, type ImportItem, type ImportPreview } from '../lib/import-api'

function mergeFiles(current: File[], incoming: File[]) {
  const seen = new Set(current.map((file) => `${file.name}:${file.size}:${file.lastModified}`))
  return [...current, ...incoming.filter((file) => !seen.has(`${file.name}:${file.size}:${file.lastModified}`))]
}

function ItemRow({ item }: { item: ImportItem }) {
  return <details className="import-item"><summary><span>{item.classification}</span><strong>{item.contentKey ?? item.fileName}</strong><small>{item.kind ?? 'FILE'} · 항목 {item.itemIndex + 1}</small></summary>{item.reason && <p className="error-text">{item.reason}</p>}{item.errors.map((error) => <p key={`${error.path}-${error.message}`} className="error-text">{error.path}: {error.message}</p>)}{item.diffs.length > 0 && <div className="import-diffs">{item.diffs.map((diff) => <div key={diff.field}><strong>{diff.field}</strong><span>{diff.before ?? '∅'} → {diff.after ?? '∅'}</span></div>)}</div>}</details>
}

function Summary({ totals }: { totals: { created: number; updated: number; unchanged: number; skipped: number; errors?: number; failed?: number } }) {
  return <div className="review-summary-grid import-summary"><div><span>새로 생성</span><strong>{totals.created}</strong></div><div><span>수정</span><strong>{totals.updated}</strong></div><div><span>변경 없음</span><strong>{totals.unchanged}</strong></div><div><span>건너뜀</span><strong>{totals.skipped}</strong></div><div><span>{totals.errors === undefined ? '실패' : '오류'}</span><strong>{totals.errors ?? totals.failed ?? 0}</strong></div></div>
}

function WorkflowSteps({ current }: { current: number }) {
  const steps = ['파일 선택', '미리보기', '차이·검증', '확인', '결과']
  return (
    <ol className="import-workflow" aria-label="콘텐츠 가져오기 단계">
      {steps.map((label, index) => (
        <li className={`import-step ${index + 1 === current ? 'current' : index + 1 < current ? 'done' : ''}`} key={label} aria-current={index + 1 === current ? 'step' : undefined}>
          <strong>{index + 1}. {label}</strong>
          <span>{index + 1 === current ? '현재 단계' : index + 1 < current ? '완료' : '대기'}</span>
        </li>
      ))}
    </ol>
  )
}

export function ImportPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [result, setResult] = useState<ImportApply | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const choose = (selected: File[]) => { setFiles((current) => mergeFiles(current, selected)); setPreview(null); setResult(null); setMessage(null) }
  const runPreview = async () => { if (files.length === 0) return; setPending(true); setMessage(null); setResult(null); try { setPreview(await previewImports(files)) } catch { setMessage('미리보기 요청에 실패했습니다. 파일과 서버 상태를 확인하세요.') } finally { setPending(false) } }
  const runApply = async () => { if (!preview?.canApply) return; setPending(true); setMessage(null); try { setResult(await applyImports(files, preview.previewDigest)); setPreview(null) } catch (error) { if (error instanceof ApiRequestError && error.status === 409) { setPreview(null); setMessage('미리보기가 오래되었습니다. 현재 상태를 다시 확인하세요.') } else setMessage('콘텐츠 가져오기에 실패했습니다. 다시 시도하세요.') } finally { setPending(false) } }
  const currentStep = result ? 5 : preview ? (preview.canApply ? 4 : 3) : files.length > 0 ? 2 : 1
  return <section className="page-section import-page"><div className="page-heading"><div><p className="eyebrow">기본 학습 콘텐츠</p><h1>콘텐츠 가져오기</h1><p className="lead">Markdown과 JSON을 검증한 뒤 개념과 문제를 안전하게 반영합니다.</p></div><button className="text-button" type="button" onClick={() => void navigate({ to: '/learning', search: { level: 'all', status: 'ALL', bookmarked: 'false', q: '', page: 0, sort: 'curriculum' } })}>학습 화면 보기</button></div><WorkflowSteps current={currentStep} /><label className="import-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(Array.from(event.dataTransfer.files)) }}><strong>파일을 끌어 놓거나 선택하세요</strong><span>.md / .json · 여러 파일 가능</span><span className="import-file-picker-trigger" aria-hidden="true">파일 선택</span><input className="import-file-input" type="file" accept=".md,.json" multiple aria-label="파일 선택" onChange={(event) => choose(Array.from(event.target.files ?? []))} /></label>{files.length > 0 && <section className="import-stage import-files" aria-labelledby="selected-files-heading"><div className="section-heading"><div><p className="eyebrow">1단계</p><h2 id="selected-files-heading">선택한 파일</h2></div><button className="secondary-button" type="button" onClick={() => { setFiles([]); setPreview(null); setResult(null) }}>전체 지우기</button></div>{files.map((file) => <div className="import-file" key={`${file.name}:${file.lastModified}`}><span>{file.name}</span><small>{Math.ceil(file.size / 1024)} KB</small><button type="button" aria-label={`${file.name} 제거`} onClick={() => { setFiles((current) => current.filter((candidate) => candidate !== file)); setPreview(null) }}>제거</button></div>)}<button className="primary-button" type="button" disabled={pending} onClick={() => void runPreview()}>{pending ? '검증 중…' : '미리보기'}</button></section>}{message && <div className="state-card error-text" role="alert">{message}<button className="secondary-button" type="button" onClick={() => void runPreview()}>다시 미리보기</button></div>}{preview && <section className="import-stage import-result" aria-labelledby="preview-heading"><div className="section-heading"><div><p className="eyebrow">2–3단계</p><h2 id="preview-heading">미리보기와 검증</h2></div><span className={`chip ${preview.canApply ? 'state-active' : 'ai-state-failed'}`}>{preview.canApply ? '반영 가능' : '오류로 중단'}</span></div><Summary totals={preview.totals} /><div className="import-items">{preview.items.map((item) => <ItemRow key={`${item.fileName}:${item.itemIndex}`} item={item} />)}</div><div className="import-confirm"><p className="helper-text">{preview.canApply ? '변경 내용을 확인한 뒤 콘텐츠 반영을 실행하세요.' : '오류를 해결한 뒤 다시 미리보기해야 콘텐츠를 반영할 수 있습니다.'}</p><button className="primary-button" type="button" disabled={!preview.canApply || pending} onClick={() => void runApply()}>{pending ? '반영 중…' : '콘텐츠 반영'}</button></div></section>}{result && <section className="import-stage import-result" aria-labelledby="import-complete-heading"><div className="section-heading"><div><p className="eyebrow">5단계</p><h2 id="import-complete-heading">가져오기 완료</h2></div><span className="chip state-active">저장됨</span></div><Summary totals={result.totals} /><p>기본 학습 콘텐츠가 저장되었습니다. 같은 파일을 다시 미리보기하면 변경 없음으로 표시됩니다.</p></section>}</section>
}

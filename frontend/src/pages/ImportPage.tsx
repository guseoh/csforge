import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ApiRequestError, applyImports, previewImports, type ImportApply, type ImportItem, type ImportPreview } from '../lib/api'

function mergeFiles(current: File[], incoming: File[]) {
  const seen = new Set(current.map((file) => `${file.name}:${file.size}:${file.lastModified}`))
  return [...current, ...incoming.filter((file) => !seen.has(`${file.name}:${file.size}:${file.lastModified}`))]
}

function ItemRow({ item }: { item: ImportItem }) {
  return <details className="import-item"><summary><span>{item.classification}</span><strong>{item.contentKey ?? item.fileName}</strong><small>{item.kind ?? 'FILE'} · item {item.itemIndex + 1}</small></summary>{item.reason && <p className="error-text">{item.reason}</p>}{item.errors.map((error) => <p key={`${error.path}-${error.message}`} className="error-text">{error.path}: {error.message}</p>)}{item.diffs.length > 0 && <div className="import-diffs">{item.diffs.map((diff) => <div key={diff.field}><strong>{diff.field}</strong><span>{diff.before ?? '∅'} → {diff.after ?? '∅'}</span></div>)}</div>}</details>
}

function Summary({ totals }: { totals: { created: number; updated: number; unchanged: number; skipped: number; errors?: number; failed?: number } }) {
  return <div className="review-summary-grid import-summary"><div><span>Created</span><strong>{totals.created}</strong></div><div><span>Updated</span><strong>{totals.updated}</strong></div><div><span>Unchanged</span><strong>{totals.unchanged}</strong></div><div><span>Skipped</span><strong>{totals.skipped}</strong></div><div><span>{totals.errors === undefined ? 'Failed' : 'Errors'}</span><strong>{totals.errors ?? totals.failed ?? 0}</strong></div></div>
}

export function ImportPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [result, setResult] = useState<ImportApply | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const choose = (selected: File[]) => { setFiles((current) => mergeFiles(current, selected)); setPreview(null); setResult(null); setMessage(null) }
  const runPreview = async () => { if (files.length === 0) return; setPending(true); setMessage(null); setResult(null); try { setPreview(await previewImports(files)) } catch { setMessage('Preview 요청에 실패했습니다. 파일과 서버 상태를 확인하세요.') } finally { setPending(false) } }
  const runApply = async () => { if (!preview?.canApply) return; setPending(true); setMessage(null); try { setResult(await applyImports(files, preview.previewDigest)); setPreview(null) } catch (error) { if (error instanceof ApiRequestError && error.status === 409) { setPreview(null); setMessage('Preview가 오래되었습니다. 현재 상태를 다시 Preview하세요.') } else setMessage('Import에 실패했습니다. 다시 시도하세요.') } finally { setPending(false) } }
  return <section className="page-section"><div className="page-heading"><div><p className="eyebrow">Canonical content</p><h1>Content import</h1><p className="lead">Markdown과 JSON을 검증한 뒤 Concept과 Question을 안전하게 반영합니다.</p></div><button className="text-link" onClick={() => void navigate({ to: '/learning', search: { level: 'all', status: 'ALL', bookmarked: 'false', q: '', page: 0, sort: 'curriculum' } })}>Learning 보기</button></div><label className="import-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(Array.from(event.dataTransfer.files)) }}><strong>파일을 끌어 놓거나 선택하세요</strong><span>.md / .json · 여러 파일 가능</span><input type="file" accept=".md,.json" multiple onChange={(event) => choose(Array.from(event.target.files ?? []))} /></label>{files.length > 0 && <div className="import-files"><div className="section-heading"><h2>Selected files</h2><button className="secondary-button" onClick={() => { setFiles([]); setPreview(null); setResult(null) }}>Clear</button></div>{files.map((file) => <div className="import-file" key={`${file.name}:${file.lastModified}`}><span>{file.name}</span><small>{Math.ceil(file.size / 1024)} KB</small><button aria-label={`${file.name} remove`} onClick={() => { setFiles((current) => current.filter((candidate) => candidate !== file)); setPreview(null) }}>Remove</button></div>)}<button className="primary-button" disabled={pending} onClick={() => void runPreview()}>{pending ? '검증 중…' : 'Preview'}</button></div>}{message && <div className="state-card error-text" role="alert">{message}<button className="secondary-button" onClick={() => void runPreview()}>Preview again</button></div>}{preview && <div className="import-result"><div className="section-heading"><h2>Preview</h2><span className="chip">{preview.canApply ? 'Ready to apply' : 'Blocked by errors'}</span></div><Summary totals={preview.totals} /><div className="import-items">{preview.items.map((item) => <ItemRow key={`${item.fileName}:${item.itemIndex}`} item={item} />)}</div><button className="primary-button" disabled={!preview.canApply || pending} onClick={() => void runApply()}>{pending ? 'Import 중…' : 'Confirm Import'}</button></div>}{result && <div className="import-result"><div className="section-heading"><h2>Import complete</h2><span className="chip">Saved</span></div><Summary totals={result.totals} /><p>Canonical content가 저장되었습니다. 같은 파일을 다시 Preview하면 UNCHANGED로 표시됩니다.</p></div>}</section>
}

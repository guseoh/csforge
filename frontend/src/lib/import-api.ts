import { request } from './http'

export type ImportClassification = 'CREATED' | 'UPDATED' | 'UNCHANGED' | 'SKIPPED' | 'ERROR'

export interface ImportItem {
  fileName: string
  itemIndex: number
  kind: 'TOPIC' | 'CONCEPT' | 'QUESTION' | null
  contentKey: string | null
  classification: ImportClassification
  reason: string | null
  errors: { path: string; message: string }[]
  diffs: { field: string; before: string | null; after: string | null }[]
}

export interface ImportPreview {
  previewDigest: string
  files: { fileName: string; itemCount: number }[]
  totals: { created: number; updated: number; unchanged: number; skipped: number; errors: number }
  items: ImportItem[]
  canApply: boolean
}

export interface ImportApply {
  previewDigest: string
  totals: { created: number; updated: number; unchanged: number; skipped: number; failed: number }
  items: ImportItem[]
}

async function importRequest<T>(path: string, files: File[], digest?: string): Promise<T> {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  if (digest) form.append('previewDigest', digest)
  return request<T>(path, { method: 'POST', body: form })
}

export function previewImports(files: File[]): Promise<ImportPreview> {
  return importRequest<ImportPreview>('/api/imports/preview', files)
}

export function applyImports(files: File[], digest: string): Promise<ImportApply> {
  return importRequest<ImportApply>('/api/imports/apply', files, digest)
}

export type CanonicalBootstrapState = 'EMPTY' | 'PARTIAL' | 'READY'

export interface CanonicalBootstrapCounts {
  learningAreas: number
  topics: number
  concepts: number
  questions: number
}

export interface CanonicalBootstrapItems {
  topics: number
  concepts: number
  questions: number
}

export interface CanonicalBootstrapTotals {
  created: number
  updated: number
  unchanged: number
  skipped: number
  errors: number
  failed: number
}

export interface CanonicalBootstrapStatus {
  state: CanonicalBootstrapState
  sourceFileCount: number
  totalBatches: number
  readyBatches: number
  totalItems: number
  canonicalItems: CanonicalBootstrapItems
  currentCounts: CanonicalBootstrapCounts
}

export interface CanonicalBootstrapResult {
  success: boolean
  state: CanonicalBootstrapState
  sourceFileCount: number
  totalBatches: number
  completedBatches: number
  totalItems: number
  failedBatch: number | null
  failedKind: 'TOPIC' | 'CONCEPT' | 'QUESTION' | null
  failureMessage: string | null
  totals: CanonicalBootstrapTotals
  currentCounts: CanonicalBootstrapCounts
}

export function getCanonicalBootstrapStatus(): Promise<CanonicalBootstrapStatus> {
  return request('/api/canonical-bootstrap/status')
}

export function bootstrapCanonicalContent(): Promise<CanonicalBootstrapResult> {
  return request('/api/canonical-bootstrap', { method: 'POST' })
}

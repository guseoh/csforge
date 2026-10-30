import type { ReferenceDetail, ReferenceType } from '../lib/learning-api'

const referenceTypeLabels: Record<ReferenceType, string> = {
  OFFICIAL: '공식 자료',
  KOREAN_BLOG: '한글 기술 자료',
  COMPANY_TECH_BLOG: '기업 기술 블로그',
  BOOK: '책',
  PAPER: '논문',
  COURSE: '강의',
  OTHER: '기타',
}

const languageLabels: Record<string, string> = {
  ko: '한국어',
  'ko-kr': '한국어',
  en: '영어',
  'en-us': '영어',
  'en-gb': '영어',
}

const depthLabels: Record<string, string> = {
  section: '관련 절',
  chapter: '관련 장',
  overview: '개요',
  article: '관련 글',
  page: '관련 페이지',
  guide: '안내서',
  documentation: '기술 문서',
  reference: '참조 문서',
}

function textOrNull(value: string | null): string | null {
  return value?.trim() || null
}

function referenceUrl(url: string): string | null {
  try {
    const candidate = url.trim()
    const parsed = new URL(candidate)
    if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.hostname) return candidate
  } catch {
    // Missing or malformed URLs must never become navigable links.
  }
  return null
}

function ReferenceEntry({ reference }: { reference: ReferenceDetail }) {
  const url = referenceUrl(reference.url)
  const language = reference.language && languageLabels[reference.language.trim().toLowerCase()]
  const depth = reference.depth && depthLabels[reference.depth.trim().toLowerCase()]
  const metadata = [referenceTypeLabels[reference.type], language, depth].filter(Boolean).join(' · ')
  const recommendation = textOrNull(reference.recommendation)
  const relationNote = textOrNull(reference.relationNote)
  const uniqueNote = relationNote !== recommendation ? relationNote : null

  const detail = (
    <>
      <div className="reference-item-body">
        <strong className="reference-item-title">{reference.title}</strong>
        <span className="reference-item-metadata">{metadata}</span>
        {recommendation && (
          <p className="reference-item-guidance">
            <span className="reference-item-guidance-label">자료 추천 이유</span>
            <span>{recommendation}</span>
          </p>
        )}
        {uniqueNote && (
          <p className="reference-item-guidance">
            <span className="reference-item-guidance-label">이 개념에서 확인할 점</span>
            <span>{uniqueNote}</span>
          </p>
        )}
      </div>
      {url
        ? <span className="reference-item-open">새 탭에서 열기 <span aria-hidden="true">↗</span></span>
        : <span className="reference-item-unavailable-message">링크 주소를 확인할 수 없습니다.</span>}
    </>
  )

  return url ? (
    <a className="reference-item" href={url} target="_blank" rel="noopener noreferrer">
      {detail}
    </a>
  ) : (
    <div className="reference-item reference-item-unavailable">
      {detail}
    </div>
  )
}

export function ConceptReferences({ references }: { references: ReferenceDetail[] }) {
  return (
    <div className="reference-list">
      {references.map((reference) => <ReferenceEntry key={reference.id} reference={reference} />)}
    </div>
  )
}

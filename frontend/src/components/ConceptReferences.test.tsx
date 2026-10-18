import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ReferenceDetail } from '../lib/learning-api'
import { ConceptReferences } from './ConceptReferences'

const basic: ReferenceDetail = {
  id: 1,
  url: 'https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details-service.html',
  title: 'Spring Security Reference: UserDetailsService',
  type: 'OFFICIAL',
  language: 'en',
  depth: 'section',
  recommendation: '공식 계약에서 조회 책임을 확인한다.',
  relationNote: 'DaoAuthenticationProvider와 PasswordEncoder의 검증 책임은 별개다.',
  displayOrder: 1,
}

function render(references: ReferenceDetail[]) {
  return renderToStaticMarkup(<ConceptReferences references={references} />)
}

describe('ConceptReferences', () => {
  it('explains language, reading depth and distinct recommendation vs. concept-specific guidance', () => {
    const html = render([basic])
    expect(html).toContain('공식 자료 · 영어 · 관련 절')
    expect(html).toContain('자료 추천 이유')
    expect(html).toContain('공식 계약에서 조회 책임을 확인한다.')
    expect(html).toContain('이 개념에서 확인할 점')
    expect(html).toContain('DaoAuthenticationProvider와 PasswordEncoder')
    expect(html).toContain('새 탭에서 열기')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).not.toContain(' · en')
    expect(html).not.toContain(' · section')
  })

  it('shows only the available guidance, with no duplicated copy or empty labels', () => {
    const html = render([
      { ...basic, id: 2, recommendation: null, relationNote: '특정 절에만 해당' },
      { ...basic, id: 3, recommendation: '같은 문구', relationNote: '같은 문구' },
      { ...basic, id: 4, recommendation: '  ', relationNote: null },
    ])
    expect((html.match(/자료 추천 이유/g) ?? [])).toHaveLength(1)
    expect((html.match(/이 개념에서 확인할 점/g) ?? [])).toHaveLength(1)
    expect((html.match(/같은 문구/g) ?? [])).toHaveLength(1)
    expect(html).toContain('특정 절에만 해당')
  })

  it('omits unrecognized language/depth values instead of inventing translations', () => {
    const html = render([{ ...basic, language: 'xx-XX', depth: 'unspecified' }])
    expect(html).toContain('공식 자료')
    expect(html).not.toContain('xx-XX')
    expect(html).not.toContain('unspecified')
    expect(render([{ ...basic, language: 'ko-KR', depth: 'chapter' }])).toContain('한국어 · 관련 장')
  })

  it('does not expose unsupported external URLs as clickable links', () => {
    const html = render([
      { ...basic, id: 1, url: 'javascript:alert(1)' },
      { ...basic, id: 2, url: 'not a url' },
      { ...basic, id: 3, url: 'data:text/html,unsafe' },
      { ...basic, id: 4, url: 'https://' },
    ])
    expect(html).not.toContain('<a ')
    expect((html.match(/링크 주소를 확인할 수 없습니다/g) ?? [])).toHaveLength(4)
    expect(html).toContain('reference-item-unavailable')
  })

  it('keeps long text as text, escapes injected HTML and preserves order', () => {
    const html = render([
      { ...basic, id: 7, title: '학습 ' + '이름'.repeat(120) + '<script>alert(1)</script>' },
      { ...basic, id: 8, url: 'https://example.com/other', title: '두 번째' },
    ])
    expect(html.indexOf('학습 ')).toBeLessThan(html.indexOf('두 번째'))
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
    expect((html.match(/class="reference-item"/g) ?? [])).toHaveLength(2)
  })

  it('renders an empty list without phantom external links', () => {
    const html = render([])
    expect(html).toContain('reference-list')
    expect(html).not.toContain('새 탭에서 열기')
    expect(html).not.toContain('reference-item-open')
  })
})

import { describe, expect, it } from 'vitest'
import { learningSearchForTopic, parseLearningSearch } from './learning-search'

describe('learning URL search state', () => {
  it('parses filters and pagination from URL values', () => {
    const search = Object.fromEntries(
      new URLSearchParams('topic=12&level=2&status=COMPLETED&bookmarked=true&q=JPA&page=3&sort=title'),
    )

    expect(parseLearningSearch(search)).toEqual({
      topic: 12,
      level: '2',
      status: 'COMPLETED',
      bookmarked: 'true',
      q: 'JPA',
      page: 3,
      sort: 'title',
    })
  })

  it('falls back to safe defaults for invalid values', () => {
    expect(parseLearningSearch({ level: 'invalid', page: '-1', sort: 'random' })).toEqual({
      level: 'all',
      status: 'ALL',
      bookmarked: 'false',
      q: '',
      page: 0,
      sort: 'curriculum',
    })
  })

  it('preserves active filters when selecting a topic and resets pagination', () => {
    expect(learningSearchForTopic({
      topic: 12,
      level: '2',
      status: 'COMPLETED',
      bookmarked: 'true',
      q: 'JPA',
      page: 3,
      sort: 'title',
    }, 27)).toEqual({
      topic: 27,
      level: '2',
      status: 'COMPLETED',
      bookmarked: 'true',
      q: 'JPA',
      page: 0,
      sort: 'title',
    })
  })
})

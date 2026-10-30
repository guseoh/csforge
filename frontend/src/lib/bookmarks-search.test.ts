import { describe, expect, it } from 'vitest'
import { parseBookmarksSearch } from './bookmarks-search'

describe('bookmark URL state', () => {
  it('accepts a category and page', () => {
    expect(parseBookmarksSearch({ category: '2', page: '3' })).toEqual({ category: 2, page: 3 })
  })
  it('ignores invalid ids and pagination', () => {
    expect(parseBookmarksSearch({ category: '-1', page: 'bad' })).toEqual({ page: 0 })
  })
})

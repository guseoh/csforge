import { describe, expect, it } from 'vitest'
import { parseInsightsSearch } from './insights-search'

describe('dashboard learning insight route state', () => {
  it('defaults to an unopened, 7-day view without polluting Dashboard', () => {
    expect(parseInsightsSearch({})).toEqual({
      insightsOpen: '0', insightsRange: '7d', insightsArea: '',
    })
  })

  it('restores a shared period and learning area while rejecting invalid ranges', () => {
    expect(parseInsightsSearch({ insightsOpen: '1', insightsRange: '30d', insightsArea: 'java' })).toEqual({
      insightsOpen: '1', insightsRange: '30d', insightsArea: 'java',
    })
    expect(parseInsightsSearch({ insightsOpen: 'other', insightsRange: '2y', insightsArea: 42 })).toEqual({
      insightsOpen: '0', insightsRange: '7d', insightsArea: '',
    })
  })
})

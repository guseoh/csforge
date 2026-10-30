import { describe, expect, it } from 'vitest'
import { dismissHeaderPopover, toggleHeaderPopover } from './header-popovers'

describe('header popovers', () => {
  it('opens a selected popover, closes it on a repeated trigger, and switches menus', () => {
    expect(toggleHeaderPopover(null, 'utility')).toBe('utility')
    expect(toggleHeaderPopover('utility', 'utility')).toBeNull()
    expect(toggleHeaderPopover('utility', 'account')).toBe('account')
  })

  it('keeps the active popover open for inside pointer events and closes it outside', () => {
    expect(dismissHeaderPopover('utility', { type: 'pointerdown', targetPopover: 'utility' })).toBe('utility')
    expect(dismissHeaderPopover('utility', { type: 'pointerdown', targetPopover: 'account' })).toBeNull()
    expect(dismissHeaderPopover('utility', { type: 'pointerdown', targetPopover: null })).toBeNull()
  })

  it('closes on Escape and stays open for other keys', () => {
    expect(dismissHeaderPopover('account', { type: 'keydown', key: 'Escape' })).toBeNull()
    expect(dismissHeaderPopover('account', { type: 'keydown', key: 'Tab' })).toBe('account')
  })
})

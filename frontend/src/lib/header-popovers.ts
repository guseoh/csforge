export type HeaderPopoverId = 'utility' | 'account'

export type HeaderPopoverDismissal =
  | { type: 'pointerdown'; targetPopover: HeaderPopoverId | null }
  | { type: 'keydown'; key: string }

export function toggleHeaderPopover(activePopover: HeaderPopoverId | null, selectedPopover: HeaderPopoverId) {
  return activePopover === selectedPopover ? null : selectedPopover
}

export function dismissHeaderPopover(activePopover: HeaderPopoverId | null, event: HeaderPopoverDismissal) {
  if (activePopover === null) return null
  if (event.type === 'keydown') return event.key === 'Escape' ? null : activePopover
  return event.targetPopover === activePopover ? activePopover : null
}

import { useState } from 'react'

const LEARNING_RAIL_COLLAPSED_KEY = 'csforge.learningRail.collapsed'

function readCollapsedPreference() {
  if (typeof window === 'undefined') return false

  try {
    return window.sessionStorage.getItem(LEARNING_RAIL_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

function writeCollapsedPreference(collapsed: boolean) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(LEARNING_RAIL_COLLAPSED_KEY, String(collapsed))
  } catch {
    // Session storage may be unavailable in restricted browser contexts.
  }
}

export function useLearningRailCollapsed() {
  const [collapsed, setCollapsed] = useState(readCollapsedPreference)

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      writeCollapsedPreference(next)
      return next
    })
  }

  return { collapsed, toggleCollapsed }
}

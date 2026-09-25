import { useThemePreference } from './ThemeProvider'
import type { ThemePreference } from '../lib/theme-preference'

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: '시스템 테마' },
  { value: 'light', label: '라이트 테마' },
  { value: 'dark', label: '다크 테마' },
]

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === 'system') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3.5" y="4" width="17" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    )
  }

  if (preference === 'light') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2.5v2M12 19.5v2M4.7 4.7l1.4 1.4M17.9 17.9l1.4 1.4M2.5 12h2M19.5 12h2M4.7 19.3l1.4-1.4M17.9 6.1l1.4-1.4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.7 8.7 0 1 0 20.2 15.2Z" />
    </svg>
  )
}

export function ThemeControl() {
  const { preference, setPreference } = useThemePreference()

  return (
    <div className="theme-control" role="group" aria-label="테마">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={option.label}
          title={option.label}
          aria-pressed={preference === option.value}
          onClick={() => setPreference(option.value)}
        >
          <ThemeIcon preference={option.value} />
        </button>
      ))}
    </div>
  )
}

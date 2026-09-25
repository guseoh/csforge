import { useThemePreference } from './ThemeProvider'

const themeOptions = [
  { value: 'system', label: '시스템' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
] as const

export function UtilityMenu() {
  const { preference, setPreference } = useThemePreference()

  return (
    <details className="utility-menu">
      <summary aria-label="환경 설정 메뉴 열기">환경 설정</summary>
      <div className="utility-menu-panel" aria-label="화면 설정">
        <label className="theme-select-group">
          <span>테마</span>
          <select aria-label="테마" value={preference} onChange={(event) => setPreference(event.target.value as typeof preference)}>
            {themeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
    </details>
  )
}
